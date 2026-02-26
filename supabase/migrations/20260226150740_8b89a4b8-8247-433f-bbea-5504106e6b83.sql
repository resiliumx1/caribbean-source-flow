ALTER TABLE public.products ADD COLUMN IF NOT EXISTS woo_product_id integer;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_woo_product_id ON public.products (woo_product_id) WHERE woo_product_id IS NOT NULL;