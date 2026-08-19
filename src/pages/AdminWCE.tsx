import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWceAccess } from "@/hooks/use-wce-access";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Mic2, Route as RouteIcon, ShoppingBag, Ticket, HelpCircle,
  Image as ImageIcon, Settings as SettingsIcon, ShieldCheck, LogOut, CalendarDays,
  Menu, X, Share2, Handshake, LineChart,
} from "lucide-react";
import { createPortal } from "react-dom";
import WceLeads from "@/components/admin/wce/WceLeads";
import WceSpeakers from "@/components/admin/wce/WceSpeakers";
import WcePathways from "@/components/admin/wce/WcePathways";
import WceReferralCodes from "@/components/admin/wce/WceReferralCodes";
import WceFaqs from "@/components/admin/wce/WceFaqs";
import WceMedia from "@/components/admin/wce/WceMedia";
import WceItinerary from "@/components/admin/wce/WceItinerary";
import WceSettings from "@/components/admin/wce/WceSettings";
import WceOrders from "@/components/admin/wce/WceOrders";
import WceOrganisers from "@/components/admin/wce/WceOrganisers";
import WceShareKit from "@/components/admin/wce/WceShareKit";
import WcePartners from "@/components/admin/wce/WcePartners";
import WceAnalytics from "@/components/admin/wce/WceAnalytics";
import { ConfirmProvider } from "@/components/admin/wce/kit";
import { FlowerOfLifeField } from "@/components/wce/decor";
import "@/styles/wce.css";
import "@/styles/wce-admin.css";

const GROUPS = [
  {
    group: "Audience",
    items: [
      { key: "leads", label: "Leads", Icon: Users, Component: WceLeads },
      { key: "orders", label: "Orders", Icon: ShoppingBag, Component: WceOrders },
      { key: "referrals", label: "Referral Codes", Icon: Ticket, Component: WceReferralCodes },
      { key: "analytics", label: "Analytics", Icon: LineChart, Component: WceAnalytics },
    ],
  },
  {
    group: "Programme",
    items: [
      { key: "pathways", label: "Pathways", Icon: RouteIcon, Component: WcePathways },
      { key: "speakers", label: "Speakers", Icon: Mic2, Component: WceSpeakers },
      { key: "media", label: "Media", Icon: ImageIcon, Component: WceMedia },
      { key: "itinerary", label: "Itinerary", Icon: CalendarDays, Component: WceItinerary },
      { key: "faqs", label: "FAQs", Icon: HelpCircle, Component: WceFaqs },
      { key: "partners", label: "Partners", Icon: Handshake, Component: WcePartners },
      { key: "share", label: "Share Assets", Icon: Share2, Component: WceShareKit },
    ],
  },
  {
    group: "Configuration",
    items: [{ key: "settings", label: "Settings", Icon: SettingsIcon, Component: WceSettings }],
  },
];

// Only full store admins may manage who has organiser access.
const ADMIN_GROUP = {
  group: "Access",
  items: [{ key: "organisers", label: "Organisers", Icon: ShieldCheck, Component: WceOrganisers }],
};

export default function AdminWCE() {
  const { isFullAdmin, user } = useWceAccess();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>("leads");
  const [drawer, setDrawer] = useState(false);

  const groups = useMemo(
    () => (isFullAdmin ? [...GROUPS, ADMIN_GROUP] : GROUPS),
    [isFullAdmin],
  );
  const all = groups.flatMap((g) => g.items);
  const active = all.find((t) => t.key === tab) ?? all[0];
  const Active = active.Component;

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawer(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/wce-admin/login", { replace: true });
  };

  const navItems = (onPick?: () => void) =>
    groups.map((g) => (
      <div key={g.group} className="wa-nav-group">
        <span className="wa-label">{g.group}</span>
        {g.items.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className="wa-nav-item"
            aria-current={tab === key ? "page" : undefined}
            onClick={() => { setTab(key); onPick?.(); }}
          >
            <Icon aria-hidden /> {label}
          </button>
        ))}
      </div>
    ));

  return (
    <ConfirmProvider>
    <div className="wce-admin wce-root">
      <div className="wa-body">
        {/* Header */}
        <header
          className="wa-header"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          {/* Decoration lives in the chrome only — never behind data. */}
          <div className="wa-chrome-texture" aria-hidden="true">
            <FlowerOfLifeField opacity={1} />
          </div>
          <div>
            <p className="wa-label">Caribbean Wellness Experience</p>
            <h1 className="wa-serif" style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)", margin: "0.15rem 0 0" }}>
              Organiser Console <span style={{ color: "var(--wa-gold)" }}>2026</span>
            </h1>
            <p className="wa-muted" style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>
              1 – 8 August 2026 · Saint Lucia
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {user?.email && (
              <span className="wa-muted" style={{ fontSize: "0.78rem" }}>
                Signed in as <span style={{ color: "var(--wa-cream)" }}>{user.email}</span>
              </span>
            )}
            <button type="button" className="wa-btn wa-btn-ghost" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </header>

        {/* Nav + content */}
        <div className="wa-shell">
          <button
            type="button"
            className="wa-btn wa-btn-ghost wa-nav-trigger"
            onClick={() => setDrawer(true)}
            aria-expanded={drawer}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Menu className="h-4 w-4" aria-hidden /> Sections
            </span>
            <span style={{ color: "var(--wa-cream)" }}>{active.label}</span>
          </button>

          <nav aria-label="WCE admin sections" className="wa-nav">
            <div className="wa-chrome-texture" aria-hidden="true">
              <FlowerOfLifeField opacity={1} />
            </div>
            {navItems()}
          </nav>

          <section aria-live="polite" style={{ minWidth: 0 }}>
            <Active />
          </section>
        </div>
      </div>

      {drawer && createPortal(
        <div
          className="wa-drawer-veil wce-admin wce-root"
          role="dialog"
          aria-modal="true"
          aria-label="WCE admin sections"
          onClick={(e) => { if (e.target === e.currentTarget) setDrawer(false); }}
        >
          <div className="wa-drawer">
            <div className="wa-drawer-head">
              <span className="wa-label">Sections</span>
              <button type="button" className="wa-icon-btn" onClick={() => setDrawer(false)} aria-label="Close sections menu">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {navItems(() => setDrawer(false))}
          </div>
        </div>,
        document.body,
      )}
    </div>
    </ConfirmProvider>
  );
}
