import { useEffect } from "react";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { Loader2, Home, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function AdminLayout() {
  const { user, isAdmin, isLoading, signOut } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/admin/login", { replace: true });
      } else if (!isAdmin) {
        navigate("/", { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-4">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/star-seal-for-lovable.png" alt="Mount Kailash" width={30} height={30} style={{ filter: 'invert(20%) sepia(40%) saturate(500%) hue-rotate(100deg) brightness(85%)' }} />
              <div className="hidden sm:block leading-tight">
                <div className="font-bold text-sm text-foreground">Mount Kailash</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Admin</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {[
                { label: 'Products', href: '/admin/products' },
                { label: 'Orders', href: '/admin/orders' },
                { label: 'Retreats', href: '/admin/retreats' },
                { label: 'Retreat Dates', href: '/admin/retreat-dates' },
                { label: 'Reviews', href: '/admin/reviews' },
                { label: 'Webinars', href: '/admin/webinars' },
                { label: 'Analytics', href: '/admin/analytics' },
              ].map((link) => {
                const isActive = location.pathname.startsWith(link.href);
                return (
                  <Link key={link.href} to={link.href} className="px-3 py-1.5 rounded-md text-sm transition-colors" style={{ fontWeight: isActive ? 700 : 400, color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', background: isActive ? 'hsl(var(--primary) / 0.08)' : 'transparent', borderBottom: isActive ? '2px solid hsl(var(--primary))' : '2px solid transparent' }}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground hidden lg:inline truncate max-w-[140px]">{user.email}</span>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
              <Link to="/"><Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"><Home className="h-3 w-3" /><span className="hidden sm:inline">Site</span></Button></Link>
              <button onClick={() => signOut()} className="text-xs text-destructive hover:underline">Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
