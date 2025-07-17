-- Bulk update equipment sport categories
UPDATE equipment SET sport = 'Football' WHERE name IN ('Football', 'Cones', 'Whistle');
UPDATE equipment SET sport = 'Basketball' WHERE name = 'Basketball';
UPDATE equipment SET sport = 'Tennis' WHERE name IN ('Tennis Racket', 'Tennis Balls');
UPDATE equipment SET sport = 'Volleyball' WHERE name = 'Volleyball';
UPDATE equipment SET sport = 'Badminton' WHERE name IN ('Badminton Racket', 'Shuttlecocks');
UPDATE equipment SET sport = 'Table Tennis' WHERE name IN ('Table Tennis Paddle', 'Table Tennis Balls');
UPDATE equipment SET sport = 'Cricket' WHERE name IN ('Cricket Bat', 'Cricket Ball');
UPDATE equipment SET sport = 'Rugby' WHERE name = 'Rugby Ball';
UPDATE equipment SET sport = 'Hockey' WHERE name = 'Hockey Stick';
UPDATE equipment SET sport = 'Netball' WHERE name = 'Netball';
UPDATE equipment SET sport = 'Athletics' WHERE name IN ('Gym Mat', 'Jump Rope', 'Stopwatch');
UPDATE equipment SET sport = 'General' WHERE name = 'First Aid Kit' OR name = 'ball'; 