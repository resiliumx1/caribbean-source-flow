import {
  BarChart3,
  Bell,
  ShoppingCart,
  Package,
  Ticket,
  ShoppingBasket,
  Wallet,
  AlertTriangle,
  Building2,
  Star,
  Mountain,
  CalendarDays,
  Video,
  Stethoscope,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** A single admin destination. */
export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** One-line description shown under the page title in the content header. */
  description: string;
  /** Key into the badge counts record, when this page communicates state. */
  badgeKey?: BadgeKey;
}

export type BadgeKey =
  | "notifications"
  | "paymentAlerts"
  | "consultations"
  | "wholesaleLeads"
  | "orders";

/** Which access scope may see a group. */
export type NavScope = "admin" | "consultations" | "wce";

export interface AdminNavGroup {
  id: string;
  label: string;
  scope: NavScope;
  /** Single-item groups render as a promoted top-level link. */
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    scope: "admin",
    items: [
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        description: "Revenue, traffic and conversion summary across the store.",
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
        description: "Every alert raised by the store, newest first.",
        badgeKey: "notifications",
      },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    scope: "admin",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        description: "All customer orders, fulfilment status and refunds.",
        badgeKey: "orders",
      },
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
        description: "Catalogue, pricing, images, stock and sale badges.",
      },
      {
        label: "Discount Codes",
        href: "/admin/coupons",
        icon: Ticket,
        description: "Coupons, referral codes and their redemption limits.",
      },
      {
        label: "Abandoned Carts",
        href: "/admin/abandoned-carts",
        icon: ShoppingBasket,
        description: "Carts left behind, recovery reminders and conversions.",
      },
      {
        label: "Payment Plans",
        href: "/admin/payment-plans",
        icon: Wallet,
        description: "Instalment plans, scheduled charges and payment links.",
      },
      {
        label: "Payment Alerts",
        href: "/admin/payment-alerts",
        icon: AlertTriangle,
        description: "Captures and webhooks that did not produce an order.",
        badgeKey: "paymentAlerts",
      },
      {
        label: "Wholesale Leads",
        href: "/admin/wholesale-leads",
        icon: Building2,
        description: "B2B enquiries, their status and CSV export.",
        badgeKey: "wholesaleLeads",
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: Star,
        description: "Customer reviews awaiting moderation or already published.",
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    scope: "admin",
    items: [
      {
        label: "Retreats",
        href: "/admin/retreats",
        icon: Mountain,
        description: "Retreat programmes, pricing and published details.",
      },
      {
        label: "Retreat Dates",
        href: "/admin/retreat-dates",
        icon: CalendarDays,
        description: "Scheduled departures, capacity and spots booked.",
      },
      {
        label: "Webinars",
        href: "/admin/webinars",
        icon: Video,
        description: "Webinar library, categories and YouTube sync.",
      },
    ],
  },
  {
    // Single page — promoted to a top-level item rather than nested.
    id: "consultations",
    label: "Consultations",
    scope: "consultations",
    items: [
      {
        label: "Consultations",
        href: "/admin/consultations",
        icon: Stethoscope,
        description: "Bookings, services, availability and joining links.",
        badgeKey: "consultations",
      },
    ],
  },
  {
    // Single page — promoted to a top-level item rather than nested.
    id: "wce",
    label: "WCE 2026",
    scope: "wce",
    items: [
      {
        label: "WCE 2026",
        href: "/admin/wce",
        icon: Sparkles,
        description: "Caribbean Wellness Experience applications, orders and organisers.",
      },
    ],
  },
];

/** Flat list of every destination, for the command palette and lookups. */
export const ALL_ADMIN_ITEMS: Array<AdminNavItem & { group: string }> = ADMIN_NAV.flatMap(
  (g) => g.items.map((i) => ({ ...i, group: g.label })),
);

/** Longest-prefix match so nested routes still resolve to their page. */
export function findActiveItem(pathname: string) {
  let best: (AdminNavItem & { group: string }) | undefined;
  for (const item of ALL_ADMIN_ITEMS) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.href.length) best = item;
    }
  }
  return best;
}

/** Groups visible to the signed-in user. Never returns a link they cannot use. */
export function visibleGroups(opts: {
  isFullAdmin: boolean;
  hasConsultationAccess: boolean;
  hasWceAccess: boolean;
}) {
  if (opts.isFullAdmin) return ADMIN_NAV;
  return ADMIN_NAV.filter((g) => {
    if (g.scope === "consultations") return opts.hasConsultationAccess;
    if (g.scope === "wce") return opts.hasWceAccess;
    return false;
  });
}