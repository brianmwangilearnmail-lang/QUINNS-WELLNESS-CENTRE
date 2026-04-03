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

-- Insert Initial Hero Content
INSERT INTO hero_content (id, title_top, title_bottom, subtitle, main_image)
VALUES (1, 'BOOST YOUR', 'DAILY HEALTH', 'Elevate your daily routine with our scientifically formulated, sustainably sourced supplements.', '/images/magnesium.png')
ON CONFLICT (id) DO NOTHING;

-- Insert Initial Products
INSERT INTO products (title, brand, composition, price, image, in_stock)
VALUES 
('100% Wild Alaskan Salmon Oil', 'Natural Factors', 'Omega-3 EPA & DHA & Omega 5, 6, 7, 8 & 9 plus Astaxanthin & Vitamin D', 3500, NULL, true),
('Advanced Omega-3 Complex', 'Doppelherz', 'High Potency EPA/DHA Fish Oil', 4200, NULL, true),
('Daily Multivitamin Plus', 'Natural Factors', 'Essential Vitamins & Minerals', 2800, NULL, true),
('Vitamin C 1000mg + Zinc', 'Natural Factors', 'Immune System Support & Antioxidant', 1500, NULL, true),
('Magnesium Citrate 150mg', 'Natural Factors', 'Healthy Muscle & Heart Function - Key Lime', 2200, '/images/magnesium.png', true),
('Probiotic 30 Billion CFU', 'Natural Factors', '10 Strains for Optimal Gut Flora', 3800, NULL, true),
('Methylcobalamin B12', 'Natural Factors', 'Quick Dissolve Sublingual Tablets', 1200, '/images/b12.png', true),
('Collagen Peptides Powder', 'Natural Factors', 'Hydrolyzed Type I & III Collagen', 4500, NULL, true),
('Ashwagandha Root Extract', 'Doppelherz', 'Adaptogen for Stress & Anxiety Relief', 2600, NULL, true),
('Whey Protein Isolate', 'ABA Premium', '25g Protein for Muscle Recovery', 6500, NULL, true),
('Vitamin B3 500mg', 'Natural Factors', 'Nicotinic Acid for Energy Metabolism', 1800, '/images/vitamin-b3.png', true),
('Iron + Vitamin C', 'Doppelherz', 'Gentle Iron for Blood Health', 1400, NULL, true),
('Melatonin 5mg', 'Natural Factors', 'Natural Sleep Cycle Support', 1100, NULL, true),
('Zinc Picolinate 50mg', 'Natural Factors', 'Immune & Skin Health', 1300, NULL, true),
('L-Glutamine Powder', 'ABA Premium', 'Gut Health & Recovery', 3200, NULL, true),
('Creatine Monohydrate', 'ABA Premium', 'Muscle Power & Strength', 2500, NULL, true),
('Turmeric Curcumin', 'Doppelherz', 'Joint Support & Anti-inflammatory', 2900, NULL, true),
('CoQ10 100mg', 'Natural Factors', 'Heart Health & Energy', 4800, NULL, true),
('BCAA 2:1:1', 'ABA Premium', 'Intra-Workout Recovery', 3400, NULL, true),
('Maca Root Extract', 'Natural Factors', 'Energy & Vitality', 1900, NULL, true),
('5-HTP 100mg', 'Natural Factors', 'Emotional Well-Being & Support', 2100, '/images/5-htp.png', true),
('Glucosamine Chondroitin', 'Natural Factors', 'Joint Mobility', 3600, NULL, true),
('Pre-Workout Explosive', 'ABA Premium', 'Energy & Pump', 4500, NULL, true);

-- Enable Row Level Security (RLS) - Optional but recommended
-- For now, keep it simple for testing or add policies if needed.
