import { useConditions } from "@/hooks/use-conditions";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown, X, SlidersHorizontal, Search,
  LayoutGrid, Flame, Apple, Moon, ShieldCheck, Dumbbell, Heart, Package,
  Droplets, Pill, Coffee, BookOpen, Leaf, Sparkles,
} from "lucide-react";

const CONDITION_ICON_MAP: Record<string, React.ElementType> = {
  immunity: ShieldCheck,
  "immune-defense": ShieldCheck,
  sleep: Moon,
  stress: Moon,
  "stress-sleep": Moon,
  "women-s-health": Heart,
  "women's-health": Heart,
  "womens-health": Heart,
  "mens-health": Dumbbell,
  "men-s-health": Dumbbell,
  digestion: Apple,
  "gut-health": Apple,
  "gut-health-digestion": Apple,
  detox: Leaf,
  circulation: Heart,
  pain: Flame,
  "inflammation-pain": Flame,
  "inflammation": Flame,
  skin: Sparkles,
  respiratory: Leaf,
  energy: Flame,
  "curated-protocols": Package,
};

function getConditionIcon(slug: string): React.ElementType {
  return CONDITION_ICON_MAP[slug] || Leaf;
}

const FORM_ICON_MAP: Record<string, React.ElementType> = {
  tinctures: Droplets,
  capsules: Pill,
  teas: Coffee,
  books: BookOpen,
  "raw-herbs": Leaf,
  soaps: Sparkles,
};

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
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function ShopFilterNav({
  activeCondition,
  onConditionChange,
  activeForm,
  onFormChange,
  sortBy,
  onSortChange,
  totalProducts,
  searchQuery,
  onSearchChange,
}: ShopFilterNavProps) {
  const { data: conditions } = useConditions();
  const conditionScroll = useDragScroll();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activeCount = (activeCondition ? 1 : 0) + (activeForm ? 1 : 0);
  const activeConditionName = conditions?.find(c => c.slug === activeCondition)?.name;
  const activeFormName = FORMS.find(f => f.slug === activeForm)?.label;

  // IntersectionObserver for sticky shadow
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const pillBase: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s ease',
  };

  const goalPillStyle = (active: boolean): React.CSSProperties => ({
    ...pillBase,
    background: active ? '#1b4332' : '#ffffff',
    color: active ? '#ffffff' : '#555',
    border: active ? '1px solid #1b4332' : '1px solid #d4d0c8',
    fontWeight: active ? 600 : 500,
  });

  const formPillStyle = (active: boolean): React.CSSProperties => ({
    ...pillBase,
    background: active ? '#2d6a4f' : '#ffffff',
    color: active ? '#ffffff' : '#555',
    border: active ? '1px solid #2d6a4f' : '1px solid #d4d0c8',
    fontWeight: active ? 600 : 400,
  });

  return (
    <>
      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} className="h-0" />

      <div
        ref={navRef}
        id="filter-nav"
        className="sticky top-16 z-40 border-b transition-shadow duration-300"
        style={{
          background: '#f5f0e8',
          borderColor: 'rgba(0,0,0,0.06)',
          boxShadow: isStuck ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        {/* ─── Desktop Layout (1024px+) ─── */}
        <div className="hidden lg:flex container mx-auto px-6 py-3 items-center gap-3">
          {/* Goal pills */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>Shop by Goal</span>
            <div
              ref={conditionScroll.ref}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
              style={{ cursor: conditionScroll.isDragging ? 'grabbing' : 'grab' }}
              {...conditionScroll.scrollHandlers}
            >
              <button
                onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(null); onFormChange(null); }}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5"
                style={goalPillStyle(!activeCondition && !activeForm)}
              >
                <LayoutGrid className="w-4 h-4" />
                All
              </button>
              {(conditions || []).map((condition) => {
                const isActive = activeCondition === condition.slug;
                const Icon = getConditionIcon(condition.slug);
                return (
                  <button
                    key={condition.id}
                    onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(isActive ? null : condition.slug); }}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 hover:border-[#1b4332] hover:text-[#1b4332]"
                    style={goalPillStyle(isActive)}
                  >
                    <Icon className="w-4 h-4" />
                    {condition.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex-shrink-0" style={{ width: 1, height: 24, background: '#d4d0c8', margin: '0 4px' }} />

          {/* Form pills */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', whiteSpace: 'nowrap' }}>Form:</span>
            {FORMS.map((form) => {
              const isActive = activeForm === form.slug;
              const Icon = FORM_ICON_MAP[form.slug] || Leaf;
              return (
                <button
                  key={form.slug}
                  onClick={() => onFormChange(isActive ? null : form.slug)}
                  className="flex-shrink-0 px-3 py-1 rounded-md text-xs flex items-center gap-1 hover:border-[#1b4332] hover:text-[#1b4332]"
                  style={formPillStyle(isActive)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {form.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative flex-shrink-0" style={{ width: 220 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full h-9 pl-9 pr-8 rounded-full text-[13px] outline-none"
              style={{
                background: '#ffffff',
                border: '1px solid #d4d0c8',
                fontFamily: "'DM Sans', sans-serif",
                color: '#333',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1b4332';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(27,67,50,0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d4d0c8';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" style={{ color: '#999' }} />
              </button>
            )}
          </div>

          {/* Count + Sort */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-2.5 py-1 rounded-full text-[11px]" style={{ border: '1px solid #1b4332', color: '#1b4332', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: 'nowrap' }}>
              {totalProducts} products
            </span>
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="h-9 px-3 rounded-lg text-[13px] flex items-center gap-1"
                style={{
                  border: '1px solid #d4d0c8',
                  color: '#555',
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
                    style={{ background: '#ffffff', border: '1px solid #d4d0c8' }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { onSortChange(opt.value); setShowSortDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                        style={{
                          color: sortBy === opt.value ? '#1b4332' : '#333',
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

        {/* ─── Tablet Layout (768–1023px) ─── */}
        <div className="hidden md:flex lg:hidden flex-col container mx-auto px-6 py-3 gap-2">
          {/* Row 1: Goals + Search */}
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>Shop by Goal</span>
            <div
              ref={conditionScroll.ref}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0"
              style={{ cursor: conditionScroll.isDragging ? 'grabbing' : 'grab' }}
              {...conditionScroll.scrollHandlers}
            >
              <button
                onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(null); onFormChange(null); }}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5"
                style={goalPillStyle(!activeCondition && !activeForm)}
              >
                <LayoutGrid className="w-4 h-4" />
                All
              </button>
              {(conditions || []).map((condition) => {
                const isActive = activeCondition === condition.slug;
                const Icon = getConditionIcon(condition.slug);
                return (
                  <button
                    key={condition.id}
                    onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(isActive ? null : condition.slug); }}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5"
                    style={goalPillStyle(isActive)}
                  >
                    <Icon className="w-4 h-4" />
                    {condition.name}
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div className="relative flex-shrink-0" style={{ width: 200 }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-8 rounded-full text-[13px] outline-none"
                style={{ background: '#ffffff', border: '1px solid #d4d0c8', fontFamily: "'DM Sans', sans-serif", color: '#333' }}
              />
              {searchQuery && (
                <button onClick={() => onSearchChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4" style={{ color: '#999' }} />
                </button>
              )}
            </div>
          </div>
          {/* Row 2: Forms + Count + Sort */}
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', whiteSpace: 'nowrap' }}>Form:</span>
            {FORMS.map((form) => {
              const isActive = activeForm === form.slug;
              const Icon = FORM_ICON_MAP[form.slug] || Leaf;
              return (
                <button
                  key={form.slug}
                  onClick={() => onFormChange(isActive ? null : form.slug)}
                  className="flex-shrink-0 px-3 py-1 rounded-md text-xs flex items-center gap-1"
                  style={formPillStyle(isActive)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {form.label}
                </button>
              );
            })}
            <span className="ml-auto px-2.5 py-1 rounded-full text-[11px]" style={{ border: '1px solid #1b4332', color: '#1b4332', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              {totalProducts}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="h-9 px-3 rounded-lg text-[13px] flex items-center gap-1"
                style={{ border: '1px solid #d4d0c8', color: '#555', fontFamily: "'DM Sans', sans-serif" }}
              >
                Sort <ChevronDown className="w-3 h-3" />
              </button>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-xl py-1 min-w-[180px]" style={{ background: '#ffffff', border: '1px solid #d4d0c8' }}>
                    {SORT_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => { onSortChange(opt.value); setShowSortDropdown(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-black/5" style={{ color: sortBy === opt.value ? '#1b4332' : '#333', fontFamily: "'DM Sans', sans-serif", fontWeight: sortBy === opt.value ? 600 : 400 }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── Mobile Layout (<768px) ─── */}
        <div className="md:hidden flex flex-col gap-1.5 px-4 py-3">
          {/* Row 1: Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full text-[13px] outline-none"
              style={{
                height: 44,
                paddingLeft: 36,
                paddingRight: 36,
                background: '#ffffff',
                border: '1px solid #d4d0c8',
                fontFamily: "'DM Sans', sans-serif",
                color: '#333',
              }}
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: '#999' }} />
              </button>
            )}
          </div>

          {/* Row 2: Goal pills */}
          <div
            ref={conditionScroll.ref}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide select-none"
            style={{ cursor: conditionScroll.isDragging ? 'grabbing' : 'grab' }}
            {...conditionScroll.scrollHandlers}
          >
            <button
              onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(null); onFormChange(null); }}
              className="flex-shrink-0 px-4 rounded-full text-[13px] flex items-center gap-1.5"
              style={{ ...goalPillStyle(!activeCondition && !activeForm), minHeight: 44 }}
            >
              <LayoutGrid className="w-4 h-4" />
              All
            </button>
            {(conditions || []).map((condition) => {
              const isActive = activeCondition === condition.slug;
              const Icon = getConditionIcon(condition.slug);
              return (
                <button
                  key={condition.id}
                  onClick={() => { if (conditionScroll.isDragging) return; onConditionChange(isActive ? null : condition.slug); }}
                  className="flex-shrink-0 px-4 rounded-full text-[13px] flex items-center gap-1.5"
                  style={{ ...goalPillStyle(isActive), minHeight: 44 }}
                >
                  <Icon className="w-4 h-4" />
                  {condition.name}
                </button>
              );
            })}
          </div>

          {/* Row 3: Form pills + Sort */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {FORMS.map((form) => {
              const isActive = activeForm === form.slug;
              const Icon = FORM_ICON_MAP[form.slug] || Leaf;
              return (
                <button
                  key={form.slug}
                  onClick={() => onFormChange(isActive ? null : form.slug)}
                  className="flex-shrink-0 px-3 rounded-full text-[13px] flex items-center gap-1"
                  style={{ ...formPillStyle(isActive), minHeight: 44 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {form.label}
                </button>
              );
            })}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex-shrink-0 ml-auto w-9 h-9 rounded-full flex items-center justify-center"
              style={{ border: '1px solid #d4d0c8', color: '#555' }}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Product count */}
          <p className="text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#888' }}>
            {totalProducts} product{totalProducts !== 1 ? 's' : ''}
          </p>

          {/* Active filter tags */}
          {(activeCondition || activeForm) && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {activeConditionName && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs" style={{ background: '#1b4332', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
                  {activeConditionName}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onConditionChange(null)} />
                </span>
              )}
              {activeFormName && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs" style={{ background: '#2d6a4f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
                  {activeFormName}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onFormChange(null)} />
                </span>
              )}
              <button onClick={() => { onConditionChange(null); onFormChange(null); }} className="text-xs underline flex-shrink-0" style={{ color: '#888', fontFamily: "'DM Sans', sans-serif" }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile Filter/Sort Drawer ─── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl max-h-[80vh] overflow-y-auto pb-8" style={{ background: '#f5f0e8' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 18, color: '#333' }}>Sort</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2">
                <X className="w-5 h-5" style={{ color: '#333' }} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onSortChange(opt.value); setShowMobileFilters(false); }}
                    className="px-4 py-2.5 rounded-full text-sm"
                    style={{
                      background: sortBy === opt.value ? '#1b4332' : '#ffffff',
                      color: sortBy === opt.value ? '#ffffff' : '#555',
                      border: sortBy === opt.value ? '1px solid #1b4332' : '1px solid #d4d0c8',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: sortBy === opt.value ? 600 : 400,
                      minHeight: 44,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
