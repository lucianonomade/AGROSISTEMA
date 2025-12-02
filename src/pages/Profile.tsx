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
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { LogOut, User } from "lucide-react";

const profileSchema = z.object({
    fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

const passwordSchema = z.object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            avatarUrl: "",
        },
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        const getProfile = async () => {
            try {
                console.log("Fetching user profile...");
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error) {
                    console.error("Error fetching user:", error);
                    toast.error("Erro ao carregar perfil: " + error.message);
                    navigate("/auth");
                    return;
                }

                if (user) {
                    console.log("User found:", user.email);
                    setUserEmail(user.email || "");
                    profileForm.reset({
                        fullName: user.user_metadata?.full_name || "",
                        avatarUrl: user.user_metadata?.avatar_url || "",
                    });
                } else {
                    console.log("No user found, redirecting...");
                    navigate("/auth");
                }
            } catch (error) {
                console.error("Unexpected error:", error);
            } finally {
                setIsPageLoading(false);
            }
        };
        getProfile();
    }, [navigate, profileForm]);

    if (isPageLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">Carregando perfil...</p>
            </div>
        );
    }

    const onUpdateProfile = async (values: ProfileFormValues) => {
        try {
            setIsLoading(true);
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: values.fullName,
                    avatar_url: values.avatarUrl,
                },
            });

            if (error) throw error;
            toast.success("Perfil atualizado com sucesso!");
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar perfil");
        } finally {
            setIsLoading(false);
        }
    };

    const onUpdatePassword = async (values: PasswordFormValues) => {
        try {
            setIsLoading(true);
            const { error } = await supabase.auth.updateUser({
                password: values.password,
            });

            if (error) throw error;
            toast.success("Senha atualizada com sucesso!");
            passwordForm.reset();
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar senha");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate("/auth");
        } catch (error) {
            toast.error("Erro ao sair");
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações de Perfil</h2>
                <p className="text-muted-foreground">
                    Gerencie suas informações pessoais e segurança.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações Pessoais
                    </CardTitle>
                    <CardDescription>
                        Atualize seu nome e foto de perfil.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input value={userEmail} disabled className="bg-muted" />
                            </div>

                            <FormField
                                control={profileForm.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Seu nome" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={profileForm.control}
                                name="avatarUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL da Foto (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isLoading}>
                                Salvar Alterações
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>
                        Alterar sua senha de acesso.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nova Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Nova Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isLoading}>
                                Atualizar Senha
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="pt-4">
                <Button
                    variant="destructive"
                    className="w-full sm:w-auto gap-2"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sair da Conta
                </Button>
            </div>
        </div>
    );
};

export default Profile;
