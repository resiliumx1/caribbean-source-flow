
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_product_type_check;
ALTER TABLE public.products ADD CONSTRAINT products_product_type_check 
  CHECK (product_type IN ('tincture', 'capsule', 'tea', 'oil', 'powder', 'bundle', 'seamoss', 'soap', 'other', 'book', 'raw_herb'));
