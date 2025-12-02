import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Sale {
  id: string;
  sale_number: string;
  total_amount: number;
  discount_percentage: number;
  discount_amount: number;
  final_amount: number;
  payment_method: "dinheiro" | "debito" | "credito" | "pix";
  notes?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface CreateSaleData {
  total_amount: number;
  discount_percentage: number;
  discount_amount: number;
  final_amount: number;
  payment_method: "dinheiro" | "debito" | "credito" | "pix";
  notes?: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}

export const useSales = () => {
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Sale[];
    },
  });

  const createSale = useMutation({
    mutationFn: async (saleData: CreateSaleData) => {
      // Generate sale number
      const { data: saleNumberData, error: saleNumberError } = await supabase
        .rpc("generate_sale_number");

      if (saleNumberError) throw saleNumberError;

      const saleNumber = saleNumberData as string;

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          sale_number: saleNumber,
          total_amount: saleData.total_amount,
          discount_percentage: saleData.discount_percentage,
          discount_amount: saleData.discount_amount,
          final_amount: saleData.final_amount,
          payment_method: saleData.payment_method,
          notes: saleData.notes,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = saleData.items.map((item) => ({
        sale_id: sale.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update stock for each product
      for (const item of saleData.items) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (productError) throw productError;

        const newStock = Number(product.stock) - Number(item.quantity);

        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product_id);

        if (updateError) throw updateError;
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Venda finalizada",
        description: "A venda foi registrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao finalizar venda",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getTodaySales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sales.filter((sale) => new Date(sale.created_at) >= today);
  };

  return {
    sales,
    isLoading,
    createSale: createSale.mutate,
    createSaleAsync: createSale.mutateAsync,
    isCreating: createSale.isPending,
    getTodaySales,
  };
};
