import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts, ProductInsert } from "@/hooks/useProducts";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  cost_price: z.number().min(0, "Preço de custo deve ser positivo"),
  sale_price: z.number().min(0, "Preço de venda deve ser positivo"),
  stock: z.number().min(0, "Estoque deve ser positivo"),
  unit_type: z.enum(["unit", "bulk"]),
  unit_measure: z.string().min(1, "Unidade de medida é obrigatória"),
  min_stock: z.number().min(0, "Estoque mínimo deve ser positivo"),
  barcode: z.string().optional().nullable(),
  is_variable_price: z.boolean().default(false),
});

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createProduct, updateProduct, products } = useProducts();

  const productToEdit = id ? products.find((p) => p.id === id) : null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      cost_price: 0,
      sale_price: 0,
      stock: 0,
      unit_type: "unit",
      unit_measure: "un",
      min_stock: 5,
      barcode: "",
      is_variable_price: false,
    },
  });

  useEffect(() => {
    if (productToEdit) {
      form.reset({
        name: productToEdit.name,
        category: productToEdit.category,
        cost_price: Number(productToEdit.cost_price),
        sale_price: Number(productToEdit.sale_price),
        stock: Number(productToEdit.stock),
        unit_type: productToEdit.unit_type as "unit" | "bulk",
        unit_measure: productToEdit.unit_measure,
        min_stock: Number(productToEdit.min_stock),
        barcode: productToEdit.barcode || "",
        is_variable_price: productToEdit.is_variable_price || false,
      });
    }
  }, [productToEdit, form]);

  const unitType = form.watch("unit_type");
  const costPrice = form.watch("cost_price");
  const salePrice = form.watch("sale_price");
  const isVariablePrice = form.watch("is_variable_price");

  const profitMargin = costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0;

  useEffect(() => {
    if (unitType === "unit") {
      form.setValue("unit_measure", "un");
    } else if (!productToEdit) {
      // Only reset if not editing, or if switching types manually
      form.setValue("unit_measure", "kg");
    }
  }, [unitType, form, productToEdit]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (id) {
      updateProduct({ id, ...data });
    } else {
      createProduct(data as ProductInsert);
    }
    navigate("/products");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {id ? "Editar Produto" : "Novo Produto"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {id ? "Atualize as informações do produto" : "Cadastre um novo produto no estoque"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ração Premium 25kg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Barras</FormLabel>
                      <FormControl>
                        <Input placeholder="Escaneie ou digite o código" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Alimentação">Alimentação</SelectItem>
                          <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                          <SelectItem value="Suplementos">Suplementos</SelectItem>
                          <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_type"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tipo de Venda</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="unit" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Unidade
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="bulk" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              A Granel
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {unitType === "bulk" && (
                  <FormField
                    control={form.control}
                    name="unit_measure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade de Medida</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Quilograma (kg)</SelectItem>
                            <SelectItem value="g">Grama (g)</SelectItem>
                            <SelectItem value="L">Litro (L)</SelectItem>
                            <SelectItem value="ml">Mililitro (ml)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="cost_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Custo (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isVariablePrice && (
                  <FormField
                    control={form.control}
                    name="sale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Venda (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade em Estoque</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={unitType === "bulk" ? "0.001" : "1"}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Mínimo (Alerta)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={unitType === "bulk" ? "0.001" : "1"}
                          placeholder="5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {costPrice > 0 && salePrice > 0 && !isVariablePrice && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Margem de Lucro:
                    </span>
                    <span
                      className={`text-2xl font-bold ${profitMargin > 0 ? "text-success" : "text-destructive"
                        }`}
                    >
                      {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/products")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {id ? "Salvar Alterações" : "Cadastrar Produto"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
