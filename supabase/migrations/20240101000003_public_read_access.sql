-- Allow anonymous (unauthenticated) users to read walks, profiles, and badges
CREATE POLICY "Walks are viewable publicly"
  ON walks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Profiles are viewable publicly"
  ON profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Badges are viewable publicly"
  ON user_badges FOR SELECT
  TO anon
  USING (true);
