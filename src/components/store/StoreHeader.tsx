import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, User, MessageCircle, DoorOpen } from "lucide-react";
import mtKailashLogo from "@/assets/mt-kailash-logo.webp";
import { Button } from "@/components/ui/button";
import { CurrencyToggle } from "./CurrencyToggle";
import { SkyToggle } from "@/components/ui/sky-toggle";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const SCHOOL_URL = "https://mount-kailash-school-temp.netlify.app";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Wholesale", to: "/wholesale" },
  { label: "Retreats", to: "/retreats" },
  { label: "School", to: SCHOOL_URL, external: true },
  { label: "The Answer", to: "/the-answer" },
  { label: "Webinars", to: "/webinars" },
];

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [gateProgress, setGateProgress] = useState(0);
  const { cartCount } = useCart();
  const { whatsappNumber, isLocalVisitor } = useStore();
  const location = useLocation();
  const prevCountRef = useRef(cartCount);
  const [cartBounce, setCartBounce] = useState(false);
  const isHomepage = location.pathname === "/";
  const [gateComplete, setGateComplete] = useState(() => {
    return !isHomepage || !!localStorage.getItem('mkrc-gate-seen');
  });

  useEffect(() => {
    if (!isHomepage) { setGateComplete(true); return; }
    if (localStorage.getItem('mkrc-gate-seen')) { setGateComplete(true); return; }
    // Listen for the definitive gate-complete event
    const handler = () => setGateComplete(true);
    window.addEventListener('gate-complete', handler);
    return () => window.removeEventListener('gate-complete', handler);
  }, [isHomepage]);

  useEffect(() => {
    if (cartCount !== prevCountRef.current && cartCount > 0) {
      setCartBounce(true);
      const timeout = setTimeout(() => setCartBounce(false), 600);
      prevCountRef.current = cartCount;
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  const whatsappMessage = encodeURIComponent(
    "Hello, I'd like a consultation on which products are right for me."
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className="sticky top-0 z-50 transition-all duration-500 border-b"
      style={{
        background: isScrolled ? 'var(--site-nav-bg)' : 'var(--site-nav-bg)',
        backdropFilter: isScrolled ? 'blur(16px)' : 'blur(8px)',
        borderColor: isScrolled ? 'var(--site-border-subtle)' : 'transparent',
        display: gateComplete ? undefined : 'none',
      }}
    >
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
          <Link to="/" className="flex items-center gap-3" aria-label="Mount Kailash home">
            <img
              src={mtKailashLogo}
              alt="Mount Kailash Rejuvenation Centre"
              className="h-10 w-10 rounded-full object-cover"
              width={40}
              height={40}
            />
            <div className="hidden sm:block">
              <span className="font-serif font-bold text-foreground leading-tight block">
                Mount Kailash
              </span>
              <span className="text-xs text-muted-foreground block">
                Rejuvenation Centre
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              if ('external' in link && link.external) {
                return (
                  <a
                    key={link.label}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium transition-colors min-h-[44px] flex items-center text-foreground hover:text-primary"
                  >
                    {link.label}
                  </a>
                );
              }
              const isActive = location.pathname === link.to || 
                (link.to !== "/" && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-sm font-medium transition-colors min-h-[44px] flex items-center ${
                    isActive 
                      ? 'text-primary border-b-2 border-primary pb-0.5' 
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              aria-label="Replay gate entrance"
              title="Replay entrance"
              onClick={() => {
                localStorage.removeItem('mkrc-gate-seen');
                window.location.href = '/';
              }}
            >
              <DoorOpen className="w-4 h-4 opacity-60" />
            </Button>
            <div className="hidden sm:block">
              <SkyToggle />
            </div>
            <CurrencyToggle />

            <Link to="/cart" className="relative" aria-label="Shopping cart">
              <Button variant="ghost" size="icon" aria-label="View cart" className={cartBounce ? "animate-bounce" : ""}>
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="default"
                    className={`absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs transition-transform ${cartBounce ? "scale-125" : "scale-100"}`}
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link to="/admin/login" className="hidden sm:block" aria-label="Admin login">
              <Button variant="ghost" size="icon" aria-label="Admin login">
                <User className="w-5 h-5" />
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72" aria-label="Mobile navigation">
                <nav className="flex flex-col gap-4 mt-8">
                  {NAV_LINKS.map((link) => {
                    if ('external' in link && link.external) {
                      return (
                        <a
                          key={link.label}
                          href={link.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-lg font-medium transition-colors min-h-[44px] flex items-center text-foreground hover:text-primary"
                        >
                          {link.label}
                        </a>
                      );
                    }
                    const isActive = location.pathname === link.to || 
                      (link.to !== "/" && location.pathname.startsWith(link.to));
                    return (
                      <Link
                        key={link.label}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg font-medium transition-colors min-h-[44px] flex items-center ${
                          isActive ? 'text-primary' : 'text-foreground hover:text-primary'
                        }`}
                      >
                        {isActive && "→ "}{link.label}
                      </Link>
                    );
                  })}

                  <hr className="my-2" />

                  <Link
                    to="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Admin Login
                  </Link>

                  <hr className="my-2" />

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
