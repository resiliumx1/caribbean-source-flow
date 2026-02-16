import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu, User, MessageCircle } from "lucide-react";
import mtKailashLogo from "@/assets/mt-kailash-logo.jpeg";
import { Button } from "@/components/ui/button";
import { CurrencyToggle } from "./CurrencyToggle";
import { SkyToggle } from "@/components/ui/sky-toggle";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount } = useCart();
  const { whatsappNumber, isLocalVisitor } = useStore();

  const whatsappMessage = encodeURIComponent(
    "Hello, I'd like a consultation on which products are right for me."
  );

  // Scroll listener for background transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/98 backdrop-blur-md shadow-md border-b border-border" 
          : "bg-background/95 backdrop-blur-sm border-b border-border/50"
      }`}
    >
      {/* Announcement bar */}
      {isLocalVisitor && (
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
          <span className="inline-flex items-center gap-2">
            🚚 Live in St. Lucia? Get same-day delivery. Order by 2 PM.
          </span>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={mtKailashLogo}
              alt="Mount Kailash Rejuvenation Centre"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="font-serif font-bold text-foreground leading-tight">
                Mount Kailash
              </h1>
              <p className="text-xs text-muted-foreground">
                Rejuvenation Centre
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/retreats"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Retreats
            </Link>
            <Link
              to="/school"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              School
            </Link>
            <Link
              to="/wholesale"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Wholesale
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <SkyToggle />
            </div>
            <CurrencyToggle />

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link to="/admin/login" className="hidden sm:block">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Shop
                  </Link>
                  <Link
                    to="/retreats"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Retreats
                  </Link>
                  <Link
                    to="/school"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    School
                  </Link>
                  <Link
                    to="/wholesale"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Wholesale
                  </Link>

                  <hr className="my-2" />

                  <Link
                    to="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Admin Login
                  </Link>

                  <hr className="my-2" />

                  {/* Mobile theme toggle */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-lg font-medium text-foreground">Theme</span>
                    <SkyToggle />
                  </div>

                  <hr className="my-2" />

                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-lg font-medium text-success"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat with Herbalist
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
