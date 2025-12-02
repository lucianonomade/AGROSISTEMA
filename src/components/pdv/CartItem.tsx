import { CartItem as CartItemType } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Tag } from "lucide-react";

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

  const isMiscellaneous = item.product.isMiscellaneous;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${isMiscellaneous ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-muted/30'}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isMiscellaneous && <Tag className="h-4 w-4 text-amber-600" />}
          <h4 className={`font-medium ${isMiscellaneous ? 'text-amber-700' : 'text-foreground'}`}>
            {item.product.name}
          </h4>
        </div>
        <p className="text-sm text-muted-foreground">
          R$ {item.product.sale_price.toFixed(2)} / {item.product.unit_measure}
        </p>
      </div>

      {!isMiscellaneous ? (
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          step={item.product.unit_type === "bulk" ? "0.001" : "1"}
          min="0"
          className="w-24 text-center"
        />
      ) : (
        <div className="w-24 text-center px-3 py-2 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">{item.quantity}</span>
        </div>
      )}

      <div className="text-right min-w-[100px]">
        <p className={`font-semibold ${isMiscellaneous ? 'text-amber-600' : 'text-primary'}`}>
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
