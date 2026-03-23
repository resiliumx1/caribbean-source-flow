import { useConditions } from "@/hooks/use-conditions";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { useState } from "react";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";

const CONDITION_EMOJI_MAP: Record<string, string> = {
  immunity: '🛡️',
  sleep: '😴',
  "women-s-health": '🌸',
  "women's-health": '🌸',
  "mens-health": '💪',
  "men-s-health": '💪',
  digestion: '🫁',
  detox: '🌿',
  circulation: '❤️',
  stress: '🧘',
  pain: '🩹',
  skin: '✨',
  respiratory: '🫁',
  energy: '⚡',
};

function getConditionEmoji(slug: string): string {
  return CONDITION_EMOJI_MAP[slug] || '🌱';
}

const FORMS = [
  { label: "Tinctures", slug: "tinctures" },
  { label: "Capsules", slug: "capsules" },
  { label: "Teas", slug: "teas" },
  { label: "Books", slug: "books" },
  { label: "Bulk", slug: "raw-herbs" },
];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

interface ShopFilterNavProps {
  activeCondition: string | null;
  onConditionChange: (condition: string | null) => void;
  activeForm: string | null;
  onFormChange: (form: string | null) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalProducts: number;
}

export function ShopFilterNav({
  activeCondition,
  onConditionChange,
  activeForm,
  onFormChange,
  sortBy,
  onSortChange,
  totalProducts,
}: ShopFilterNavProps) {
  const { data: conditions } = useConditions();
  const conditionScroll = useDragScroll();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const activeCount = (activeCondition ? 1 : 0) + (activeForm ? 1 : 0);
  const activeConditionName = conditions?.find(c => c.slug === activeCondition)?.name;
  const activeFormName = FORMS.find(f => f.slug === activeForm)?.label;

  return (
    <>
      <div
        id="filter-nav"
        className="sticky top-16 z-30 border-b transition-colors duration-300"
        style={{
          background: "var(--site-nav-bg)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--site-border)",
        }}
      >
        {/* ─── Desktop Layout: Three Zones ─── */}
        <div className="hidden md:flex container mx-auto px-4 py-3 items-center gap-3">
          {/* Zone 1 — Shop by Goal */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--site-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>Shop by Goal</span>
            <div
              ref={conditionScroll.ref}
              className="flex items-center gap-2 overflow-x-auto condition-pills-scroll"
              style={{ scrollbarWidth: 'none', cursor: conditionScroll.isDragging ? 'grabbing' : 'grab' }}
              {...conditionScroll.scrollHandlers}
            >
              <button
                onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(null); onFormChange(null); }}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all"
                style={{
                  background: !activeCondition && !activeForm ? "var(--site-green-dark)" : "transparent",
                  color: !activeCondition && !activeForm ? "var(--site-cream, #F5F1E8)" : "var(--site-text-primary)",
                  border: !activeCondition && !activeForm ? "1px solid var(--site-green-dark)" : "1px solid var(--site-border)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                }}
              >
                All
              </button>
              {(conditions || []).map((condition) => {
                const isActive = activeCondition === condition.slug;
                return (
                  <button
                    key={condition.id}
                    onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(isActive ? null : condition.slug); }}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all"
                    style={{
                      background: isActive ? "var(--site-green-dark)" : "transparent",
                      color: isActive ? "var(--site-cream, #F5F1E8)" : "var(--site-text-primary)",
                      border: isActive ? "1px solid var(--site-green-dark)" : "1px solid var(--site-border)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {getConditionEmoji(condition.slug)} {condition.name}
                  </button>
                );
              })}
            </div>
          </div>
          <style>{`.condition-pills-scroll::-webkit-scrollbar { display: none; }`}</style>

          {/* Zone 2 — Form tabs */}
          <div className="flex items-center gap-2 border-l pl-3 flex-shrink-0" style={{ borderColor: "var(--site-border)" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--site-text-muted)', whiteSpace: 'nowrap' }}>Form:</span>
            {FORMS.map((form) => {
              const isActive = activeForm === form.slug;
              return (
                <button
                  key={form.slug}
                  onClick={() => onFormChange(isActive ? null : form.slug)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-md text-xs transition-all"
                  style={{
                    background: isActive ? "var(--site-gold)" : "var(--site-bg-secondary, rgba(0,0,0,0.04))",
                    color: isActive ? "var(--site-green-dark)" : "var(--site-text-muted)",
                    border: isActive ? "1px solid var(--site-gold)" : "1px solid transparent",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {form.label}
                </button>
              );
            })}
          </div>

          {/* Zone 3 — Sort + Count */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-2.5 py-1 rounded-full text-[11px]" style={{ background: 'var(--site-bg-secondary, rgba(0,0,0,0.04))', color: 'var(--site-text-muted)', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: 'nowrap' }}>
              {totalProducts} products
            </span>
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-all"
                style={{
                  border: "1px solid var(--site-border)",
                  color: "var(--site-text-muted)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Sort <ChevronDown className="w-3 h-3" />
              </button>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                  <div
                    className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-xl py-1 min-w-[180px]"
                    style={{ background: "var(--site-bg-card)", border: "1px solid var(--site-border)" }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { onSortChange(opt.value); setShowSortDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                        style={{
                          color: sortBy === opt.value ? "var(--site-gold)" : "var(--site-text-primary)",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: sortBy === opt.value ? 600 : 400,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── Mobile Layout ─── */}
        <div className="md:hidden">
          {/* Primary: horizontal scroll condition pills */}
          <div
            ref={conditionScroll.ref}
            className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide select-none"
            style={{
              cursor: conditionScroll.isDragging ? "grabbing" : "grab",
            }}
            {...conditionScroll.scrollHandlers}
          >
            <button
              onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(null); onFormChange(null); }}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all"
              style={{
                background: !activeCondition && !activeForm ? "var(--site-green-dark)" : "transparent",
                color: !activeCondition && !activeForm ? "#F5F1E8" : "var(--site-text-primary)",
                border: !activeCondition && !activeForm ? "1px solid var(--site-green-dark)" : "1px solid var(--site-border)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                minHeight: "44px",
                minWidth: "max-content",
              }}
            >
              All
            </button>
            {(conditions || []).map((condition) => {
              const isActive = activeCondition === condition.slug;
              return (
                <button
                  key={condition.id}
                  onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(isActive ? null : condition.slug); }}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all"
                  style={{
                    background: isActive ? "var(--site-green-dark)" : "transparent",
                    color: isActive ? "#F5F1E8" : "var(--site-text-primary)",
                    border: isActive ? "1px solid var(--site-green-dark)" : "1px solid var(--site-border)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: isActive ? 600 : 400,
                    minHeight: "44px",
                    minWidth: "max-content",
                  }}
                >
                  {condition.name}
                </button>
              );
            })}
            {/* Filter/Sort button at end */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex-shrink-0 px-3 py-2 rounded-full text-sm flex items-center gap-1 transition-all relative"
              style={{
                border: "1px solid var(--site-border)",
                color: "var(--site-text-muted)",
                fontFamily: "'DM Sans', sans-serif",
                minHeight: "44px",
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "var(--site-gold)", color: "var(--site-green-dark)" }}
                >
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter tags */}
          {(activeCondition || activeForm) && (
            <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {activeConditionName && (
                <span
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                  style={{
                    background: "var(--site-green-dark)",
                    color: "#F5F1E8",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {activeConditionName}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onConditionChange(null)} />
                </span>
              )}
              {activeFormName && (
                <span
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                  style={{
                    background: "var(--site-gold)",
                    color: "var(--site-green-dark)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {activeFormName}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onFormChange(null)} />
                </span>
              )}
              <button
                onClick={() => { onConditionChange(null); onFormChange(null); }}
                className="text-xs underline flex-shrink-0"
                style={{ color: "var(--site-text-muted)", fontFamily: "'DM Sans', sans-serif" }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile Filter Drawer ─── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl max-h-[80vh] overflow-y-auto pb-8"
            style={{ background: "var(--site-bg-primary)" }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--site-border)" }}>
              <h3
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "var(--site-text-primary)",
                }}
              >
                Filters & Sort
              </h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2">
                <X className="w-5 h-5" style={{ color: "var(--site-text-primary)" }} />
              </button>
            </div>

            {/* Conditions */}
            <div className="p-4">
              <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--site-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                Condition
              </p>
              <div className="flex flex-wrap gap-2">
                {(conditions || []).map((condition) => {
                  const isActive = activeCondition === condition.slug;
                  return (
                    <button
                      key={condition.id}
                      onClick={() => onConditionChange(isActive ? null : condition.slug)}
                      className="px-4 py-2.5 rounded-full text-sm transition-all"
                      style={{
                        background: isActive ? "var(--site-green-dark)" : "transparent",
                        color: isActive ? "#F5F1E8" : "var(--site-text-primary)",
                        border: isActive ? "1px solid var(--site-green-dark)" : "1px solid var(--site-border)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: isActive ? 600 : 400,
                        minHeight: "44px",
                      }}
                    >
                      {condition.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <div className="p-4 pt-0">
              <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--site-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                Form
              </p>
              <div className="flex flex-wrap gap-2">
                {FORMS.map((form) => {
                  const isActive = activeForm === form.slug;
                  return (
                    <button
                      key={form.slug}
                      onClick={() => onFormChange(isActive ? null : form.slug)}
                      className="px-4 py-2.5 rounded-full text-sm transition-all"
                      style={{
                        background: isActive ? "var(--site-gold)" : "transparent",
                        color: isActive ? "var(--site-green-dark)" : "var(--site-text-primary)",
                        border: isActive ? "1px solid var(--site-gold)" : "1px solid var(--site-border)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: isActive ? 600 : 400,
                        minHeight: "44px",
                      }}
                    >
                      {form.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort */}
            <div className="p-4 pt-0">
              <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--site-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                Sort by
              </p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onSortChange(opt.value)}
                    className="px-4 py-2.5 rounded-full text-sm transition-all"
                    style={{
                      background: sortBy === opt.value ? "var(--site-green-dark)" : "transparent",
                      color: sortBy === opt.value ? "#F5F1E8" : "var(--site-text-primary)",
                      border: sortBy === opt.value ? "1px solid var(--site-green-dark)" : "1px solid var(--site-border)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: sortBy === opt.value ? 600 : 400,
                      minHeight: "44px",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply button */}
            <div className="px-4 pt-2">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: "var(--site-gold)",
                  color: "var(--site-green-dark)",
                  fontFamily: "'DM Sans', sans-serif",
                  minHeight: "48px",
                }}
              >
                Show {totalProducts} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
