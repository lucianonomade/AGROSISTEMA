import { Card, CardContent } from "@/components/ui/card";
import { Banknote, CreditCard, Smartphone } from "lucide-react";

interface PaymentMethodSelectorProps {
  selected: "dinheiro" | "debito" | "credito" | "pix" | null;
  onSelect: (method: "dinheiro" | "debito" | "credito" | "pix") => void;
}

const paymentMethods = [
  { value: "dinheiro" as const, label: "Dinheiro", icon: Banknote },
  { value: "debito" as const, label: "Débito", icon: CreditCard },
  { value: "credito" as const, label: "Crédito", icon: CreditCard },
  { value: "pix" as const, label: "PIX", icon: Smartphone },
];

export const PaymentMethodSelector = ({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selected === method.value;

        return (
          <Card
            key={method.value}
            className={`cursor-pointer transition-all ${
              isSelected
                ? "border-primary bg-primary/10"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelect(method.value)}
          >
            <CardContent className="p-4 text-center">
              <Icon
                className={`h-8 w-8 mx-auto mb-2 ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p
                className={`font-medium ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {method.label}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
