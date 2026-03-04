
-- Nullify products referencing categories to be deleted
UPDATE products SET category_id = NULL WHERE category_id IN (
  '5c29527e-1636-4d79-9708-343ed7094cff',
  '1f2cf49d-1fcc-428d-866d-f08b3f7dfe0f',
  '2a3da8bc-29e4-4513-bceb-acf3429c6454'
);

-- Delete categories: Energy, Digestive, Herbal Medicine
DELETE FROM product_categories WHERE id IN (
  '5c29527e-1636-4d79-9708-343ed7094cff',
  '1f2cf49d-1fcc-428d-866d-f08b3f7dfe0f',
  '2a3da8bc-29e4-4513-bceb-acf3429c6454'
);

-- Add secondary_category_id column for multi-category support
ALTER TABLE products ADD COLUMN secondary_category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL;
