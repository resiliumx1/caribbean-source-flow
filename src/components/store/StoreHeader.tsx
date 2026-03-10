import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrencyToggle } from "./CurrencyToggle";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const NAV_LINKS = [
  { label: "For Practitioners", to: "/wholesale" },
  { label: "For Patients", to: "/retreats" },
  { label: "The Ridge", to: "/retreats" },
];

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount } = useCart();
  const { isLocalVisitor } = useStore();
  const location = useLocation();
  const prevCountRef = useRef(cartCount);
  const [cartBounce, setCartBounce] = useState(false);
  const isHomepage = location.pathname === "/";

  // Gate visibility: hidden until gate-complete on homepage first visit
  const [headerVisible, setHeaderVisible] = useState(() => {
    return !isHomepage || !!localStorage.getItem('mkrc-gate-seen');
  });

  useEffect(() => {
    if (!isHomepage) { setHeaderVisible(true); return; }
    if (localStorage.getItem('mkrc-gate-seen')) { setHeaderVisible(true); return; }
    const onComplete = () => setHeaderVisible(true);
    window.addEventListener('gate-complete', onComplete);
    return () => window.removeEventListener('gate-complete', onComplete);
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        height: '80px',
        background: isScrolled ? 'hsl(var(--mk-forest))' : 'transparent',
        borderBottom: isScrolled ? '1px solid hsl(var(--mk-gold) / 0.2)' : '1px solid transparent',
        display: headerVisible ? undefined : 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      {isLocalVisitor && (
        <div style={{ background: 'hsl(var(--mk-forest))', color: 'hsl(var(--mk-cream))', padding: '8px 16px', textAlign: 'center', fontSize: '14px' }}>
          🚚 Live in St. Lucia? Get same-day delivery. Order by 2 PM.
        </div>
      )}

      <div className="container mx-auto max-w-[1400px] px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo wordmark */}
          <Link
            to="/"
            className="font-serif"
            style={{
              fontSize: '20px',
              color: isScrolled ? 'hsl(var(--mk-cream))' : 'var(--site-text-primary)',
              transition: 'color 0.4s ease',
            }}
            aria-label="Mount Kailash home"
          >
            Mount Kailash
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to ||
                (link.to !== "/" && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="transition-colors min-h-[44px] flex items-center"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    fontWeight: 400,
                    color: isScrolled
                      ? (isActive ? 'hsl(var(--mk-gold))' : 'hsl(var(--mk-cream) / 0.8)')
                      : (isActive ? 'hsl(var(--mk-forest))' : 'var(--site-text-primary)'),
                    transition: 'color 0.3s ease',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <CurrencyToggle />

            <Link to="/cart" className="relative" aria-label="Shopping cart">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View cart"
                className={cartBounce ? "animate-bounce" : ""}
                style={{ color: isScrolled ? 'hsl(var(--mk-cream))' : 'var(--site-text-primary)' }}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge
                    className={`absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs transition-transform ${cartBounce ? "scale-125" : "scale-100"}`}
                    style={{ background: 'hsl(var(--mk-gold))', color: 'hsl(var(--mk-forest))' }}
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Request Admission CTA — desktop */}
            <Link
              to="/retreats"
              className="hidden lg:inline-flex items-center gap-2 transition-all"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '10px 24px',
                borderRadius: '2px',
                background: isScrolled ? 'hsl(var(--mk-gold))' : 'hsl(var(--mk-forest))',
                color: isScrolled ? 'hsl(var(--mk-forest))' : 'hsl(var(--mk-cream))',
                transition: 'all 0.3s ease',
              }}
            >
              Request Admission
            </Link>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  style={{ color: isScrolled ? 'hsl(var(--mk-cream))' : 'var(--site-text-primary)' }}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72" aria-label="Mobile navigation">
                <nav className="flex flex-col gap-4 mt-8">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium transition-colors min-h-[44px] flex items-center text-foreground hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <hr className="my-2" />

                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary"
                  >
                    Formulations
                  </Link>

                  <Link
                    to="/the-answer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary"
                  >
                    The Answer
                  </Link>

                  <Link
                    to="/webinars"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary"
                  >
                    Webinars
                  </Link>

                  <hr className="my-2" />

                  <Link
                    to="/retreats"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mk-btn-primary text-center justify-center"
                  >
                    Request Admission
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
