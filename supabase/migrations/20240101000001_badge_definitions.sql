-- Insert initial badge definitions
INSERT INTO badge_definitions (id, name, description, icon, threshold_type, threshold_value, tier) VALUES
  ('first_walk', 'First Steps', 'Completed your first walk!', '🐾', 'total_miles', 0.1, 1),
  ('ten_miles', '10 Mile Club', 'Walked a total of 10 miles', '🥉', 'total_miles', 10, 1),
  ('half_century', 'Half Century', '50 miles walked!', '🥈', 'total_miles', 50, 2),
  ('century_club', 'Century Club', '100 miles - incredible!', '🥇', 'total_miles', 100, 3),
  ('marathon', 'Marathon Master', 'Completed a marathon distance (26.2 miles)', '🏃', 'total_miles', 26.2, 2),
  ('weekly_warrior', 'Weekly Warrior', 'Walked 10+ miles in one week', '⚡', 'weekly_miles', 10, 1),
  ('weekend_wanderer', 'Weekend Wanderer', 'Walked 5+ miles on the weekend', '🌄', 'weekly_miles', 5, 1),
  ('distance_demon', 'Distance Demon', 'Walked 250 miles total', '👹', 'total_miles', 250, 4),
  ('ultramarathon', 'Ultramarathon Ultra', '500 miles - legendary!', '🏆', 'total_miles', 500, 5)
ON CONFLICT (id) DO NOTHING;
