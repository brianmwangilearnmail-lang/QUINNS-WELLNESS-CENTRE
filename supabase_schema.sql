-- Clean up existing tables (Optional: Comment these out if you want to keep your current data)
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS hero_content;

-- Products Table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  composition TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Hero Content Table (Singleton)
CREATE TABLE hero_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  title_top TEXT NOT NULL,
  title_bottom TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  main_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Table
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'completed', -- 'completed', 'pending', 'refunded'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items Table
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_sale NUMERIC NOT NULL
);

-- Inventory Batches Table
CREATE TABLE inventory_batches (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  initial_quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'good', -- 'good', 'expiring', 'expired'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Initial Hero Content
INSERT INTO hero_content (id, title_top, title_bottom, subtitle, main_image)
VALUES (1, 'BOOST YOUR', 'DAILY HEALTH', 'Elevate your daily routine with our scientifically formulated, sustainably sourced supplements.', '/images/magnesium.png')
ON CONFLICT (id) DO NOTHING;

-- Seed some Orders for Analytics (Past 30 Days)
INSERT INTO orders (customer_name, total_amount, status, created_at)
VALUES 
('John Doe', 7000, 'completed', now() - interval '2 days'),
('Jane Smith', 4500, 'completed', now() - interval '5 days'),
('Alice Brown', 3500, 'refunded', now() - interval '10 days'),
('Bob Wilson', 12000, 'completed', now() - interval '15 days'),
('Charlie Davis', 2800, 'completed', now() - interval '20 days');

-- Seed Order Items
INSERT INTO order_items (order_id, product_id, quantity, price_at_sale)
VALUES 
(1, 1, 2, 3500),
(2, 42, 1, 4500),
(3, 1, 1, 3500),
(4, 44, 1, 6500),
(4, 38, 2, 1500),
(5, 37, 1, 2800);

-- Seed Inventory Batches
INSERT INTO inventory_batches (product_id, batch_number, expiry_date, initial_quantity, remaining_quantity, status)
VALUES 
(1, 'LOT-2024-SALMON-01', '2026-12-15', 500, 150, 'good'),
(5, 'LOT-2024-MAG-05', '2026-05-20', 200, 45, 'expiring'),
(7, 'LOT-2024-B12-07', '2025-08-10', 300, 200, 'good'),
(11, 'LOT-2024-B3-11', '2026-04-30', 100, 12, 'expiring');

-- Enable Row Level Security (RLS) - Optional but recommended
-- For now, keep it simple for testing or add policies if needed.

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Schema Migration: Separate Composition and Description
-- Run this in your Supabase SQL editor to update existing tables without losing data!
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
