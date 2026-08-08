import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  type AdminNavGroup,
  type BadgeKey,
  findActiveItem,
} from "./nav-config";

export type BadgeCounts = Partial<Record<BadgeKey, number>>;

const GROUPS_KEY = "mk-admin-nav-groups";
const RAIL_KEY = "mk-admin-nav-rail";

function readGroupState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/** Collapsed/expanded state per group, remembered across sessions. */
export function useGroupState(groups: AdminNavGroup[], activeGroupId?: string) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => readGroupState());

  useEffect(() => {
    try {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(open));
    } catch {
      /* storage unavailable — state is session-only */
    }
  }, [open]);

  // The group containing the current page is always expanded.
  useEffect(() => {
    if (!activeGroupId) return;
    setOpen((o) => (o[activeGroupId] === false ? { ...o, [activeGroupId]: true } : o));
  }, [activeGroupId]);

  const isOpen = useCallback((id: string) => open[id] !== false, [open]);
  const toggle = useCallback(
    (id: string) => setOpen((o) => ({ ...o, [id]: o[id] === false })),
    [],
  );
  return { isOpen, toggle };
}

/** Icon-rail collapse state, remembered across sessions. */
export function useRailState() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(RAIL_KEY) === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(RAIL_KEY, collapsed ? "1" : "0");
    } catch {
      /* noop */
    }
  }, [collapsed]);
  return { collapsed, setCollapsed };
}

function Badge({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold text-white shrink-0"
      style={{ background: "hsl(var(--destructive))" }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

interface NavRowProps {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge: number;
  /** Muted state for sections that are empty or unconfigured. */
  muted?: boolean;
  rail?: boolean;
  promoted?: boolean;
  onNavigate?: () => void;
}

function NavRow({
  href,
  label,
  Icon,
  active,
  badge,
  muted,
  rail,
  promoted,
  onNavigate,
}: NavRowProps) {
  const row = (
    <Link
      to={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-md min-h-[44px] px-3 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))]",
        rail && "justify-center px-0",
        active
          ? "bg-primary/15 text-primary font-semibold shadow-sm"
          : muted
            ? "text-muted-foreground hover:bg-muted hover:text-foreground"
            : "text-foreground/80 hover:bg-muted hover:text-foreground",
        promoted && !active && "font-medium",
      )}
    >
      {/* Accent left bar for the current page */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full",
          active ? "bg-primary" : "bg-transparent",
        )}
      />
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
      {!rail && <span className="flex-1 truncate text-[14px] leading-tight">{label}</span>}
      {!rail && badge > 0 && <Badge count={badge} />}
      {rail && badge > 0 && (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
          style={{ background: "hsl(var(--destructive))" }}
        />
      )}
    </Link>
  );

  if (!rail) return row;
  return (
    <Tooltip delayDuration={120}>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {badge > 0 ? ` · ${badge}` : ""}
      </TooltipContent>
    </Tooltip>
  );
}

export interface AdminNavProps {
  groups: AdminNavGroup[];
  badges: BadgeCounts;
  /** Render as the compact icon rail (desktop only). */
  rail?: boolean;
  /** Drawer variant uses accordions and closes on navigation. */
  variant?: "sidebar" | "drawer";
  onNavigate?: () => void;
  onOpenPalette?: () => void;
}

export function AdminNav({
  groups,
  badges,
  rail,
  variant = "sidebar",
  onNavigate,
  onOpenPalette,
}: AdminNavProps) {
  const { pathname } = useLocation();
  const activeItem = useMemo(() => findActiveItem(pathname), [pathname]);
  const activeGroup = useMemo(
    () => groups.find((g) => g.items.some((i) => i.href === activeItem?.href)),
    [groups, activeItem],
  );
  const { isOpen, toggle } = useGroupState(groups, activeGroup?.id);

  const badgeFor = (key?: BadgeKey) => (key ? badges[key] ?? 0 : 0);
  const groupBadge = (g: AdminNavGroup) =>
    g.items.reduce((sum, i) => sum + badgeFor(i.badgeKey), 0);

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-1 py-2">
      {groups.map((group) => {
        const promoted = group.items.length === 1;
        const isActiveGroup = activeGroup?.id === group.id;

        if (promoted) {
          const item = group.items[0];
          return (
            <div key={group.id} className={cn(rail ? "px-2" : "px-2")}>
              <NavRow
                href={item.href}
                label={item.label}
                Icon={item.icon}
                active={activeItem?.href === item.href}
                badge={badgeFor(item.badgeKey)}
                rail={rail}
                promoted
                onNavigate={onNavigate}
              />
            </div>
          );
        }

        const open = rail ? true : isOpen(group.id);
        return (
          <div key={group.id} className="px-2">
            {!rail && (
              <button
                type="button"
                onClick={() => toggle(group.id)}
                aria-expanded={open}
                className={cn(
                  "w-full flex items-center gap-2 px-3 min-h-[36px] rounded-md text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                  isActiveGroup
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="flex-1 text-left">{group.label}</span>
                {!open && groupBadge(group) > 0 && <Badge count={groupBadge(group)} />}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    !open && "-rotate-90",
                  )}
                />
              </button>
            )}
            {rail && (
              <div
                aria-hidden
                className="mx-auto my-2 h-px w-6 bg-border"
                title={group.label}
              />
            )}
            {open && (
              <div className={cn("flex flex-col gap-0.5", !rail && "mt-0.5 mb-1")}>
                {group.items.map((item) => (
                  <NavRow
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    Icon={item.icon}
                    active={activeItem?.href === item.href}
                    badge={badgeFor(item.badgeKey)}
                    muted={badgeFor(item.badgeKey) === 0 && false}
                    rail={rail}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Command palette hint */}
      <div className={cn("mt-2 px-2", rail && "px-2")}>
        {rail ? (
          <Tooltip delayDuration={120}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onOpenPalette}
                aria-label="Search admin pages"
                className="w-full min-h-[44px] rounded-md border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Search pages (⌘K)</TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={onOpenPalette}
            className="w-full min-h-[44px] px-3 rounded-md border border-border bg-muted/40 text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          >
            <Search className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">Search pages</span>
            <kbd className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-sans text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        )}
      </div>
      {variant === "drawer" && <div className="h-2" />}
    </nav>
  );
}

/** Persistent desktop sidebar (1024 and up). */
export function AdminSidebar({
  groups,
  badges,
  collapsed,
  onToggleCollapsed,
  onOpenPalette,
  header,
  footer,
}: {
  groups: AdminNavGroup[];
  badges: BadgeCounts;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenPalette: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 border-r border-border bg-card sticky top-0 h-screen transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[268px]",
      )}
    >
      <div className="px-3 py-3 border-b border-border flex items-center gap-2 min-h-[57px]">
        {!collapsed && <div className="min-w-0 flex-1">{header}</div>}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-9 w-9 shrink-0 mx-auto rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AdminNav
          groups={groups}
          badges={badges}
          rail={collapsed}
          onOpenPalette={onOpenPalette}
        />
      </div>
      {footer && <div className="border-t border-border p-2">{footer}</div>}
    </aside>
  );
}