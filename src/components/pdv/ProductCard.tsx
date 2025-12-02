import { Product } from "@/hooks/useProducts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const isLowStock = product.stock <= product.min_stock;
  const profitMargin = ((product.sale_price - product.cost_price) / product.cost_price) * 100;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          {product.unit_type === "bulk" && (
            <Badge variant="secondary" className="ml-2">
              A GRANEL
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Preço:</span>
            <span className="font-semibold text-primary">
              R$ {product.sale_price.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Estoque:</span>
            <div className="flex items-center gap-2">
              <Package className={`h-4 w-4 ${isLowStock ? "text-warning" : "text-success"}`} />
              <span className={`font-semibold ${isLowStock ? "text-warning" : "text-success"}`}>
                {product.stock.toFixed(product.unit_type === "bulk" ? 3 : 0)} {product.unit_measure}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Margem:</span>
              <span className="text-sm font-bold text-success">
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
