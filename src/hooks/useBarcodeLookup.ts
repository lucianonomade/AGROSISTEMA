import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ProductInfo {
    name: string;
    category?: string;
    brand?: string;
    found: boolean;
    source: string;
}

export const useBarcodeLookup = () => {
    const [isLoading, setIsLoading] = useState(false);

    const lookupBarcode = async (barcode: string): Promise<ProductInfo | null> => {
        if (!barcode || barcode.length < 8) {
            return null;
        }

        setIsLoading(true);

        try {
            // 1. Tentar Open Food Facts primeiro
            const openFoodResult = await fetchOpenFoodFacts(barcode);
            if (openFoodResult) {
                setIsLoading(false);
                return openFoodResult;
            }

            // 2. Fallback: UPC Database
            const upcResult = await fetchUPCDatabase(barcode);
            setIsLoading(false);
            return upcResult;
        } catch (error) {
            console.error("Error looking up barcode:", error);
            setIsLoading(false);
            return null;
        }
    };

    const fetchOpenFoodFacts = async (barcode: string): Promise<ProductInfo | null> => {
        try {
            const response = await fetch(
                `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
            );
            const data = await response.json();

            if (data.status === 1 && data.product) {
                const product = data.product;
                return {
                    name: product.product_name || product.product_name_pt || "",
                    category: product.categories?.split(",")[0]?.trim() || "Alimentação",
                    brand: product.brands || "",
                    found: true,
                    source: "Open Food Facts",
                };
            }
            return null;
        } catch (error) {
            console.error("Open Food Facts error:", error);
            return null;
        }
    };

    const fetchUPCDatabase = async (barcode: string): Promise<ProductInfo | null> => {
        try {
            const response = await fetch(
                `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
            );
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                return {
                    name: item.title || "",
                    category: item.category || "Outros",
                    brand: item.brand || "",
                    found: true,
                    source: "UPC Database",
                };
            }
            return null;
        } catch (error) {
            console.error("UPC Database error:", error);
            return null;
        }
    };

    return { lookupBarcode, isLoading };
};
