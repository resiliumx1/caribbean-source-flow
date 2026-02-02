-- Create retreat_gallery table for retreat image management
CREATE TABLE public.retreat_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'experience',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on retreat_gallery
ALTER TABLE public.retreat_gallery ENABLE ROW LEVEL SECURITY;

-- Policies for retreat_gallery
CREATE POLICY "Anyone can view retreat gallery" 
  ON public.retreat_gallery FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert retreat gallery" 
  ON public.retreat_gallery FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update retreat gallery" 
  ON public.retreat_gallery FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Admins can delete retreat gallery" 
  ON public.retreat_gallery FOR DELETE 
  USING (is_admin());

-- Create storage bucket for retreat images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('retreat-images', 'retreat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for retreat-images bucket
CREATE POLICY "Anyone can view retreat images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'retreat-images');

CREATE POLICY "Admins can upload retreat images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'retreat-images' AND is_admin());

CREATE POLICY "Admins can update retreat images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'retreat-images' AND is_admin());

CREATE POLICY "Admins can delete retreat images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'retreat-images' AND is_admin());

-- Add promotion columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS promotion_text TEXT,
ADD COLUMN IF NOT EXISTS promotion_badge TEXT,
ADD COLUMN IF NOT EXISTS original_price_usd NUMERIC,
ADD COLUMN IF NOT EXISTS original_price_xcd NUMERIC;

-- Create product_variants table for herb sizes
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  size_oz INTEGER NOT NULL,
  price_usd NUMERIC NOT NULL,
  price_xcd NUMERIC NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Policies for product_variants
CREATE POLICY "Anyone can view product variants" 
  ON public.product_variants FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert product variants" 
  ON public.product_variants FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product variants" 
  ON public.product_variants FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Admins can delete product variants" 
  ON public.product_variants FOR DELETE 
  USING (is_admin());

-- Add variant_id to cart_items (nullable for products without variants)
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;