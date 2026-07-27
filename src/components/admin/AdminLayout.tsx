import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { Loader2, Home, Sun, Moon, Bell, ShoppingBag, MessageSquare, Wallet, AlertTriangle, Mail, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";

const NAV_LINKS = [
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Retreats', href: '/admin/retreats' },
  { label: 'Retreat Dates', href: '/admin/retreat-dates' },
  { label: 'Reviews', href: '/admin/reviews' },
  { label: 'Webinars', href: '/admin/webinars' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Payment Plans', href: '/admin/payment-plans' },
  { label: 'Wholesale Leads', href: '/admin/wholesale-leads' },
  { label: 'Payment Alerts', href: '/admin/payment-alerts' },
  { label: 'Notifications', href: '/admin/notifications' },
];

type Notification = {
  id: string;
  type: "order" | "request" | "payment" | "stock" | "message";
  title: string;
  body: string | null;
  is_read: boolean;
  related_order_id: string | null;
  created_at: string;
};

const TYPE_META: Record<string, { Icon: any; color: string; bg: string }> = {
  order:   { Icon: ShoppingBag,    color: "#15803d", bg: "#15803d18" },
  request: { Icon: MessageSquare,  color: "#1d4ed8", bg: "#1d4ed818" },
  payment: { Icon: Wallet,         color: "#15803d", bg: "#15803d18" },
  stock:   { Icon: AlertTriangle,  color: "#b45309", bg: "#b4530918" },
  message: { Icon: Mail,           color: "#6b7280", bg: "#6b728018" },
};

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminLayout() {
  const { user, isAdmin, isLoading, signOut } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [unread, setUnread] = useState(0);
  const [recent, setRecent] = useState<Notification[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [paymentAlerts, setPaymentAlerts] = useState(0);
  const bellRef = useRef<HTMLDivElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    const fetchData = async () => {
      const [{ count }, { data }, alerts] = await Promise.all([
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("failed_order_alerts").select("id", { count: "exact", head: true }).eq("resolved", false),
      ]);
      if (!active) return;
      setUnread(count || 0);
      setRecent((data as Notification[]) || []);
      setPaymentAlerts(alerts.count || 0);
    };
    fetchData();
    const channel = supabase
      .channel("notifications-bell")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "failed_order_alerts" }, fetchData)
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [isAdmin]);

  useEffect(() => {
    if (!bellOpen) return;
    const onDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setBellOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [bellOpen]);

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  };

  const handleNotifClick = async (n: Notification) => {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    setBellOpen(false);
    if (n.related_order_id) {
      navigate("/admin/orders", { state: { openOrderId: n.related_order_id } });
    }
  };

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
          <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
              <img src="/star-seal-for-lovable.png" alt="Mount Kailash" width={30} height={30} style={{ filter: 'invert(20%) sepia(40%) saturate(500%) hue-rotate(100deg) brightness(85%)' }} />
              <div className="hidden sm:block leading-tight">
                <div className="font-bold text-sm text-foreground">Mount Kailash</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Admin</div>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname.startsWith(link.href);
                const isNotif = link.href === '/admin/notifications';
                const badge = isNotif ? unread : link.href === '/admin/payment-alerts' ? paymentAlerts : 0;
                return (
                  <Link key={link.href} to={link.href} className="px-3 py-1.5 rounded-md text-sm transition-colors inline-flex items-center gap-1.5" style={{ fontWeight: isActive ? 700 : 400, color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', background: isActive ? 'hsl(var(--primary) / 0.08)' : 'transparent', borderBottom: isActive ? '2px solid hsl(var(--primary))' : '2px solid transparent' }}>
                    {link.label}
                    {badge > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white" style={{ background: 'hsl(var(--destructive))' }}>
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground hidden xl:inline truncate max-w-[140px]">{user.email}</span>
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setBellOpen(o => !o)}
                  aria-label="Notifications"
                  className="relative h-8 w-8 rounded-md border border-border bg-card hover:bg-muted inline-flex items-center justify-center text-foreground"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-bold text-white" style={{ background: 'hsl(var(--destructive))' }}>
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-1rem)] rounded-lg border border-border bg-card shadow-lg z-[60] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <span className="text-sm font-bold text-foreground">Notifications</span>
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-xs font-medium hover:underline" style={{ color: 'hsl(var(--primary))' }}>
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[420px] overflow-y-auto">
                      {recent.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <p className="text-sm text-muted-foreground">You're all caught up</p>
                        </div>
                      ) : recent.map((n) => {
                        const meta = TYPE_META[n.type] || TYPE_META.message;
                        const { Icon } = meta;
                        return (
                          <button
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                            style={{ background: n.is_read ? 'transparent' : 'hsl(var(--primary) / 0.05)' }}
                          >
                            <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                              {n.body && <p className="text-[11px] text-muted-foreground truncate mt-0.5">{n.body}</p>}
                              <p className="text-[10px] text-muted-foreground mt-1">{relativeTime(n.created_at)}</p>
                            </div>
                            {!n.is_read && (
                              <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full" style={{ background: 'hsl(var(--destructive))' }} aria-label="Unread" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <Link
                      to="/admin/notifications"
                      onClick={() => setBellOpen(false)}
                      className="block px-4 py-2.5 text-center text-xs font-medium border-t border-border hover:bg-muted/50"
                      style={{ color: 'hsl(var(--primary))' }}
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 hidden lg:inline-flex" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
              <Link to="/" className="hidden lg:inline-flex"><Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" style={{ color: '#1b4332' }}><Home className="h-4 w-4" /><span>Back to Site</span></Button></Link>
              <button onClick={() => signOut()} className="text-xs text-destructive hover:underline hidden lg:inline">Sign Out</button>

              {/* Mobile / tablet hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label="Open menu"
                    className="lg:hidden h-8 w-8 rounded-md border border-border bg-card hover:bg-muted inline-flex items-center justify-center text-foreground"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
                  <div className="px-5 py-4 border-b border-border">
                    <div className="font-bold text-sm text-foreground">Mount Kailash</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Admin</div>
                    <div className="text-xs text-muted-foreground mt-2 truncate">{user.email}</div>
                  </div>
                  <nav className="flex-1 overflow-y-auto py-2">
                    {NAV_LINKS.map((link) => {
                      const isActive = location.pathname.startsWith(link.href);
                      const isNotif = link.href === '/admin/notifications';
                      const mBadge = isNotif ? unread : link.href === '/admin/payment-alerts' ? paymentAlerts : 0;
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between gap-2 px-5 py-3 text-sm border-l-2 min-h-[44px]"
                          style={{
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                            background: isActive ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                            borderLeftColor: isActive ? 'hsl(var(--primary))' : 'transparent',
                          }}
                        >
                          <span>{link.label}</span>
                          {mBadge > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full text-[10px] font-bold text-white" style={{ background: 'hsl(var(--destructive))' }}>
                              {mBadge > 99 ? '99+' : mBadge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="border-t border-border p-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-10"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </Button>
                    <Link to="/" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-10" style={{ color: '#1b4332' }}>
                        <Home className="h-4 w-4" /> Back to Site
                      </Button>
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); signOut(); }}
                      className="w-full text-left text-sm text-destructive hover:underline px-3 py-2"
                    >
                      Sign Out
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        {paymentAlerts > 0 && !location.pathname.startsWith('/admin/payment-alerts') && (
          <Link
            to="/admin/payment-alerts"
            className="mb-6 flex items-center gap-3 rounded-lg border p-4 text-sm"
            style={{ borderColor: 'hsl(var(--destructive) / 0.4)', background: 'hsl(var(--destructive) / 0.08)' }}
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-destructive" />
            <span className="text-foreground">
              <strong>{paymentAlerts}</strong> payment{paymentAlerts !== 1 ? 's were' : ' was'} captured without creating an order. Review now →
            </span>
          </Link>
        )}
        <Outlet />
      </main>
    </div>
  );
}
