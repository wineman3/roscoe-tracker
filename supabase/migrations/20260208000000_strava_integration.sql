-- Strava integration: connection tracking and walk source attribution

-- Table to store Strava OAuth connections per user
CREATE TABLE strava_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  strava_athlete_id BIGINT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT strava_connections_user_id_key UNIQUE (user_id),
  CONSTRAINT strava_connections_athlete_id_key UNIQUE (strava_athlete_id)
);

-- Index for webhook lookups by athlete ID
CREATE INDEX idx_strava_connections_athlete_id ON strava_connections(strava_athlete_id);

-- RLS: users can only read and delete their own connection
ALTER TABLE strava_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strava connection"
  ON strava_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strava connection"
  ON strava_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Add source and external_id to walks table
ALTER TABLE walks ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE walks ADD COLUMN external_id TEXT;

-- Partial unique index for dedup: only one walk per external_id per user
CREATE UNIQUE INDEX idx_walks_external_id_user
  ON walks(external_id, user_id)
  WHERE external_id IS NOT NULL;
