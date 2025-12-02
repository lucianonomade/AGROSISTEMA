import { useState, useCallback } from "react";
import { Product } from "./useProducts";

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  total: number;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);

  const addItem = useCallback((product: Product, quantity: number) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * product.sale_price,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          product,
          quantity,
          subtotal: quantity * product.sale_price,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.sale_price,
            }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountValue(0);
  }, []);

  const applyDiscount = useCallback((type: "percentage" | "fixed", value: number) => {
    setDiscountType(type);
    setDiscountValue(value);
  }, []);

  const calculateTotals = useCallback((): CartTotals => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    const total = subtotal - discountAmount;

    return {
      subtotal,
      discountAmount,
      total,
    };
  }, [items, discountType, discountValue]);

  const validateStock = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    for (const item of items) {
      if (item.quantity > item.product.stock) {
        errors.push(
          `${item.product.name}: estoque insuficiente (disponível: ${item.product.stock})`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [items]);

  return {
    items,
    discountType,
    discountValue,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount,
    calculateTotals,
    validateStock,
  };
};
