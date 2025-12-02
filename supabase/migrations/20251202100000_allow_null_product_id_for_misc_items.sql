-- Allow null product_id in sale_items for miscellaneous items (DIVERSOS)
-- This enables selling items without product registration

-- Drop the NOT NULL constraint and foreign key
ALTER TABLE public.sale_items 
  DROP CONSTRAINT sale_items_product_id_fkey;

-- Make product_id nullable
ALTER TABLE public.sale_items 
  ALTER COLUMN product_id DROP NOT NULL;

-- Re-add foreign key constraint but only when product_id is not null
ALTER TABLE public.sale_items 
  ADD CONSTRAINT sale_items_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES public.products(id) 
  ON DELETE RESTRICT;

-- Update index to handle null values
DROP INDEX IF EXISTS idx_sale_items_product_id;
CREATE INDEX idx_sale_items_product_id ON public.sale_items(product_id) WHERE product_id IS NOT NULL;
