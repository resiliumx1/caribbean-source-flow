import { Link } from "react-router-dom";
import { Home, ShoppingBag, Award, Users, Mail } from "lucide-react";
import { Dock, DockIcon } from "@/components/ui/dock";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import mtKailashLogo from "@/assets/mt-kailash-logo.jpeg";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: ShoppingBag, label: "Products", href: "/shop" },
  { icon: Award, label: "Best Sellers", href: "/shop" },
  { icon: Users, label: "Retreats", href: "/retreats" },
  { icon: Mail, label: "Contact", href: "/wholesale" },
];

export function DockHeader() {
  return (
    <header className="sticky top-0 z-50 w-full py-3 px-4 backdrop-blur-md bg-background/80 border-b border-border/40 transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src={mtKailashLogo}
            alt="Mount Kailash Rejuvenation Centre"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="hidden sm:block">
            <h1 className="font-serif font-bold text-foreground leading-tight text-sm">
              Mount Kailash
            </h1>
            <p className="text-xs text-muted-foreground">
              Rejuvenation Centre
            </p>
          </div>
        </Link>

        {/* Dock Navigation */}
        <Dock
          magnification={60}
          distance={100}
          direction="middle"
          className="border-border/30 bg-background/60 dark:bg-background/40"
        >
          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link to={item.href}>
                  <DockIcon className="bg-muted/60 hover:bg-muted transition-colors">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </DockIcon>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </Dock>
      </div>
    </header>
  );
}
