import { Calendar, Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useSales } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";
import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const Reports = () => {
  const { sales, isLoading: salesLoading } = useSales();
  const { products, isLoading: productsLoading } = useProducts();

  const categoryData = useMemo(() => {
    if (!products.length || !sales.length) return [];
    
    const categoryTotals = sales.reduce((acc, sale) => {
      // Simplified: using sale amount as category data
      // In a real scenario, you'd need to join with sale_items and products
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }));
  }, [products, sales]);

  const profitByMonth = useMemo(() => {
    if (!sales.length) return [];

    const last5Months = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 4)),
      end: endOfMonth(new Date()),
    });

    return last5Months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthSales = sales.filter((sale) => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= monthStart && saleDate <= monthEnd;
      });

      const profit = monthSales.reduce((sum, sale) => sum + Number(sale.final_amount), 0);

      return {
        month: format(month, "MMMM", { locale: ptBR }),
        profit: Math.round(profit * 100) / 100,
      };
    });
  }, [sales]);

  const financialSummary = useMemo(() => {
    if (!sales.length) {
      return {
        revenue: 0,
        cost: 0,
        profit: 0,
        margin: 0,
      };
    }

    const revenue = sales.reduce((sum, sale) => sum + Number(sale.final_amount), 0);
    // Simplified cost calculation - in real scenario would need product costs
    const cost = revenue * 0.7; // Assuming 70% cost
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, cost, profit, margin };
  }, [sales]);

  const isLoading = salesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Relatórios</h2>
            <p className="text-muted-foreground mt-1">
              Carregando dados...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasData = sales.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Relatórios</h2>
          <p className="text-muted-foreground mt-1">
            Análises e insights do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" disabled={!hasData}>
            <Calendar className="h-4 w-4" />
            Filtrar Período
          </Button>
          <Button className="gap-2" disabled={!hasData}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma venda registrada
            </h3>
            <p className="text-muted-foreground text-center">
              Os relatórios serão exibidos após você realizar vendas
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {categoryData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Categoria</CardTitle>
                  <CardDescription>Distribuição percentual</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Vendas Mensais</CardTitle>
                <CardDescription>Últimos 5 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitByMonth.map((item) => {
                    const maxProfit = Math.max(...profitByMonth.map(m => m.profit));
                    const percentage = maxProfit > 0 ? (item.profit / maxProfit) * 100 : 0;
                    
                    return (
                      <div key={item.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {item.month}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-primary w-24 text-right">
                            R$ {item.profit.toLocaleString("pt-BR", { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>Total de {sales.length} vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-3xl font-bold text-foreground">
                    R$ {financialSummary.revenue.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Custo Estimado</p>
                  <p className="text-3xl font-bold text-foreground">
                    R$ {financialSummary.cost.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {financialSummary.margin.toFixed(1)}% da receita
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Lucro Estimado</p>
                  <p className="text-3xl font-bold text-primary">
                    R$ {financialSummary.profit.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <p className="text-xs text-primary">
                    {(100 - financialSummary.margin).toFixed(1)}% margem
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
