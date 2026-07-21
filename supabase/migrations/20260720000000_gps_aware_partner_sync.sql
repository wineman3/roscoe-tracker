-- Prevent false "joint walk" matches (e.g. one person's unrelated walk at lunch
-- getting linked to their partner's dog walk just because timing/mileage happened
-- to line up). Two problems with the old heuristic:
--   1. +/-2 hour window was far wider than any real joint walk: every genuine
--      trigger-matched pair in production data started within ~1 minute of
--      each other (both phones start tracking at once when walking together).
--   2. No location signal at all, so a walk at work could match a walk at home.
--
-- Fix: tighten the time window to 30 minutes, and additionally require GPS
-- start-location proximity (<= 0.25 mi) whenever both walks have coordinates.
-- Manual entries have no GPS, so they fall back to the tightened time window.

ALTER TABLE walks ADD COLUMN start_lat DOUBLE PRECISION;
ALTER TABLE walks ADD COLUMN start_lng DOUBLE PRECISION;

-- Haversine distance in miles between two lat/lng points.
CREATE OR REPLACE FUNCTION miles_between(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 3958.8 * 2 * asin(sqrt(
    sin(radians(lat2 - lat1) / 2) ^ 2 +
    cos(radians(lat1)) * cos(radians(lat2)) * sin(radians(lng2 - lng1) / 2) ^ 2
  ));
$$;

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
    AND walked_at BETWEEN NEW.walked_at - interval '30 minutes' AND NEW.walked_at + interval '30 minutes'
    AND miles BETWEEN NEW.miles * 0.8 AND NEW.miles * 1.2
    AND (
      NEW.start_lat IS NULL OR start_lat IS NULL
      OR miles_between(NEW.start_lat, NEW.start_lng, start_lat, start_lng) <= 0.25
    )
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
