-- Replace linked_walk_id (asymmetric self-FK) with session_id (plain UUID).
-- Joint walks share the same session_id. No FK, no primary/secondary distinction.

-- Drop the auto-linking trigger first
DROP TRIGGER IF EXISTS trigger_link_duplicate_walks ON walks;
DROP FUNCTION IF EXISTS link_duplicate_walks();

-- Add session_id column
ALTER TABLE walks ADD COLUMN session_id UUID;
CREATE INDEX idx_walks_session_id ON walks(session_id);

-- Migrate existing linked pairs: assign a shared session_id to each pair.
-- The primary walk (linked_walk_id IS NULL) and its secondary (linked_walk_id = primary.id)
-- both get the same new UUID.
WITH pairs AS (
  SELECT
    p.id AS primary_id,
    s.id AS secondary_id,
    gen_random_uuid() AS shared_session_id
  FROM walks p
  JOIN walks s ON s.linked_walk_id = p.id
)
UPDATE walks
SET session_id = pairs.shared_session_id
FROM pairs
WHERE walks.id = pairs.primary_id OR walks.id = pairs.secondary_id;

-- Update combined_miles view: count one walk per session (max miles), plus all solo walks
CREATE OR REPLACE VIEW combined_miles AS
SELECT COALESCE(SUM(miles), 0) AS total
FROM (
  SELECT MAX(miles) AS miles
  FROM walks
  GROUP BY COALESCE(session_id, id)
) sub;

-- Drop the old column
ALTER TABLE walks DROP COLUMN linked_walk_id;
