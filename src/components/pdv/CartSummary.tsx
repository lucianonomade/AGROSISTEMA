import { CartTotals } from "@/hooks/useCart";

interface CartSummaryProps {
  totals: CartTotals;
}

export const CartSummary = ({ totals }: CartSummaryProps) => {
  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal:</span>
        <span className="font-medium text-foreground">
          R$ {totals.subtotal.toFixed(2)}
        </span>
      </div>

      {totals.discountAmount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Desconto:</span>
          <span className="font-medium text-warning">
            - R$ {totals.discountAmount.toFixed(2)}
          </span>
        </div>
      )}

      <div className="pt-3 border-t border-border">
        <div className="flex justify-between">
          <span className="text-lg font-semibold text-foreground">TOTAL:</span>
          <span className="text-2xl font-bold text-primary">
            R$ {totals.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
