import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, PlusCircle, TrendingUp, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface MobileNavProps {
    navItems: Array<{
        to: string;
        icon: any;
        label: string;
    }>;
}

export const MobileNav = ({ navItems }: MobileNavProps) => {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors">
                    <svg
                        className="h-6 w-6 text-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium",
                                location.pathname === item.to
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    );
};
