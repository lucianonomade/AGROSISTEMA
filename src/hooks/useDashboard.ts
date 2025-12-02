import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export interface DailySales {
  date: string;
  total_sales: number;
  total_revenue: number;
  total_profit: number;
  sales_count: number;
}

export interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
  sales_count: number;
}

export interface PeriodStats {
  total_revenue: number;
  total_profit: number;
  total_sales: number;
  avg_ticket: number;
}

export const useDashboard = (startDate: Date, endDate: Date) => {
  const { data: dailySales = [], isLoading: loadingDaily } = useQuery({
    queryKey: ["dailySales", startDate, endDate],
    queryFn: async () => {
      const { data: sales, error } = await supabase
        .from("sales")
        .select(`
          id,
          final_amount,
          total_amount,
          discount_amount,
          created_at,
          sale_items (
            product_id,
            product_name,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .gte("created_at", startOfDay(startDate).toISOString())
        .lte("created_at", endOfDay(endDate).toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date
      const dailyMap = new Map<string, DailySales>();

      sales?.forEach((sale: any) => {
        const dateKey = format(new Date(sale.created_at), "yyyy-MM-dd");
        
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, {
            date: dateKey,
            total_sales: 0,
            total_revenue: 0,
            total_profit: 0,
            sales_count: 0,
          });
        }

        const daily = dailyMap.get(dateKey)!;
        daily.sales_count++;
        daily.total_revenue += Number(sale.final_amount);
        
        // Calculate profit (final_amount - cost)
        // We need to get cost from products
        let saleCost = 0;
        sale.sale_items?.forEach((item: any) => {
          // For now, estimate profit as 30% of revenue (will be more accurate with product cost data)
          saleCost += Number(item.subtotal) * 0.7; // Assuming 30% margin
        });
        
        daily.total_profit += Number(sale.final_amount) - saleCost;
        daily.total_sales += Number(sale.total_amount);
      });

      return Array.from(dailyMap.values()).sort((a, b) => 
        a.date.localeCompare(b.date)
      );
    },
  });

  const { data: topProducts = [], isLoading: loadingTop } = useQuery({
    queryKey: ["topProducts", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_items")
        .select(`
          product_name,
          quantity,
          subtotal,
          sales!inner(created_at)
        `)
        .gte("sales.created_at", startOfDay(startDate).toISOString())
        .lte("sales.created_at", endOfDay(endDate).toISOString());

      if (error) throw error;

      // Group by product
      const productMap = new Map<string, TopProduct>();

      data?.forEach((item: any) => {
        const name = item.product_name;
        
        if (!productMap.has(name)) {
          productMap.set(name, {
            product_name: name,
            total_quantity: 0,
            total_revenue: 0,
            sales_count: 0,
          });
        }

        const product = productMap.get(name)!;
        product.total_quantity += Number(item.quantity);
        product.total_revenue += Number(item.subtotal);
        product.sales_count++;
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);
    },
  });

  const { data: periodStats, isLoading: loadingStats } = useQuery({
    queryKey: ["periodStats", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("final_amount, total_amount, discount_amount")
        .gte("created_at", startOfDay(startDate).toISOString())
        .lte("created_at", endOfDay(endDate).toISOString());

      if (error) throw error;

      const total_revenue = data.reduce((sum, sale) => sum + Number(sale.final_amount), 0);
      const total_sales = data.length;
      const avg_ticket = total_sales > 0 ? total_revenue / total_sales : 0;
      
      // Estimate profit (will be more accurate with product cost data)
      const total_profit = total_revenue * 0.3; // Assuming 30% margin

      return {
        total_revenue,
        total_profit,
        total_sales,
        avg_ticket,
      };
    },
  });

  const { data: totalProducts = 0 } = useQuery({
    queryKey: ["totalProducts"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: lowStockCount = 0 } = useQuery({
    queryKey: ["lowStockCount"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, stock, min_stock");

      if (error) throw error;
      
      return data.filter(p => Number(p.stock) <= Number(p.min_stock)).length;
    },
  });

  return {
    dailySales,
    topProducts,
    periodStats: periodStats || {
      total_revenue: 0,
      total_profit: 0,
      total_sales: 0,
      avg_ticket: 0,
    },
    totalProducts,
    lowStockCount,
    isLoading: loadingDaily || loadingTop || loadingStats,
  };
};
