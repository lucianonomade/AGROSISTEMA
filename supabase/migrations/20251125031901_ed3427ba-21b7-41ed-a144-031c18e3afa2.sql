-- Fix the generate_sale_number function to avoid column ambiguity
CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  new_sale_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(s.sale_number FROM 6) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.sales s
  WHERE s.sale_number LIKE 'VENDA%';
  
  new_sale_number := 'VENDA' || LPAD(next_number::TEXT, 6, '0');
  RETURN new_sale_number;
END;
$$ LANGUAGE plpgsql
SET search_path = public;