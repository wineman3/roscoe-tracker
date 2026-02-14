-- Walk linking: detect when two users walk together so combined miles
-- aren't double-counted while both users keep individual credit.

ALTER TABLE walks ADD COLUMN linked_walk_id UUID REFERENCES walks(id);

-- Auto-link walks by different users that overlap in time and distance
CREATE OR REPLACE FUNCTION link_duplicate_walks()
RETURNS TRIGGER AS $$
BEGIN
  SELECT id INTO NEW.linked_walk_id
  FROM walks
  WHERE user_id != NEW.user_id
    AND walked_at BETWEEN NEW.walked_at - INTERVAL '30 minutes'
                      AND NEW.walked_at + INTERVAL '30 minutes'
    AND miles BETWEEN NEW.miles * 0.8 AND NEW.miles * 1.2
    AND linked_walk_id IS NULL
  ORDER BY ABS(EXTRACT(EPOCH FROM (walked_at - NEW.walked_at)))
  LIMIT 1;

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
