-- Reroute to Chicago as final destination, add personal Ohio milestones
-- (Norwalk OH hometown, Cedar Point, Akron, Toledo, Cleveland, Detroit)
DELETE FROM destination_milestones;

INSERT INTO destination_milestones (order_index, from_city, to_city, state, distance_miles, cumulative_miles, fun_message, icon) VALUES
  -- Ultra-local Columbus milestones
  (1,  'Home',              'Grandview Heights', 'OH', 2,    2,    'First neighborhood down! Roscoe is on the move! 🏡', '🏡'),
  (2,  'Grandview Heights', 'OSU Campus',        'OH', 2,    4,    'Go Bucks! Roscoe visited The Horseshoe! 🏈', '🏈'),
  (3,  'OSU Campus',        'Short North',       'OH', 1,    5,    'Arts district vibes! Roscoe is cultured! 🎨', '🎨'),
  (4,  'Short North',       'Downtown Columbus', 'OH', 1.5,  6.5,  'State capitol reached! Roscoe for governor! 🏛️', '🏛️'),
  (5,  'Downtown Columbus', 'German Village',    'OH', 1.5,  8,    'Brick streets and Book Loft! Roscoe loves to read! 📚', '📚'),
  (6,  'German Village',    'Grove City',        'OH', 4,    12,   'South side! Roscoe is leaving Columbus! 🛍️', '🛍️'),
  -- Southern Ohio
  (7,  'Grove City',        'Harrisburg',        'OH', 6,    18,   'Rural Ohio! Roscoe smells fresh air! 🌾', '🌾'),
  (8,  'Harrisburg',        'Circleville',       'OH', 12,   30,   'Pumpkin Show capital! Roscoe wants pie! 🎃', '🎃'),
  (9,  'Circleville',       'Chillicothe',       'OH', 22,   52,   'Ohio''s first capital! Roscoe is making history! 🏛️', '🏛️'),
  (10, 'Chillicothe',       'Bainbridge',        'OH', 13,   65,   'Paint Creek country! Roscoe loves the trails! 🦌', '🦌'),
  (11, 'Bainbridge',        'Hillsboro',         'OH', 15,   80,   'Highland County! Roscoe is climbing! ⛰️', '⛰️'),
  -- Personal Ohio milestones
  (12, 'Hillsboro',         'Norwalk',           'OH', 5,    85,   'Home sweet home! Roscoe made it back to where it all began! 🏠', '🏠'),
  (13, 'Norwalk',           'Cedar Point',       'OH', 10,   95,   'America''s Roller Coast! Roscoe is ready to ride! 🎢', '🎢'),
  (14, 'Cedar Point',       'Wilmington',        'OH', 3,    98,   'Home of the air park! Roscoe is cleared for takeoff! ✈️', '✈️'),
  (15, 'Wilmington',        'Cincinnati',        'OH', 18,   116,  'Queen City reached! Time for skyline chili! 🌭', '🌭'),
  -- Northern Ohio
  (16, 'Cincinnati',        'Akron',             'OH', 14,   130,  'Rubber City! LeBron''s hometown! Roscoe is a champion! 👑', '👑'),
  (17, 'Akron',             'Toledo',            'OH', 15,   145,  'Glass City! Home of the Mud Hens! Roscoe tips his cap! ⚾', '⚾'),
  (18, 'Toledo',            'Cleveland',         'OH', 10,   155,  'Rock and Roll Hall of Fame! Roscoe has great taste in music! 🎸', '🎸'),
  (19, 'Cleveland',         'Detroit',           'MI', 45,   200,  'Motor City! Motown! Roscoe''s got rhythm! 🎵', '🎵'),
  -- Midwest
  (20, 'Detroit',           'Louisville',        'KY', 16,   216,  'Derby City! Roscoe is ready to race! 🏇', '🏇'),
  (21, 'Louisville',        'Indianapolis',      'IN', 114,  330,  'Racing Capital! Gentledogs, start your engines! 🏁', '🏁'),
  (22, 'Indianapolis',      'Champaign',         'IL', 115,  445,  'University town! Roscoe aced his classes! 🌽', '🌽'),
  (23, 'Champaign',         'Chicago',           'IL', 69,   514,  'The Windy City! Roscoe made it to the end! 🌆', '🌆');
