import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-context";
import {
  useSiteSearch,
  highlightParts,
  readRecentSearches,
  pushRecentSearch,
  clearRecentSearches,
  type SearchHit,
  type SearchGroup,
} from "@/hooks/use-site-search";

const SUGGESTIONS = [
  { label: "Shop all products", to: "/shop" },
  { label: "The Answer", to: "/the-answer" },
  { label: "Book a consultation", to: "/consultations" },
  { label: "Wholesale enquiries", to: "/wholesale" },
];

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((part, i) =>
        part.match ? (
          <mark key={i} className="bg-primary/20 text-foreground rounded-[2px] px-[1px]">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

function ResultRow({
  hit,
  query,
  id,
  active,
  onHover,
  onPick,
}: {
  hit: SearchHit & { group?: string };
  query: string;
  id: string;
  active: boolean;
  onHover: () => void;
  onPick: () => void;
}) {
  const { formatPrice } = useStore();
  const showPrice = hit.price_usd != null;
  return (
    <li role="none">
      <Link
        id={id}
        role="option"
        aria-selected={active}
        to={hit.url}
        onMouseEnter={onHover}
        onClick={onPick}
        className={`flex items-center gap-3 px-3 py-2 rounded-md min-h-[44px] ${
          active ? "bg-muted" : "hover:bg-muted/60"
        }`}
      >
        {hit.image ? (
          <img
            src={hit.image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-10 w-10 flex-none rounded object-contain bg-muted/40"
          />
        ) : (
          <span className="h-10 w-10 flex-none rounded bg-muted/40 flex items-center justify-center">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            <Highlighted text={hit.title} query={query} />
          </span>
          {(hit.subtitle || hit.meta) && (
            <span className="block truncate text-xs text-muted-foreground">
              {hit.meta && hit.subtitle ? `${hit.meta} — ` : hit.meta || ""}
              {hit.subtitle ?? ""}
            </span>
          )}
        </span>
        {showPrice && (
          <span className="flex-none text-sm font-medium text-foreground">
            {formatPrice(hit.price_usd ?? 0, hit.price_xcd ?? 0)}
          </span>
        )}
      </Link>
    </li>
  );
}

function Skeletons() {
  return (
    <div className="p-3 space-y-3" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 rounded bg-muted animate-pulse" />
            <div className="h-2 w-3/5 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

type PanelProps = {
  query: string;
  groups: SearchGroup[];
  flat: (SearchHit & { group: string })[];
  loading: boolean;
  error: string | null;
  enabled: boolean;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  optionId: (i: number) => string;
  listboxId: string;
  onPick: () => void;
  recent: string[];
  onRecent: (term: string) => void;
  onClearRecent: () => void;
};

function ResultsPanel(p: PanelProps) {
  let cursor = -1;

  if (!p.enabled) {
    return (
      <div className="p-3">
        {p.recent.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                Recent searches
              </span>
              <button
                type="button"
                onClick={p.onClearRecent}
                className="text-[0.7rem] text-muted-foreground hover:text-foreground underline"
              >
                Clear
              </button>
            </div>
            <ul className="space-y-0.5">
              {p.recent.map((term) => (
                <li key={term}>
                  <button
                    type="button"
                    onClick={() => p.onRecent(term)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-foreground hover:bg-muted/60 text-left min-h-[44px]"
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="px-1 pb-1 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          Popular destinations
        </div>
        <ul className="space-y-0.5">
          {SUGGESTIONS.map((s) => (
            <li key={s.to}>
              <Link
                to={s.to}
                onClick={p.onPick}
                className="flex items-center justify-between px-2 py-2 rounded-md text-sm text-foreground hover:bg-muted/60 min-h-[44px]"
              >
                {s.label}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (p.loading && p.groups.length === 0) return <Skeletons />;

  if (p.error) {
    return <p className="p-4 text-sm text-muted-foreground">{p.error}</p>;
  }

  if (p.groups.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-foreground mb-3">
          Nothing matched “{p.query}”. Try one of these instead:
        </p>
        <ul className="space-y-0.5">
          {SUGGESTIONS.map((s) => (
            <li key={s.to}>
              <Link
                to={s.to}
                onClick={p.onPick}
                className="flex items-center justify-between px-2 py-2 rounded-md text-sm text-foreground hover:bg-muted/60 min-h-[44px]"
              >
                {s.label}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ul id={p.listboxId} role="listbox" aria-label="Search results" className="py-2">
      {p.groups.map((group) => (
        <li key={group.key} role="none" className="px-1 pb-1">
          <div
            role="presentation"
            className="px-2 py-1 text-[0.7rem] uppercase tracking-wider text-muted-foreground"
          >
            {group.label}
          </div>
          <ul role="none" className="space-y-0.5">
            {group.hits.map((hit) => {
              cursor += 1;
              const index = cursor;
              return (
                <ResultRow
                  key={`${group.key}-${hit.id}`}
                  hit={hit}
                  query={p.query}
                  id={p.optionId(index)}
                  active={index === p.activeIndex}
                  onHover={() => p.setActiveIndex(index)}
                  onPick={p.onPick}
                />
              );
            })}
          </ul>
          {group.seeAll && (
            <Link
              to={group.seeAll}
              onClick={p.onPick}
              className="mt-1 flex items-center gap-1 px-3 py-2 text-xs font-medium text-primary hover:underline"
            >
              See all {group.total} results for “{p.query}” in {group.label}
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export function SiteSearch() {
  const uid = useId().replace(/:/g, "");
  const listboxId = `site-search-list-${uid}`;
  const inputId = `site-search-input-${uid}`;
  const optionId = useCallback((i: number) => `site-search-opt-${uid}-${i}`, [uid]);

  const [query, setQuery] = useState("");
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { groups, flat, loading, error, enabled } = useSiteSearch(query);

  const open = desktopOpen || overlayOpen;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Close and clear on route change so the panel never lingers over a new page.
  useEffect(() => {
    setDesktopOpen(false);
    setOverlayOpen(false);
    setQuery("");
  }, [location.pathname]);

  // Outside click closes the desktop panel.
  useEffect(() => {
    if (!desktopOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setDesktopOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [desktopOpen]);

  const refreshRecent = useCallback(() => setRecent(readRecentSearches()), []);

  const openDesktop = useCallback(() => {
    refreshRecent();
    setDesktopOpen(true);
  }, [refreshRecent]);

  const openOverlay = useCallback(() => {
    refreshRecent();
    setOverlayOpen(true);
  }, [refreshRecent]);

  // "/" or Cmd/Ctrl+K focuses search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      const shortcut = (e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing);
      if (!shortcut) return;
      e.preventDefault();
      if (window.matchMedia("(min-width: 1280px)").matches) {
        openDesktop();
        requestAnimationFrame(() => desktopInputRef.current?.focus());
      } else {
        openOverlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openDesktop, openOverlay]);

  useEffect(() => {
    if (overlayOpen) requestAnimationFrame(() => overlayInputRef.current?.focus());
  }, [overlayOpen]);

  const closeAll = useCallback(() => {
    setDesktopOpen(false);
    setOverlayOpen(false);
  }, []);

  const commitPick = useCallback(() => {
    if (query.trim().length >= 2) pushRecentSearch(query);
    setQuery("");
    closeAll();
  }, [query, closeAll]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
      closeAll();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!flat.length) return;
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((prev) => {
        const next = prev + dir;
        if (next < 0) return flat.length - 1;
        if (next >= flat.length) return 0;
        return next;
      });
      return;
    }
    if (e.key === "Enter") {
      const hit = flat[activeIndex];
      if (hit) {
        e.preventDefault();
        pushRecentSearch(query);
        setQuery("");
        closeAll();
        navigate(hit.url);
      } else if (query.trim().length >= 2) {
        e.preventDefault();
        pushRecentSearch(query);
        const q = query.trim();
        setQuery("");
        closeAll();
        navigate(`/shop?q=${encodeURIComponent(q)}`);
      }
    }
  };

  const announcement = useMemo(() => {
    if (!enabled) return "";
    if (loading) return "Searching…";
    if (error) return error;
    const total = flat.length;
    return total === 0 ? `No results for ${query}` : `${total} results for ${query}`;
  }, [enabled, loading, error, flat.length, query]);

  const panel = (
    <ResultsPanel
      query={query}
      groups={groups}
      flat={flat}
      loading={loading}
      error={error}
      enabled={enabled}
      activeIndex={activeIndex}
      setActiveIndex={setActiveIndex}
      optionId={optionId}
      listboxId={listboxId}
      onPick={commitPick}
      recent={recent}
      onRecent={(term) => setQuery(term)}
      onClearRecent={() => {
        clearRecentSearches();
        setRecent([]);
      }}
    />
  );

  const comboProps = {
    role: "combobox" as const,
    "aria-expanded": open,
    "aria-controls": listboxId,
    "aria-autocomplete": "list" as const,
    "aria-activedescendant": activeIndex >= 0 ? optionId(activeIndex) : undefined,
  };

  return (
    <>
      {/* Desktop: inline field, expanding on focus (xl+ so the nav never overflows) */}
      <div ref={wrapRef} className="hidden xl:block relative site-search-field">
        <label htmlFor={inputId} className="sr-only">
          Search the site
        </label>
        <div className="relative flex items-center">
          <Search
            className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            {...comboProps}
            id={inputId}
            ref={desktopInputRef}
            type="search"
            value={query}
            placeholder="Search"
            onChange={(e) => {
              setQuery(e.target.value);
              setDesktopOpen(true);
            }}
            onFocus={openDesktop}
            onKeyDown={onKeyDown}
            className={`h-10 rounded-full border bg-background/70 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[width] duration-300 focus:ring-2 focus:ring-primary/40 ${
              desktopOpen ? "w-64" : "w-36"
            }`}
            style={{ borderColor: "var(--site-header-border)" }}
          />
        </div>
        {desktopOpen && (
          <div
            className="absolute right-0 top-12 w-[26rem] max-h-[70vh] overflow-y-auto rounded-xl border bg-popover shadow-xl"
            style={{ borderColor: "var(--site-header-border)" }}
          >
            {panel}
          </div>
        )}
      </div>

      {/* Mobile / tablet: icon opening a full-screen overlay */}
      <Button
        variant="ghost"
        size="icon"
        className="xl:hidden min-h-11 min-w-11"
        aria-label="Search"
        onClick={openOverlay}
      >
        <Search className="w-5 h-5" />
      </Button>

      {/* Portalled to <body>: the header sets backdrop-filter, which would make it
          the containing block for a fixed child and clip the overlay to 64px. */}
      {overlayOpen && createPortal((
        <div
          className="fixed inset-0 xl:hidden site-search-overlay"
          style={{ zIndex: 100000, background: "hsl(var(--background))", opacity: 1 }}
          role="dialog"
          aria-modal="true"
          aria-label="Search the site"
        >
          <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--site-header-border)" }}>
            <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <input
              {...comboProps}
              ref={overlayInputRef}
              type="search"
              value={query}
              placeholder="Search products, consultations, retreats…"
              aria-label="Search the site"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 h-11 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
            />
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label="Close search"
              onClick={() => {
                setQuery("");
                closeAll();
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 4.5rem)" }}>
            {panel}
          </div>
        </div>
      ), document.body)}

      <span aria-live="polite" role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
