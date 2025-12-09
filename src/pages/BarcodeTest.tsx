import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BarcodeTest = () => {
    const [barcode, setBarcode] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const testOpenFoodFacts = async () => {
        setLoading(true);
        setResults(null);

        try {
            const response = await fetch(
                `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
            );
            const data = await response.json();

            if (data.status === 1) {
                setResults({
                    api: "Open Food Facts",
                    found: true,
                    data: {
                        nome: data.product.product_name || "N/A",
                        marca: data.product.brands || "N/A",
                        categorias: data.product.categories || "N/A",
                        imagem: data.product.image_url || null,
                    },
                    raw: data.product,
                });
                toast({
                    title: "Produto encontrado!",
                    description: `${data.product.product_name}`,
                });
            } else {
                setResults({
                    api: "Open Food Facts",
                    found: false,
                    message: "Produto não encontrado nesta API",
                });
                toast({
                    title: "Não encontrado",
                    description: "Produto não está no banco de dados Open Food Facts",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Erro na API",
                description: "Erro ao consultar Open Food Facts",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const testUPCDatabase = async () => {
        setLoading(true);
        setResults(null);

        try {
            const response = await fetch(
                `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
            );
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                setResults({
                    api: "UPC Database",
                    found: true,
                    data: {
                        nome: item.title || "N/A",
                        marca: item.brand || "N/A",
                        categoria: item.category || "N/A",
                        descrição: item.description || "N/A",
                    },
                    raw: item,
                });
                toast({
                    title: "Produto encontrado!",
                    description: `${item.title}`,
                });
            } else {
                setResults({
                    api: "UPC Database",
                    found: false,
                    message: "Produto não encontrado nesta API",
                });
                toast({
                    title: "Não encontrado",
                    description: "Produto não está no banco de dados UPC",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Erro na API",
                description: "Erro ao consultar UPC Database",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    Teste de API - Código de Barras
                </h2>
                <p className="text-muted-foreground mt-1">
                    Teste se as APIs públicas retornam dados dos seus produtos
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Digite um Código de Barras</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ex: 7891234567890"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && barcode) {
                                    testOpenFoodFacts();
                                }
                            }}
                        />
                        <Button
                            onClick={testOpenFoodFacts}
                            disabled={!barcode || loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={testOpenFoodFacts}
                            disabled={!barcode || loading}
                            className="flex-1"
                            variant="outline"
                        >
                            Testar Open Food Facts
                        </Button>
                        <Button
                            onClick={testUPCDatabase}
                            disabled={!barcode || loading}
                            className="flex-1"
                            variant="outline"
                        >
                            Testar UPC Database
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Resultado - {results.api}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {results.found ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(results.data).map(([key, value]: [string, any]) => (
                                        <div key={key}>
                                            <p className="text-sm font-medium text-muted-foreground capitalize">
                                                {key}
                                            </p>
                                            {key === "imagem" && value ? (
                                                <img
                                                    src={value}
                                                    alt="Produto"
                                                    className="mt-2 max-w-[200px] rounded-lg"
                                                />
                                            ) : (
                                                <p className="text-base font-semibold">{value}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <details className="mt-4">
                                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                                        Ver dados completos (JSON)
                                    </summary>
                                    <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto text-xs">
                                        {JSON.stringify(results.raw, null, 2)}
                                    </pre>
                                </details>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">{results.message}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-100">
                        💡 Dicas de Teste
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                    <p>• Teste com códigos de barras de produtos que você vende</p>
                    <p>• Open Food Facts: melhor para alimentos e bebidas</p>
                    <p>• UPC Database: produtos em geral (100 consultas/dia grátis)</p>
                    <p>• Se não encontrar, você pode cadastrar manualmente</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default BarcodeTest;
