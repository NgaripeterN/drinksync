DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- Recreate Users table with name and email
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer'
);

-- Insert admin user with name and email
INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@drinksync.com', '$2b$10$8myCMZHx7bEEBs0CdpYM1uVAKn95EQA0UbdXUE68xoSX4TREvNJ0W', 'admin');

-- Create Branches table
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL
);

-- Insert initial branch data (Headquarters and other branches)
INSERT INTO branches (name, location) VALUES
('Headquarters', 'Nairobi'),
('Kisumu Branch', 'Kisumu'),
('Mombasa Branch', 'Mombasa'),
('Nakuru Branch', 'Nakuru'),
('Eldoret Branch', 'Eldoret');


-- Create Drinks table
CREATE TABLE drinks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Insert initial drink data
INSERT INTO drinks (name, price) VALUES
('Coke', 70.00),
('Fanta', 70.00),
('Sprite', 70.00);

-- Create Inventory table
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    drink_id INTEGER NOT NULL REFERENCES drinks(id),
    stock INTEGER NOT NULL DEFAULT 0,
    UNIQUE(branch_id, drink_id)
);

-- Initialize inventory for Headquarters with some stock
INSERT INTO inventory (branch_id, drink_id, stock)
SELECT
    (SELECT id FROM branches WHERE name = 'Headquarters'),
    id,
    1000 -- Initial stock for each drink at HQ
FROM drinks;

-- Initialize inventory for other branches with 0 stock initially
INSERT INTO inventory (branch_id, drink_id, stock)
SELECT
    b.id,
    d.id,
    0
FROM branches b, drinks d
WHERE b.name != 'Headquarters';


-- Create Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending', -- e.g., 'pending', 'paid', 'failed'
    mpesa_receipt_code VARCHAR(255),
    checkout_request_id VARCHAR(255) UNIQUE -- Mpesa specific
);

-- Create OrderItems table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    drink_id INTEGER NOT NULL REFERENCES drinks(id),
    quantity INTEGER NOT NULL,
    price_at_order DECIMAL(10, 2) NOT NULL
);

-- Create Payments table (for Mpesa transactions)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    mpesa_receipt_code VARCHAR(255) UNIQUE,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    phone_number VARCHAR(20)
);