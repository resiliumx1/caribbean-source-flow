import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { useWceAccess } from "@/hooks/use-wce-access";
import { useConsultationAccess } from "@/hooks/use-consultation-access";
import { WceAdminShell } from "@/components/wce-admin/WceAdminShell";
import { Loader2, Home, Sun, Moon, Bell, ShoppingBag, MessageSquare, Wallet, AlertTriangle, Mail, Menu, ChevronRight, LogOut, MoreVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav, AdminSidebar, useRailState, type BadgeCounts } from "./AdminSidebar";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { findActiveItem, visibleGroups } from "./nav-config";

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
  const wce = useWceAccess();
  const consult = useConsultationAccess();
  const navigate = useNavigate();
  const location = useLocation();
  const isWceRoute = location.pathname.startsWith("/admin/wce");
  // A WCE organiser who is not a full store admin.
  const wceOnly = !isLoading && !wce.isLoading && !isAdmin && wce.hasWceAccess;
  const consultationOnly = true;
  const { theme, setTheme } = useTheme();
  const [unread, setUnread] = useState(0);
  const [recent, setRecent] = useState<Notification[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [paymentAlerts, setPaymentAlerts] = useState(0);
  const [pendingConsults, setPendingConsults] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const bellRef = useRef<HTMLDivElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { collapsed, setCollapsed } = useRailState();

  const groups = useMemo(
    () =>
      visibleGroups({
        isFullAdmin: false,
        hasConsultationAccess: true,
        hasWceAccess: false,
      }),
    [isAdmin, consult.hasConsultationAccess, wce.hasWceAccess],
  );
  const activeItem = useMemo(() => findActiveItem(location.pathname), [location.pathname]);
  const activeGroup = useMemo(
    () => groups.find((g) => g.items.some((i) => i.href === activeItem?.href)),
    [groups, activeItem],
  );
  const badges: BadgeCounts = {
    notifications: unread,
    paymentAlerts,
    consultations: pendingConsults,
    wholesaleLeads: newLeads,
  };

  // Counts that make the navigation communicate state, not just destinations.
  useEffect(() => {
    if (!isAdmin && !consult.hasConsultationAccess) return;
    let active = true;
    const load = async () => {
      const [consults, leads] = await Promise.all([
        // Upcoming sessions plus anything still awaiting payment — the states
        // that actually need attention.
        supabase
          .from("consultation_bookings")
          .select("id", { count: "exact", head: true })
          .neq("status", "cancelled")
          .gte("starts_at", new Date().toISOString()),
        isAdmin
          ? supabase
              .from("wholesale_leads")
              .select("id", { count: "exact", head: true })
              .eq("status", "new")
          : Promise.resolve({ count: 0 } as { count: number | null }),
      ]);
      if (!active) return;
      setPendingConsults(consults.count || 0);
      setNewLeads(leads.count || 0);
    };
    load();
    return () => { active = false; };
  }, [isAdmin, consult.hasConsultationAccess]);

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
    if (isLoading || wce.isLoading || consult.isLoading) return;
    if (!user) {
      navigate(isWceRoute ? "/wce-admin/login" : "/admin/login", { replace: true });
      return;
    }
    if (isAdmin) return; // full admins: unchanged, everything reachable
    if (wce.hasWceAccess) {
      // Organisers live only inside /admin/wce — never show them the store admin.
      if (!isWceRoute) navigate("/admin/wce", { replace: true });
      return;
    }
    if (consult.hasConsultationAccess) {
      // Consultation editors live only inside /admin/consultations.
      if (!location.pathname.startsWith("/admin/consultations")) {
        navigate("/admin/consultations", { replace: true });
      }
      return;
    }
    navigate(isWceRoute ? "/wce-admin/login" : "/", { replace: true });
  }, [user, isAdmin, isLoading, wce.isLoading, wce.hasWceAccess, consult.isLoading, consult.hasConsultationAccess, isWceRoute, location.pathname, navigate]);

  if (isLoading || wce.isLoading || consult.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Never flash admin contents before the check resolves.
  if (!user || (!isAdmin && !wce.hasWceAccess && !consult.hasConsultationAccess)) {
    return null;
  }

  if (wceOnly) {
    // Organisers get the event-branded shell with no store navigation at all.
    if (!isWceRoute) return null;
    return (
      <WceAdminShell email={user.email ?? ""} onSignOut={signOut}>
        <Outlet />
      </WceAdminShell>
    );
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();
  const scopeLabel = isAdmin
    ? "Admin"
    : consultationOnly
      ? "Consultations"
      : "Organiser";

  const scopeNote = consultationOnly ? (
    <>
      <span className="block font-medium text-foreground mb-0.5">Consultation editor</span>
      Your access covers the consultations area — bookings, session types, availability and the
      practitioner profile. Other store sections are not part of this role.
    </>
  ) : null;

  const brand = (
    <Link to={groups[0]?.items[0]?.href ?? "/admin"} className="flex items-center gap-2.5 min-w-0">
      <img
        src="/star-seal-for-lovable.png"
        alt=""
        width={28}
        height={28}
        style={{ filter: "invert(20%) sepia(40%) saturate(500%) hue-rotate(100deg) brightness(85%)" }}
      />
      <span className="leading-tight min-w-0">
        <span className="block font-bold text-sm text-foreground truncate">Mount Kailash</span>
        <span className="block text-[11px] text-muted-foreground uppercase tracking-[0.14em]">{scopeLabel}</span>
      </span>
    </Link>
  );

  const notificationsBell = isAdmin ? (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setBellOpen((o) => !o)}
        aria-label="Notifications"
        className="relative h-10 w-10 rounded-md border border-border bg-card hover:bg-muted inline-flex items-center justify-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white" style={{ background: "hsl(var(--destructive))" }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {bellOpen && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-1rem)] rounded-lg border border-border bg-card shadow-lg z-[60] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-sm font-bold text-foreground">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium hover:underline" style={{ color: "hsl(var(--primary))" }}>
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
                  style={{ background: n.is_read ? "transparent" : "hsl(var(--primary) / 0.05)" }}
                >
                  <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{n.title}</p>
                    {n.body && <p className="text-[13px] text-muted-foreground truncate mt-0.5">{n.body}</p>}
                    <p className="text-[12px] text-muted-foreground mt-1">{relativeTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full" style={{ background: "hsl(var(--destructive))" }} aria-label="Unread" />
                  )}
                </button>
              );
            })}
          </div>
          <Link
            to="/admin/notifications"
            onClick={() => setBellOpen(false)}
            className="block px-4 py-3 text-center text-[13px] font-medium border-t border-border hover:bg-muted/50"
            style={{ color: "hsl(var(--primary))" }}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  ) : null;

  const accountMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="h-10 min-h-[44px] min-w-[44px] px-2 rounded-md border border-border bg-card hover:bg-muted inline-flex items-center justify-center gap-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">{initial}</span>
          <span className="hidden xl:inline text-[13px] text-muted-foreground truncate max-w-[150px]">{user.email}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="truncate text-[13px] font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="gap-2 text-[14px]">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 text-[14px]">
          <Link to="/"><Home className="h-4 w-4" /> Back to site</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-[14px] text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const overflowMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="More admin actions"
          className="lg:hidden h-10 w-10 min-h-[44px] min-w-[44px] rounded-md border border-border bg-card hover:bg-muted inline-flex items-center justify-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem onClick={() => setPaletteOpen(true)} className="gap-2 text-[14px]">
          <Search className="h-4 w-4" /> Search pages
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild className="gap-2 text-[14px]">
            <Link to="/admin/notifications">
              <Bell className="h-4 w-4" /> Notifications
              {unread > 0 && (
                <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold text-white" style={{ background: "hsl(var(--destructive))" }}>
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="gap-2 text-[14px]">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 text-[14px]">
          <Link to="/"><Home className="h-4 w-4" /> Back to site</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <AdminSidebar
        groups={groups}
        badges={badges}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(!collapsed)}
        onOpenPalette={() => setPaletteOpen(true)}
        header={brand}
        note={scopeNote}
        footer={
          <div className="text-[12px] text-muted-foreground px-2 py-1 truncate">
            {consultationOnly ? "Consultation editor access" : "Signed in as"}{" "}
            <span className="text-foreground">{user.email}</span>
          </div>
        }
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Admin header */}
        <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2.5 min-h-[57px]">
            {/* Drawer trigger — below 1024 only */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Open navigation menu"
                  className="lg:hidden h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-md border border-border bg-card hover:bg-muted inline-flex items-center justify-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[330px] p-0 flex flex-col">
                <div className="px-4 py-3 border-b border-border">{brand}</div>
                <div className="flex-1 overflow-y-auto">
                  <AdminNav
                    groups={groups}
                    badges={badges}
                    variant="drawer"
                    onNavigate={() => setMobileOpen(false)}
                    onOpenPalette={() => { setMobileOpen(false); setPaletteOpen(true); }}
                    note={scopeNote}
                  />
                </div>
                <div className="border-t border-border p-3 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 min-h-[44px] text-[14px]" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </Button>
                  <Link to="/" onClick={() => setMobileOpen(false)} className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 min-h-[44px] text-[14px]">
                      <Home className="h-4 w-4" /> Back to site
                    </Button>
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); signOut(); }}
                    className="w-full text-left text-[14px] text-destructive hover:underline px-3 min-h-[44px]"
                  >
                    Sign out
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Breadcrumb + page title */}
            <div className="min-w-0 flex-1">
              {activeItem && (
                <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1 text-[13px] text-muted-foreground">
                  <span>{activeGroup?.label ?? "Admin"}</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  <span className="text-foreground font-medium">{activeItem.label}</span>
                </nav>
              )}
              <h1 className="text-[17px] lg:text-[20px] font-bold text-foreground truncate leading-tight">
                {activeItem?.label ?? "Admin"}
              </h1>
              {activeItem?.description && (
                <p className="hidden md:block text-[14px] text-muted-foreground truncate">{activeItem.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setPaletteOpen(true)}
                className="hidden lg:inline-flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/40 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              >
                <Search className="h-4 w-4" /> Search
                <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-sans">⌘K</kbd>
              </button>
              <span className="hidden lg:inline-flex">{notificationsBell}</span>
              {accountMenu}
              {overflowMenu}
            </div>
          </div>
        </header>

        {/* Admin content */}
        <main className="flex-1 px-4 sm:px-5 lg:px-6 py-6 lg:py-8">
          <div className="mx-auto w-full max-w-[1400px]">
            {isAdmin && paymentAlerts > 0 && !location.pathname.startsWith("/admin/payment-alerts") && (
              <Link
                to="/admin/payment-alerts"
                className="mb-6 flex items-center gap-3 rounded-lg border p-4 text-sm"
                style={{ borderColor: "hsl(var(--destructive) / 0.4)", background: "hsl(var(--destructive) / 0.08)" }}
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-destructive" />
                <span className="text-foreground">
                  <strong>{paymentAlerts}</strong> payment{paymentAlerts !== 1 ? "s were" : " was"} captured without creating an order. Review now →
                </span>
              </Link>
            )}
            <Outlet />
          </div>
        </main>
      </div>

      <AdminCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={groups} />
    </div>
  );
}
