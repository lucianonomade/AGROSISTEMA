-- Add is_variable_price column to products table
ALTER TABLE public.products 
ADD COLUMN is_variable_price BOOLEAN NOT NULL DEFAULT false;

-- Create index for performance
CREATE INDEX idx_products_is_variable_price ON public.products(is_variable_price);
