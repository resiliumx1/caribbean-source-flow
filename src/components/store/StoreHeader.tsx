import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X, User, Phone, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrencyToggle } from "./CurrencyToggle";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { whatsappNumber, isLocalVisitor } = useStore();

  const whatsappMessage = encodeURIComponent(
    "Hello, I'd like a consultation on which products are right for me."
  );

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
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
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">M</span>
            </div>
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
              to="/shop"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/shop/category/curated-bundles"
              className="bundles-highlight inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Bundles
            </Link>
            <Link
              to="/retreats"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Retreats
            </Link>
            <Link
              to="/wholesale"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Wholesale
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              Consult
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
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

            <Link to="/account" className="hidden sm:block">
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
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Shop All
                  </Link>
                  <Link
                    to="/shop/category/liquid-tinctures"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Liquid Tinctures
                  </Link>
                  <Link
                    to="/shop/category/capsules-powders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Capsules & Powders
                  </Link>
                  <Link
                    to="/shop/category/traditional-teas"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Traditional Teas
                  </Link>
                  <Link
                    to="/shop/category/curated-bundles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bundles-highlight inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold w-fit"
                  >
                    <Sparkles className="w-4 h-4" />
                    Curated Bundles
                  </Link>
                  <Link
                    to="/shop/category/raw-herbs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Raw Herbs
                  </Link>

                  <hr className="my-2" />

                  <Link
                    to="/retreats"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Retreats
                  </Link>
                  <Link
                    to="/wholesale"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Wholesale Inquiries
                  </Link>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    My Account
                  </Link>

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
