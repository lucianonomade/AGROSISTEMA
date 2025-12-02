import { useState } from "react";
import { DollarSign, Package, TrendingUp, ShoppingCart, AlertTriangle } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useDashboard } from "@/hooks/useDashboard";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { startOfDay, subDays, subMonths, subYears, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  const {
    dailySales,
    topProducts,
    periodStats,
    totalProducts,
    lowStockCount,
    isLoading,
  } = useDashboard(startDate, endDate);

  const handlePresetSelect = (preset: "today" | "week" | "month" | "year") => {
    const end = new Date();
    let start = new Date();

    switch (preset) {
      case "today":
        start = startOfDay(new Date());
        break;
      case "week":
        start = subDays(end, 7);
        break;
      case "month":
        start = subDays(end, 30);
        break;
      case "year":
        start = subYears(end, 1);
        break;
    }

    setStartDate(start);
    setEndDate(end);
  };

  // Format data for charts
  const chartData = dailySales.map((day) => ({
    date: format(new Date(day.date), "dd/MMM", { locale: ptBR }),
    receita: Number(day.total_revenue.toFixed(2)),
    lucro: Number(day.total_profit.toFixed(2)),
  }));

  const topProductsChart = topProducts.map((product) => ({
    name: product.product_name.length > 20 
      ? product.product_name.substring(0, 20) + "..." 
      : product.product_name,
    vendas: Number(product.total_revenue.toFixed(2)),
    quantidade: Number(product.total_quantity.toFixed(2)),
  }));

  // Calculate comparison with previous period
  const periodDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const stats = [
    {
      title: "Receita Total",
      value: `R$ ${periodStats.total_revenue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      trend: `${periodStats.total_sales} vendas no período`,
      trendUp: true,
    },
    {
      title: "Lucro Estimado",
      value: `R$ ${periodStats.total_profit.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      trend: `Margem: ${periodStats.total_revenue > 0 ? ((periodStats.total_profit / periodStats.total_revenue) * 100).toFixed(1) : 0}%`,
      trendUp: true,
    },
    {
      title: "Ticket Médio",
      value: `R$ ${periodStats.avg_ticket.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: ShoppingCart,
      trend: `${periodStats.total_sales} vendas`,
      trendUp: true,
    },
    {
      title: "Produtos em Estoque",
      value: totalProducts.toString(),
      icon: Package,
      trend: lowStockCount > 0 ? `${lowStockCount} com estoque baixo` : "Estoque OK",
      trendUp: lowStockCount === 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Análise de {format(startDate, "dd/MM/yyyy")} até {format(endDate, "dd/MM/yyyy")}
          </p>
        </div>
        <PeriodSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(date) => date && setStartDate(date)}
          onEndDateChange={(date) => date && setEndDate(date)}
          onPresetSelect={handlePresetSelect}
        />
      </div>

      {lowStockCount > 0 && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-semibold text-foreground">
                  Atenção: {lowStockCount} produto{lowStockCount > 1 ? "s" : ""} com estoque baixo
                </p>
                <p className="text-sm text-muted-foreground">
                  Verifique a página de produtos para repor o estoque
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita e Lucro Diário</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma venda no período selecionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) =>
                      `R$ ${value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Receita"
                  />
                  <Line
                    type="monotone"
                    dataKey="lucro"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    name="Lucro"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProductsChart.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma venda no período selecionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "vendas") {
                        return [
                          `R$ ${value.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                          "Receita",
                        ];
                      }
                      return [value, "Quantidade"];
                    }}
                  />
                  <Bar
                    dataKey="vendas"
                    fill="hsl(var(--primary))"
                    radius={[0, 8, 8, 0]}
                    name="vendas"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold text-foreground">
                {periodStats.total_sales}
              </p>
              <p className="text-xs text-muted-foreground">
                {(periodStats.total_sales / periodDays).toFixed(1)} vendas/dia em média
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-primary">
                R${" "}
                {periodStats.total_revenue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                R$ {(periodStats.total_revenue / periodDays).toFixed(2)} em média por dia
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Lucro Estimado</p>
              <p className="text-2xl font-bold text-success">
                R${" "}
                {periodStats.total_profit.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                Margem de{" "}
                {periodStats.total_revenue > 0
                  ? ((periodStats.total_profit / periodStats.total_revenue) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
