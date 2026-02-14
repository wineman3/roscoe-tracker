-- Update walk linking: widen window to ±4 hours and ensure the longer
-- walk counts for combined miles (shorter walk gets linked).

CREATE OR REPLACE FUNCTION link_duplicate_walks()
RETURNS TRIGGER AS $$
DECLARE
  match_id UUID;
  match_miles NUMERIC;
BEGIN
  SELECT id, miles INTO match_id, match_miles
  FROM walks
  WHERE user_id != NEW.user_id
    AND walked_at BETWEEN NEW.walked_at - INTERVAL '4 hours'
                      AND NEW.walked_at + INTERVAL '4 hours'
    AND miles BETWEEN NEW.miles * 0.8 AND NEW.miles * 1.2
    AND linked_walk_id IS NULL
  ORDER BY ABS(EXTRACT(EPOCH FROM (walked_at - NEW.walked_at)))
  LIMIT 1;

  IF match_id IS NOT NULL THEN
    IF NEW.miles <= match_miles THEN
      -- New walk is shorter/equal: link it to the existing (longer) walk
      NEW.linked_walk_id := match_id;
    ELSE
      -- New walk is longer: link the existing (shorter) walk to the new one
      UPDATE walks SET linked_walk_id = NEW.id WHERE id = match_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix existing unlinked walk pairs: for walks by different users within
-- ±4 hours and ±20% distance, link the shorter one.
WITH pairs AS (
  SELECT
    a.id AS a_id, a.miles AS a_miles,
    b.id AS b_id, b.miles AS b_miles
  FROM walks a
  JOIN walks b ON a.user_id != b.user_id
    AND b.walked_at BETWEEN a.walked_at - INTERVAL '4 hours'
                        AND a.walked_at + INTERVAL '4 hours'
    AND b.miles BETWEEN a.miles * 0.8 AND a.miles * 1.2
    AND a.id < b.id  -- avoid processing both directions
  WHERE a.linked_walk_id IS NULL
    AND b.linked_walk_id IS NULL
)
UPDATE walks
SET linked_walk_id = CASE
  WHEN walks.id = pairs.a_id AND pairs.a_miles <= pairs.b_miles THEN pairs.b_id
  WHEN walks.id = pairs.b_id AND pairs.b_miles < pairs.a_miles THEN pairs.a_id
END
FROM pairs
WHERE (walks.id = pairs.a_id AND pairs.a_miles <= pairs.b_miles)
   OR (walks.id = pairs.b_id AND pairs.b_miles < pairs.a_miles);
