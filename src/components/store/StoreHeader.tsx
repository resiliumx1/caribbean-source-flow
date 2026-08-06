import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, User, MessageCircle, UserCircle } from "lucide-react";
import mtKailashLogo from "@/assets/mt-kailash-logo.webp";
import { Button } from "@/components/ui/button";
import { CurrencyToggle } from "./CurrencyToggle";
import { SkyToggle } from "@/components/ui/sky-toggle";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const SCHOOL_URL = "https://herbalphysicianschoolmountkailash.netlify.app";

const WCE_LABEL = "WCE 2026";

/** Scoped, self-contained styles for the single WCE nav item (no global tokens). */
const WCE_NAV_STYLES = `
.wce-nav-item{position:relative;display:inline-flex;align-items:center;gap:.5rem;color:#c9a227;transition:color .3s ease}
.wce-nav-item:hover{color:#e6c351}
.wce-nav-dot{width:6px;height:6px;border-radius:9999px;background:#c9a227;box-shadow:0 0 6px rgba(201,162,39,.55);flex:none;animation:wce-nav-breath 3s ease-in-out infinite;transform-origin:center}
.wce-nav-item:hover .wce-nav-dot{animation:none;opacity:1;transform:scale(1)}
.wce-nav-text{position:relative;background-image:linear-gradient(100deg,transparent 35%,rgba(255,236,175,.85) 50%,transparent 65%);background-size:280% 100%;background-repeat:no-repeat;background-position:180% 0;-webkit-background-clip:text;background-clip:text;animation:wce-nav-shimmer 8s ease-in-out infinite}
@keyframes wce-nav-breath{0%,100%{opacity:.45;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}
@keyframes wce-nav-shimmer{0%,88%{background-position:180% 0}100%{background-position:-80% 0}}
@media (prefers-reduced-motion: reduce){
.wce-nav-dot{animation:none;opacity:1;transform:none}
.wce-nav-text{animation:none;background-image:none}
}
`;

function WceNavLabel() {
  return (
    <span className="wce-nav-item">
      <span className="wce-nav-dot" aria-hidden="true" />
      <span className="wce-nav-text">{WCE_LABEL}</span>
    </span>
  );
}

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Wholesale", to: "/wholesale" },
  { label: "Retreats", to: "/retreats" },
  { label: "School", to: SCHOOL_URL, external: true },
  { label: "The Answer", to: "/the-answer" },
  { label: "Webinars", to: "/webinars" },
  { label: "WCE 2026", to: "/wce-2026" },
];

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount } = useCart();
  const { whatsappNumber, isLocalVisitor } = useStore();
  const location = useLocation();
  const prevCountRef = useRef(cartCount);
  const hydratedRef = useRef(false);
  const [cartBounce, setCartBounce] = useState(false);
  const isHomepage = location.pathname === "/";
  const isWceRoute = location.pathname.startsWith("/wce-2026");

  // The WCE hero uses Lenis smooth scrolling; pause it while the panel is open
  // so the page underneath cannot scroll behind the menu.
  useEffect(() => {
    if (!isWceRoute) return;
    window.dispatchEvent(new CustomEvent("wce:scroll-lock", { detail: mobileMenuOpen }));
    return () => {
      window.dispatchEvent(new CustomEvent("wce:scroll-lock", { detail: false }));
    };
  }, [isWceRoute, mobileMenuOpen]);

  // Gate visibility: hidden until gate-complete on homepage first visit
  const [headerVisible, setHeaderVisible] = useState(() => {
    return !isHomepage || !!localStorage.getItem('mkrc-gate-seen');
  });

  useEffect(() => {
    if (!isHomepage) { setHeaderVisible(true); return; }
    if (localStorage.getItem('mkrc-gate-seen')) { setHeaderVisible(true); return; }

    const onComplete = () => setHeaderVisible(true);
    window.addEventListener('gate-complete', onComplete);
    return () => {
      window.removeEventListener('gate-complete', onComplete);
    };
  }, [isHomepage]);

  useEffect(() => {
    // Skip the first settled value (cart hydrating from storage / server)
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      prevCountRef.current = cartCount;
      return;
    }
    // Animate once, only when items are actually added
    if (cartCount > prevCountRef.current) {
      prevCountRef.current = cartCount;
      setCartBounce(true);
      const timeout = setTimeout(() => setCartBounce(false), 700);
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
      className="fixed top-0 left-0 right-0 transition-all duration-500 border-b shadow-md"
      style={{
        zIndex: 9999,
        background: 'var(--site-header-bg)',
        backdropFilter: 'blur(16px)',
        borderColor: 'var(--site-header-border)',
        opacity: headerVisible ? 1 : 0,
        pointerEvents: headerVisible ? 'auto' : 'none',
        transition: 'opacity 0.6s ease, backdrop-filter 0.5s ease, border-color 0.5s ease',
        width: '100%',
      }}
    >
      <style>{WCE_NAV_STYLES}</style>
      {isLocalVisitor && (
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
          <span className="inline-flex items-center gap-2">
            📞 Live in St. Lucia? Call our local number for expedited delivery!
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
                  {link.label === WCE_LABEL ? <WceNavLabel /> : link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">


            <div className="hidden sm:block">
              <SkyToggle />
            </div>
            <CurrencyToggle />

            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/account" aria-label="My Account" title="My Account">
                <UserCircle className="w-5 h-5 text-foreground dark:text-[#f5f0e8]" />
              </Link>
            </Button>

            <Link to="/cart" className="relative" aria-label="Shopping cart">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View cart"
                className={cartBounce ? "animate-bounce [animation-iteration-count:2]" : ""}
              >
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
                <User className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={`w-72 ${isWceRoute ? "wce-mobile-nav" : ""}`}
                overlayClassName={isWceRoute ? "wce-mobile-nav-overlay" : undefined}
                aria-label="Mobile navigation"
              >
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
                        {isActive && "→ "}
                        {link.label === WCE_LABEL ? <WceNavLabel /> : link.label}
                      </Link>
                    );
                  })}

                  <hr className="my-2" />

                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left min-h-[44px] flex items-center gap-2"
                  >
                    <UserCircle className="w-5 h-5" /> My Account
                  </Link>

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
