import { useState } from "react";
import { Search, ShoppingCart, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useSales } from "@/hooks/useSales";
import { ProductCard } from "@/components/pdv/ProductCard";
import { CartItem } from "@/components/pdv/CartItem";
import { CartSummary } from "@/components/pdv/CartSummary";
import { DiscountInput } from "@/components/pdv/DiscountInput";
import { PaymentMethodSelector } from "@/components/pdv/PaymentMethodSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const PDV = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "dinheiro" | "debito" | "credito" | "pix" | null
  >(null);

  const { products, isLoading } = useProducts();
  const { createSaleAsync, isCreating } = useSales();
  const {
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
  } = useCart();

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotals();

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      toast({
        title: "Estoque insuficiente",
        description: `${product.name} não tem estoque disponível.`,
        variant: "destructive",
      });
      return;
    }

    addItem(product, product.unit_type === "bulk" ? 0.1 : 1);
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const product = products.find((p) => p.barcode === searchTerm);
      if (product) {
        handleAddToCart(product);
        setSearchTerm("");
      }
    }
  };

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const product = products.find((p) => p.barcode === barcodeInput);
      if (product) {
        handleAddToCart(product);
        setBarcodeInput("");
        toast({
          title: "Produto adicionado",
          description: `${product.name} foi adicionado ao carrinho.`,
        });
      } else {
        toast({
          title: "Produto não encontrado",
          description: "Nenhum produto encontrado com este código de barras.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFinalizeSale = () => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos antes de finalizar a venda.",
        variant: "destructive",
      });
      return;
    }

    const stockValidation = validateStock();
    if (!stockValidation.valid) {
      toast({
        title: "Estoque insuficiente",
        description: stockValidation.errors.join("\n"),
        variant: "destructive",
      });
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmSale = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Forma de pagamento",
        description: "Selecione uma forma de pagamento.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSaleAsync({
        total_amount: totals.subtotal,
        discount_percentage: discountType === "percentage" ? discountValue : 0,
        discount_amount: totals.discountAmount,
        final_amount: totals.total,
        payment_method: selectedPaymentMethod,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.sale_price,
          subtotal: item.subtotal,
        })),
      });

      setShowPaymentModal(false);
      setSelectedPaymentMethod(null);
      clearCart();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          PDV - Ponto de Venda
        </h2>
        <p className="text-muted-foreground mt-1">
          Sistema de vendas com controle automático de estoque
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Products */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 5v14" />
                  <path d="M8 5v14" />
                  <path d="M12 5v14" />
                  <path d="M17 5v14" />
                  <path d="M21 5v14" />
                </svg>
              </div>
              <Input
                placeholder="Escanear código de barras..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeScan}
                className="pl-10 bg-background border-primary/20 focus-visible:ring-primary"
                autoFocus
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                Carregando produtos...
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                Nenhum produto encontrado
              </p>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleAddToCart(product)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column - Cart */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Carrinho</h3>
            <span className="text-sm text-muted-foreground">
              ({items.length} {items.length === 1 ? "item" : "itens"})
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Carrinho vazio
              </p>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.product.id}
                  item={item}
                  onUpdateQuantity={(quantity) =>
                    updateQuantity(item.product.id, quantity)
                  }
                  onRemove={() => removeItem(item.product.id)}
                />
              ))
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Desconto
              </label>
              <DiscountInput
                value={discountValue}
                type={discountType}
                onTypeChange={(type) => applyDiscount(type, discountValue)}
                onValueChange={(value) => applyDiscount(discountType, value)}
              />
            </div>

            <CartSummary totals={totals} />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCart}
                disabled={items.length === 0}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button
                onClick={handleFinalizeSale}
                disabled={items.length === 0}
                className="flex-1"
              >
                Finalizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <CartSummary totals={totals} />

            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Forma de Pagamento
              </label>
              <PaymentMethodSelector
                selected={selectedPaymentMethod}
                onSelect={setSelectedPaymentMethod}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleConfirmSale} disabled={isCreating}>
              {isCreating ? "Processando..." : "Confirmar Venda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;
