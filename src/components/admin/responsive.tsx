import * as React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ScrollTabs: wraps a horizontal tab strip (or any horizontally-scrollable
 * row of controls) so it never clips content on narrow viewports.
 * - overflow-x-auto with hidden scrollbar
 * - gradient fade affordances that appear only when there is more content
 * - auto-scrolls the active element into view
 */
export function ScrollTabs({
  children,
  className,
  activeKey,
}: {
  children: React.ReactNode;
  className?: string;
  /** Change this value whenever the active tab changes to trigger auto-scroll-into-view. */
  activeKey?: string | number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(false);

  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  React.useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [update]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>('[data-state="active"], [aria-selected="true"]');
    active?.scrollIntoView({ inline: "center", block: "nearest" });
    // Re-check fade affordances after any layout shift.
    requestAnimationFrame(update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, update]);

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        ref={ref}
        className="overflow-x-auto no-scrollbar"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        <div className="inline-flex min-w-full w-max items-center">{children}</div>
      </div>
      {canLeft && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent"
        />
      )}
      {canRight && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent"
        />
      )}
    </div>
  );
}

/** Alias matching the alternate name requested. */
export const TabScroller = ScrollTabs;

/**
 * StickyHeading: sticky section header for long lists.
 */
export function StickyHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-14 z-20 -mx-4 px-4 py-2 bg-card/95 backdrop-blur border-b border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * FilterSheet: below 768px renders a "Filters" trigger button that opens a
 * Sheet containing the passed controls; at >=768px renders the children inline.
 */
export function FilterSheet({
  children,
  title = "Filters",
  triggerLabel = "Filters",
  activeCount,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  triggerLabel?: string;
  activeCount?: number;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div className={cn("hidden md:flex md:flex-wrap md:items-center md:gap-2", className)}>
        {children}
      </div>
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="min-h-[44px] gap-2">
              <Filter className="h-4 w-4" />
              {triggerLabel}
              {!!activeCount && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-3">{children}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

/**
 * StackedCard: a single record rendered as a card on narrow viewports.
 * `primary` fields are always visible; `details` fields are behind a
 * "Details" expander.
 */
export function StackedCard({
  primary,
  details,
  actions,
  className,
}: {
  primary: React.ReactNode;
  details?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={cn("rounded-lg border border-border bg-card p-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">{primary}</div>
        {actions && <div className="flex-shrink-0 flex items-center gap-1">{actions}</div>}
      </div>
      {details && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-xs font-medium text-primary"
            >
              Details
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1.5 border-t border-border pt-2 text-sm">
            {details}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

/**
 * MobileTable: renders `renderRow` as stacked <StackedCard/> items below
 * 768px, and falls back to the given table markup (children) at >=768px.
 */
export function MobileTable<T>({
  items,
  renderRow,
  table,
  emptyState,
  className,
}: {
  items: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  table: React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }
  return (
    <div className={className}>
      <div className="md:hidden space-y-2">
        {items.map((item, i) => (
          <React.Fragment key={i}>{renderRow(item, i)}</React.Fragment>
        ))}
      </div>
      <div className="hidden md:block">{table}</div>
    </div>
  );
}
