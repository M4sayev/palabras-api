INSERT INTO users (name, email) VALUES
('Alice Smith', 'alice@example.com'),
('Bob Jones', 'bob@example.com');

INSERT INTO categories (name, description) VALUES 
('nouns', 'People, places, things, or ideas.'),
('verbs', 'Action words or states of being.');

INSERT INTO words (word) VALUES
('bebra'),
('to bebra'),
('meow');

INSERT INTO meanings (word_id, category_id, definition, example_sentence) VALUES 
(1, 1, 'The occurrence of events by chance in a happy or beneficial way.', 'We found the charming little restaurant by pure serendipity.'),
(2, 2, 'Things that exist or are used for only a very short time.', 'The ephemeral beauty of cherry blossoms lasts for just a few weeks.'),
(3, 2, 'To make something clear; to explain.', 'The teacher used a simple diagram to elucidate the complex concept.');