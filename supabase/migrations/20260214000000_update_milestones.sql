-- Replace milestone data with denser local stops for more frequent rewards
-- Starting from Upper Arlington, OH through Columbus neighborhoods,
-- then south through Ohio and west to San Francisco
DELETE FROM destination_milestones;

INSERT INTO destination_milestones (order_index, from_city, to_city, state, distance_miles, cumulative_miles, fun_message, icon) VALUES
  -- Ultra-local Columbus milestones
  (1,  'Home',             'Grandview Heights', 'OH', 2,    2,    'First neighborhood down! Roscoe is on the move! 🏡', '🏡'),
  (2,  'Grandview Heights', 'OSU Campus',       'OH', 2,    4,    'Go Bucks! Roscoe visited The Horseshoe! 🏈', '🏈'),
  (3,  'OSU Campus',        'Short North',      'OH', 1,    5,    'Arts district vibes! Roscoe is cultured! 🎨', '🎨'),
  (4,  'Short North',       'Downtown Columbus','OH', 1.5,  6.5,  'State capitol reached! Roscoe for governor! 🏛️', '🏛️'),
  (5,  'Downtown Columbus', 'German Village',   'OH', 1.5,  8,    'Brick streets and Book Loft! Roscoe loves to read! 📚', '📚'),
  (6,  'German Village',    'Grove City',       'OH', 4,    12,   'South side! Roscoe is leaving Columbus! 🛍️', '🛍️'),
  -- Southern Ohio
  (7,  'Grove City',        'Harrisburg',       'OH', 6,    18,   'Rural Ohio! Roscoe smells fresh air! 🌾', '🌾'),
  (8,  'Harrisburg',        'Circleville',      'OH', 12,   30,   'Pumpkin Show capital! Roscoe wants pie! 🎃', '🎃'),
  (9,  'Circleville',       'Chillicothe',      'OH', 22,   52,   'Ohio''s first capital! Roscoe is making history! 🏛️', '🏛️'),
  (10, 'Chillicothe',       'Bainbridge',       'OH', 13,   65,   'Paint Creek country! Roscoe loves the trails! 🦌', '🦌'),
  (11, 'Bainbridge',        'Hillsboro',        'OH', 15,   80,   'Highland County! Roscoe is climbing! ⛰️', '⛰️'),
  (12, 'Hillsboro',         'Wilmington',       'OH', 18,   98,   'Home of the air park! Roscoe is cleared for takeoff! ✈️', '✈️'),
  (13, 'Wilmington',        'Cincinnati',       'OH', 18,   116,  'Queen City reached! Time for skyline chili! 🌭', '🌭'),
  -- Midwest
  (14, 'Cincinnati',        'Louisville',       'KY', 100,  216,  'Derby City! Roscoe is ready to race! 🏇', '🏇'),
  (15, 'Louisville',        'Indianapolis',     'IN', 114,  330,  'Racing Capital! Gentledogs, start your engines! 🏁', '🏁'),
  (16, 'Indianapolis',      'Champaign',        'IL', 115,  445,  'University town! Roscoe aced his classes! 🌽', '🌽'),
  (17, 'Champaign',         'Chicago',          'IL', 69,   514,  'Windy City! Hold onto your collar, Roscoe! 🌆', '🌆'),
  (18, 'Chicago',           'Madison',          'WI', 147,  661,  'Cheese curds for everyone! Roscoe loves Wisconsin! 🧀', '🧀'),
  -- Great Plains
  (19, 'Madison',           'Minneapolis',      'MN', 266,  927,  'Land of 10,000 Lakes! Roscoe is ready to swim! 🌊', '🌊'),
  (20, 'Minneapolis',       'Sioux Falls',      'SD', 241,  1168, 'Gateway to the West! Roscoe is going places! 🌾', '🌾'),
  (21, 'Sioux Falls',       'Rapid City',       'SD', 340,  1508, 'Black Hills country! Roscoe met the presidents! 🗻', '🗻'),
  -- Mountain West
  (22, 'Rapid City',        'Casper',           'WY', 260,  1768, 'Cowboy country! Yeehaw, Roscoe! 🤠', '🤠'),
  (23, 'Casper',            'Denver',           'CO', 19,   1787, 'Mile High City! Roscoe needs extra water! ⛰️', '⛰️'),
  (24, 'Denver',            'Vail',             'CO', 100,  1887, 'Ski country! Roscoe shreds the slopes! ⛷️', '⛷️'),
  (25, 'Vail',              'Grand Junction',   'CO', 196,  2083, 'Western slope! Desert adventures ahead! 🏜️', '🏜️'),
  (26, 'Grand Junction',    'Moab',             'UT', 32,   2115, 'Red rock paradise! Roscoe is an explorer! 🏜️', '🏜️'),
  (27, 'Moab',              'Salt Lake City',   'UT', 197,  2312, 'Great Salt Lake! Roscoe is floating! 🧂', '🧂'),
  -- West Coast
  (28, 'Salt Lake City',    'Las Vegas',        'NV', 421,  2733, 'What happens in Vegas... Roscoe still tells! 🎰', '🎰'),
  (29, 'Las Vegas',         'Bakersfield',      'CA', 161,  2894, 'Country music capital of the West! 🎸', '🎸'),
  (30, 'Bakersfield',       'Los Angeles',      'CA', 109,  3003, 'Hollywood! Roscoe is ready for his close-up! 🌟', '🌟'),
  (31, 'Los Angeles',       'San Francisco',    'CA', 382,  3385, 'Golden Gate reached! Roscoe crossed the bridge! 🌁', '🌁');
