-- ============================================================
-- 1. Fix badge notifications: allow users to mark their own as notified
--    (Without this, notified stays false forever and all badges re-fire on every walk)
-- ============================================================
CREATE POLICY "Users can update own badge notification status"
  ON user_badges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 2. Auto-sync partner walks on INSERT so manual entries get linked
--    (Previously only Strava webhook did this)
--    SECURITY DEFINER so it can update the partner's walk row (bypasses RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION sync_partner_walk_on_insert()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_user_id uuid;
  v_partner_walk_id uuid;
  v_session_id uuid;
BEGIN
  IF NEW.session_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_partner_user_id
  FROM profiles
  WHERE id != NEW.user_id
  LIMIT 1;

  IF v_partner_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_partner_walk_id
  FROM walks
  WHERE user_id = v_partner_user_id
    AND session_id IS NULL
    AND walked_at BETWEEN NEW.walked_at - interval '2 hours' AND NEW.walked_at + interval '2 hours'
    AND miles BETWEEN NEW.miles * 0.8 AND NEW.miles * 1.2
  ORDER BY walked_at ASC
  LIMIT 1;

  IF v_partner_walk_id IS NOT NULL THEN
    v_session_id := gen_random_uuid();
    NEW.session_id := v_session_id;
    UPDATE walks SET session_id = v_session_id WHERE id = v_partner_walk_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_sync_partner_walk
  BEFORE INSERT ON walks
  FOR EACH ROW
  EXECUTE FUNCTION sync_partner_walk_on_insert();


-- ============================================================
-- 3. Data fix: Link June 19 walks as a joint walk
-- ============================================================
DO $$
DECLARE
  v_walk1 record;
  v_walk2 record;
  v_session uuid := gen_random_uuid();
BEGIN
  SELECT id, user_id INTO v_walk1
  FROM walks
  WHERE (walked_at AT TIME ZONE 'America/New_York')::date = '2026-06-19'
    AND session_id IS NULL
  ORDER BY walked_at
  LIMIT 1;

  IF v_walk1.id IS NULL THEN RETURN; END IF;

  SELECT id INTO v_walk2
  FROM walks
  WHERE (walked_at AT TIME ZONE 'America/New_York')::date = '2026-06-19'
    AND session_id IS NULL
    AND user_id != v_walk1.user_id
  ORDER BY walked_at
  LIMIT 1;

  IF v_walk2.id IS NOT NULL THEN
    UPDATE walks SET session_id = v_session WHERE id IN (v_walk1.id, v_walk2.id);
  END IF;
END $$;


-- ============================================================
-- 4. Data fix: Add Andrea's walk for the June 21 1.18 mi joint walk
-- ============================================================
DO $$
DECLARE
  v_keaton_walk record;
  v_andrea_id uuid;
  v_session uuid := gen_random_uuid();
BEGIN
  SELECT id INTO v_andrea_id
  FROM profiles
  WHERE lower(display_name) LIKE '%andrea%'
  LIMIT 1;

  SELECT id, walked_at INTO v_keaton_walk
  FROM walks
  WHERE (walked_at AT TIME ZONE 'America/New_York')::date = '2026-06-21'
    AND miles BETWEEN 1.17 AND 1.19
  LIMIT 1;

  IF v_keaton_walk.id IS NOT NULL AND v_andrea_id IS NOT NULL THEN
    INSERT INTO walks (user_id, miles, source, walked_at, session_id)
    VALUES (v_andrea_id, 1.18, 'manual', v_keaton_walk.walked_at, v_session);

    UPDATE walks SET session_id = v_session WHERE id = v_keaton_walk.id;
  END IF;
END $$;
