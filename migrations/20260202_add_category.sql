-- Add category column to products table
ALTER TABLE products ADD COLUMN category text DEFAULT 'Dessert';

-- Optional: Create an index for faster filtering
CREATE INDEX idx_products_category ON products(category);
