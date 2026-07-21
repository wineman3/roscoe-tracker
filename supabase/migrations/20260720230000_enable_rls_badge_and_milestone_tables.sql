-- badge_definitions and destination_milestones were created in the initial
-- schema and seeded with data, but never had RLS enabled -- unlike every
-- other table, which got RLS at creation (see initial_schema.sql) or an
-- explicit anon-read policy (see public_read_access.sql). Both tables are
-- static reference/catalog data shown to every user, so the fix is the same
-- shape as shoebox's shoe_models: RLS on, public read-only.
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badge definitions are publicly readable"
  ON badge_definitions FOR SELECT
  USING (true);

ALTER TABLE destination_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Destination milestones are publicly readable"
  ON destination_milestones FOR SELECT
  USING (true);
