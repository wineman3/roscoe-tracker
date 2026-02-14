-- Walk linking: detect when two users walk together so combined miles
-- aren't double-counted while both users keep individual credit.

ALTER TABLE walks ADD COLUMN linked_walk_id UUID REFERENCES walks(id);

-- Auto-link walks by different users that overlap in time and distance.
-- The shorter walk gets linked so the longer one counts in combined_miles.
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

CREATE TRIGGER trigger_link_duplicate_walks
  BEFORE INSERT ON walks
  FOR EACH ROW
  EXECUTE FUNCTION link_duplicate_walks();

-- Combined miles view: counts linked walks only once
CREATE OR REPLACE VIEW combined_miles AS
SELECT COALESCE(SUM(miles), 0) AS total
FROM walks
WHERE linked_walk_id IS NULL;
