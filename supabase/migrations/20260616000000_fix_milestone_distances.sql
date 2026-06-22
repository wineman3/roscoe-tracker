-- Fix milestone distances to reflect actual driving distance from Upper Arlington, OH
-- Cumulative miles = real distance from home to each destination
-- Cities ordered by ascending distance from Columbus
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
  (8,  'Harrisburg',        'Circleville',       'OH', 9,    27,   'Pumpkin Show capital! Roscoe wants pie! 🎃', '🎃'),
  (9,  'Circleville',       'Chillicothe',       'OH', 21,   48,   'Ohio''s first capital! Roscoe is making history! 🏛️', '🏛️'),
  (10, 'Chillicothe',       'Wilmington',        'OH', 7,    55,   'Home of the air park! Roscoe is cleared for takeoff! ✈️', '✈️'),
  (11, 'Wilmington',        'Bainbridge',        'OH', 10,   65,   'Paint Creek country! Roscoe loves the trails! 🦌', '🦌'),
  (12, 'Bainbridge',        'Hillsboro',         'OH', 10,   75,   'Highland County! Roscoe is climbing! ⛰️', '⛰️'),
  -- Personal Ohio milestones
  (13, 'Hillsboro',         'Norwalk',           'OH', 25,   100,  'Home sweet home! Roscoe made it back to where it all began! 🏠', '🏠'),
  (14, 'Norwalk',           'Cincinnati',        'OH', 5,    105,  'Queen City reached! Time for skyline chili! 🌭', '🌭'),
  (15, 'Cincinnati',        'Cedar Point',       'OH', 8,    113,  'America''s Roller Coast! Roscoe is ready to ride! 🎢', '🎢'),
  -- Northern Ohio
  (16, 'Cedar Point',       'Akron',             'OH', 14,   127,  'Rubber City! LeBron''s hometown! Roscoe is a champion! 👑', '👑'),
  (17, 'Akron',             'Cleveland',         'OH', 17,   144,  'Rock and Roll Hall of Fame! Roscoe has great taste in music! 🎸', '🎸'),
  -- Midwest
  (18, 'Cleveland',         'Indianapolis',      'IN', 29,   173,  'Racing Capital! Gentledogs, start your engines! 🏁', '🏁'),
  (19, 'Indianapolis',      'Detroit',           'MI', 28,   201,  'Motor City! Motown! Roscoe''s got rhythm! 🎵', '🎵'),
  (20, 'Detroit',           'Louisville',        'KY', 13,   214,  'Derby City! Roscoe is ready to race! 🏇', '🏇'),
  (21, 'Louisville',        'Champaign',         'IL', 80,   294,  'University town! Roscoe aced his classes! 🌽', '🌽'),
  (22, 'Champaign',         'Chicago',           'IL', 60,   354,  'The Windy City! Roscoe made it to the end! 🌆', '🌆');
