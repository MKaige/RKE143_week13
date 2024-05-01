CREATE TABLE users(
    id serial PRIMARY KEY,
    username TEXT,
    password TEXT
);

SELECT * FROM users;

INSERT INTO users (username) VALUES ('harry');