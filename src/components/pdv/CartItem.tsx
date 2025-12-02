import { CartItem as CartItemType } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const handleQuantityChange = (value: string) => {
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity >= 0) {
      onUpdateQuantity(quantity);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{item.product.name}</h4>
        <p className="text-sm text-muted-foreground">
          R$ {item.product.sale_price.toFixed(2)} / {item.product.unit_measure}
        </p>
      </div>

      <Input
        type="number"
        value={item.quantity}
        onChange={(e) => handleQuantityChange(e.target.value)}
        step={item.product.unit_type === "bulk" ? "0.001" : "1"}
        min="0"
        className="w-24 text-center"
      />

      <div className="text-right min-w-[100px]">
        <p className="font-semibold text-primary">
          R$ {item.subtotal.toFixed(2)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
