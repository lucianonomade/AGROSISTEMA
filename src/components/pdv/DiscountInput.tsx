import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Percent, DollarSign } from "lucide-react";

interface DiscountInputProps {
  value: number;
  type: "percentage" | "fixed";
  onTypeChange: (type: "percentage" | "fixed") => void;
  onValueChange: (value: number) => void;
}

export const DiscountInput = ({
  value,
  type,
  onTypeChange,
  onValueChange,
}: DiscountInputProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleValueChange = (newValue: string) => {
    setInputValue(newValue);
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onValueChange(numValue);
    } else if (newValue === "") {
      onValueChange(0);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1 flex gap-2">
        <Button
          variant={type === "percentage" ? "default" : "outline"}
          size="icon"
          onClick={() => onTypeChange("percentage")}
        >
          <Percent className="h-4 w-4" />
        </Button>
        <Button
          variant={type === "fixed" ? "default" : "outline"}
          size="icon"
          onClick={() => onTypeChange("fixed")}
        >
          <DollarSign className="h-4 w-4" />
        </Button>
      </div>

      <Input
        type="number"
        value={inputValue}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder={type === "percentage" ? "% desconto" : "R$ desconto"}
        step={type === "percentage" ? "1" : "0.01"}
        min="0"
        max={type === "percentage" ? "100" : undefined}
        className="flex-1"
      />
    </div>
  );
};
