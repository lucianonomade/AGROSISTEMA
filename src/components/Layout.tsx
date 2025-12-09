import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, PlusCircle, TrendingUp, ShoppingCart, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/pdv", icon: ShoppingCart, label: "PDV" },
    { to: "/products", icon: Package, label: "Produtos" },
    { to: "/add-product", icon: PlusCircle, label: "Novo Produto" },
    { to: "/reports", icon: TrendingUp, label: "Relatórios" },
    { to: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav navItems={navItems} />
              <Link to="/" className="flex items-center gap-3">
                <img src={logo} alt="Morrinhos Agropecuária" className="h-12 w-12" />
                <div>
                  <h1 className="text-xl font-bold text-primary">Morrinhos</h1>
                  <p className="text-xs text-secondary font-semibold">AGROPECUÁRIA</p>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                    location.pathname === item.to
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
