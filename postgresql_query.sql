DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    budget_limit DOUBLE PRECISION DEFAULT 5000.0,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    amount DOUBLE PRECISION NOT NULL,
    type VARCHAR(255), -- 'Income' किंवा 'Expense'
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE
);

-- टेस्ट युजर 'Harsh' (ID: 1)
INSERT INTO users (user_id, username, password, budget_limit) 
VALUES (1, 'Harsh', 'pass123', 5000.0) ON CONFLICT DO NOTHING;

INSERT INTO users (user_id, username, password, email, budget_limit)
VALUES (1, 'harsh', '1234', 'harsh@example.com', 5000.0);

select * from users
select * from transactions