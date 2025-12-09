import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const authSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Check if user is already authenticated
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate("/", { replace: true });
            }
        };
        checkAuth();
    }, [navigate]);

    const onLogin = async (values: AuthFormValues) => {
        try {
            setIsLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                if (error.message === "Invalid login credentials") {
                    toast.error("Email ou senha incorretos");
                } else {
                    toast.error(error.message);
                }
                return;
            }

            toast.success("Login realizado com sucesso!");
            navigate("/");
        } catch (error) {
            toast.error("Ocorreu um erro ao fazer login");
        } finally {
            setIsLoading(false);
        }
    };

    const onRegister = async (values: AuthFormValues) => {
        try {
            setIsLoading(true);
            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Cadastro realizado! Verifique seu email para confirmar.");
        } catch (error) {
            toast.error("Ocorreu um erro ao criar conta");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">
                        Agropecuária
                    </CardTitle>
                    <CardDescription>
                        Sistema de Gestão
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Cadastro</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onLogin)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="seu@email.com"
                                                        type="email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Senha</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="******"
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Entrando..." : "Entrar"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="register">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onRegister)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="seu@email.com"
                                                        type="email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Senha</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="******"
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Cadastrando..." : "Cadastrar"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-gray-500">
                    © 2024 Agro Profit Insight
                </CardFooter>
            </Card>
        </div>
    );
};

export default Auth;
