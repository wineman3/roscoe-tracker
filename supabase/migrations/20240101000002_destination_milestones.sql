-- Insert destination milestones starting from Columbus, OH
INSERT INTO destination_milestones (order_index, from_city, to_city, state, distance_miles, cumulative_miles, fun_message, icon) VALUES
  (1, 'Columbus', 'Cincinnati', 'OH', 116, 116, 'Roscoe made it to the Queen City! Time for some skyline chili! 🌭', '🏙️'),
  (2, 'Cincinnati', 'Louisville', 'KY', 100, 216, 'Roscoe is ready for the Kentucky Derby! 🐴', '🏇'),
  (3, 'Louisville', 'Indianapolis', 'IN', 114, 330, 'Roscoe reached the Racing Capital! Vroom vroom! 🏎️', '🏁'),
  (4, 'Indianapolis', 'Chicago', 'IL', 184, 514, 'The Windy City! Roscoe better hold onto his collar! 💨', '🌆'),
  (5, 'Chicago', 'Madison', 'WI', 147, 661, 'Cheese curds for everyone! Roscoe loves Wisconsin! 🧀', '🧀'),
  (6, 'Madison', 'Minneapolis', 'MN', 266, 927, 'Land of 10,000 Lakes! Roscoe is ready to swim! 🏊', '🌊'),
  (7, 'Minneapolis', 'Sioux Falls', 'SD', 241, 1168, 'Gateway to the West! Roscoe is going places! 🌾', '🗻'),
  (8, 'Sioux Falls', 'Denver', 'CO', 619, 1787, 'Mile High City! Roscoe needs extra water! 🏔️', '⛰️'),
  (9, 'Denver', 'Salt Lake City', 'UT', 525, 2312, 'Great Salt Lake! Roscoe is floating! 🏔️', '🧂'),
  (10, 'Salt Lake City', 'Las Vegas', 'NV', 421, 2733, 'What happens in Vegas... Roscoe still tells! 🎰', '🎲'),
  (11, 'Las Vegas', 'Los Angeles', 'CA', 270, 3003, 'Hollywood! Roscoe is ready for his close-up! 🎬', '🌟'),
  (12, 'Los Angeles', 'San Francisco', 'CA', 382, 3385, 'Golden Gate reached! Roscoe crossed the bridge! 🌉', '🌁')
ON CONFLICT (order_index) DO NOTHING;
