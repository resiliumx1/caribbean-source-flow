-- Add additional_images column to products table for multi-image support
ALTER TABLE public.products 
ADD COLUMN additional_images text[] DEFAULT '{}';

-- Add a comment explaining the column usage
COMMENT ON COLUMN public.products.additional_images IS 'Array of up to 3 additional image URLs. Primary image remains in image_url column.';