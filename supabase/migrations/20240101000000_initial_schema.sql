-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Walks table - individual walk entries
CREATE TABLE walks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  miles DECIMAL(5,2) NOT NULL CHECK (miles > 0 AND miles <= 99.99),
  notes TEXT,
  walked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges definition table
CREATE TABLE badge_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  threshold_type TEXT NOT NULL CHECK (threshold_type IN ('total_miles', 'weekly_miles', 'monthly_miles', 'streak_days')),
  threshold_value DECIMAL(10,2) NOT NULL,
  tier INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges - earned achievements
CREATE TABLE user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  badge_id TEXT REFERENCES badge_definitions(id) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

-- Destination milestones
CREATE TABLE destination_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_index INTEGER UNIQUE NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  state TEXT NOT NULL,
  distance_miles DECIMAL(10,2) NOT NULL,
  cumulative_miles DECIMAL(10,2) NOT NULL,
  fun_message TEXT NOT NULL,
  icon TEXT DEFAULT '🏁',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materialized view for user statistics (for performance)
CREATE MATERIALIZED VIEW user_stats AS
SELECT
  p.id,
  p.display_name,
  COALESCE(SUM(w.miles), 0) as total_miles,
  COUNT(w.id) as total_walks,
  MAX(w.walked_at) as last_walk_date,
  COALESCE(SUM(CASE
    WHEN w.walked_at >= DATE_TRUNC('week', NOW())
    THEN w.miles ELSE 0
  END), 0) as week_miles,
  COALESCE(SUM(CASE
    WHEN w.walked_at >= DATE_TRUNC('month', NOW())
    THEN w.miles ELSE 0
  END), 0) as month_miles
FROM profiles p
LEFT JOIN walks w ON p.id = w.user_id
GROUP BY p.id, p.display_name;

-- Indexes for performance
CREATE INDEX idx_walks_user_id ON walks(user_id);
CREATE INDEX idx_walks_walked_at ON walks(walked_at DESC);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Walks: Users can CRUD their own walks, but read all walks
CREATE POLICY "Walks are viewable by authenticated users"
  ON walks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own walks"
  ON walks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own walks"
  ON walks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own walks"
  ON walks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User badges: Read all, system manages writes
CREATE POLICY "Badges are viewable by authenticated users"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

-- Function to refresh stats (call after walk insert/update/delete)
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW user_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh stats
CREATE TRIGGER refresh_stats_on_walk_change
AFTER INSERT OR UPDATE OR DELETE ON walks
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_user_stats();

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_miles DECIMAL;
  v_week_miles DECIMAL;
  v_badge RECORD;
BEGIN
  -- Get user stats
  SELECT total_miles, week_miles INTO v_total_miles, v_week_miles
  FROM user_stats WHERE id = p_user_id;

  -- Check each badge definition
  FOR v_badge IN SELECT * FROM badge_definitions LOOP
    -- Skip if already earned
    IF NOT EXISTS (
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) THEN
      -- Check if threshold met
      IF (v_badge.threshold_type = 'total_miles' AND v_total_miles >= v_badge.threshold_value) OR
         (v_badge.threshold_type = 'weekly_miles' AND v_week_miles >= v_badge.threshold_value) THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (p_user_id, v_badge.id);
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
