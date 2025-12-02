-- Fix function search_path for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  sale_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM 6) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.sales
  WHERE sale_number LIKE 'VENDA%';
  
  sale_number := 'VENDA' || LPAD(next_number::TEXT, 6, '0');
  RETURN sale_number;
END;
$$ LANGUAGE plpgsql
SET search_path = public;