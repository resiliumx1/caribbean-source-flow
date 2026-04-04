import { useConditions } from "@/hooks/use-conditions";
import { useState, useEffect, useRef, useCallback } from "react";
import { SearchDropdown } from "./SearchDropdown";
import type { Product } from "@/hooks/use-products";
import {
  ChevronDown, X, SlidersHorizontal, Search, Check,
  LayoutGrid, Flame, Moon, ShieldCheck, Dumbbell, Heart, Package,
  Droplets, Pill, Coffee, BookOpen, Leaf, Sparkles,
  Utensils, RefreshCw, Activity, Sun, Wind, Zap, Compass, FlaskConical,
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
  digestion: Utensils,
  "gut-health": Utensils,
  "gut-health-digestion": Utensils,
  detox: RefreshCw,
  circulation: Activity,
  pain: Flame,
  "inflammation-pain": Flame,
  "inflammation": Flame,
  skin: Sun,
  respiratory: Wind,
  energy: Zap,
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
  totalAllProducts: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  conditionCounts?: Map<string, number>;
  allProducts?: Product[];
}

export function ShopFilterNav({
  activeCondition,
  onConditionChange,
  activeForm,
  onFormChange,
  sortBy,
  onSortChange,
  totalProducts,
  totalAllProducts,
  searchQuery,
  onSearchChange,
  conditionCounts,
  allProducts,
}: ShopFilterNavProps) {
  const { data: conditions } = useConditions();
  const [goalOpen, setGoalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<"goal" | "form" | "sort" | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const goalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const activeCount = (activeCondition ? 1 : 0) + (activeForm ? 1 : 0);
  const activeConditionName = conditions?.find(c => c.slug === activeCondition)?.name;
  const activeFormName = FORMS.find(f => f.slug === activeForm)?.label;
  const isFiltered = !!activeCondition || !!activeForm;

  // Sticky shadow
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

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (goalOpen && goalRef.current && !goalRef.current.contains(e.target as Node)) setGoalOpen(false);
      if (formOpen && formRef.current && !formRef.current.contains(e.target as Node)) setFormOpen(false);
      if (showSearchDropdown && searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) setShowSearchDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [goalOpen, formOpen, showSearchDropdown]);

  const productCountLabel = () => {
    if (searchQuery) return `${totalProducts} result${totalProducts !== 1 ? 's' : ''}`;
    if (isFiltered) return `${totalProducts} of ${totalAllProducts} products`;
    return `${totalAllProducts} products`;
  };

  const pillBtn = (active: boolean): React.CSSProperties => ({
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: 13,
    background: active ? '#1b4332' : '#ffffff',
    color: active ? '#ffffff' : '#555',
    border: active ? '1px solid #1b4332' : '1px solid #d4d0c8',
    transition: 'all 0.2s ease',
  });

  // Dropdown option row
  const OptionRow = ({ icon: Icon, label, active, count, onClick }: { icon: React.ElementType; label: string; active: boolean; count?: number; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
      style={{
        background: active ? 'rgba(27,67,50,0.08)' : 'transparent',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: active ? '#1b4332' : '#333',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget.style.background = '#f5f0e8'); }}
      onMouseLeave={e => { if (!active) (e.currentTarget.style.background = 'transparent'); }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? '#1b4332' : '#888' }} />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: 12, color: '#999' }}>({count})</span>
      )}
      {active && <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#1b4332' }} />}
    </button>
  );

  // Dropdown panel
  const DropdownPanel = ({ children }: { children: React.ReactNode }) => (
    <div
      className="absolute left-0 top-full mt-2 z-50 min-w-[260px]"
      style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
        maxHeight: 400,
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );

  // Mobile bottom sheet
  const BottomSheet = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl pb-8"
        style={{
          background: '#ffffff',
          maxHeight: '60vh',
          overflowY: 'auto',
          animation: 'sheetUp 200ms ease-out forwards',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#ddd' }} />
        </div>
        <div className="flex items-center justify-between px-4 pb-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 18, color: '#333' }}>{title}</h3>
          <button onClick={onClose} className="p-2"><X className="w-5 h-5" style={{ color: '#333' }} /></button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );

  // Active filter badge
  const ActiveFilterBadge = () => {
    if (!isFiltered) return null;
    const parts: string[] = [];
    if (activeConditionName) parts.push(activeConditionName);
    if (activeFormName) parts.push(activeFormName);
    return (
      <div
        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg"
        style={{
          background: '#f5f0e8',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: '#555',
          animation: 'filterBadgeIn 150ms ease-out forwards',
        }}
      >
        <span>Filtered: {parts.join(' + ')}</span>
        <button
          onClick={() => { onConditionChange(null); onFormChange(null); }}
          className="flex-shrink-0 underline"
          style={{ color: '#888', fontSize: 12 }}
        >
          Clear all ✕
        </button>
      </div>
    );
  };

  return (
    <>
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
        <div className="hidden lg:block container mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Goal dropdown */}
            <div ref={goalRef} className="relative">
              {activeCondition ? (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]"
                  style={pillBtn(true)}
                >
                  {(() => { const Icon = getConditionIcon(activeCondition); return <Icon className="w-4 h-4" />; })()}
                  <span>{activeConditionName}</span>
                  <X
                    className="w-3.5 h-3.5 ml-1 cursor-pointer hover:opacity-70"
                    onClick={(e) => { e.stopPropagation(); onConditionChange(null); }}
                  />
                </button>
              ) : (
                <button
                  onClick={() => { setGoalOpen(!goalOpen); setFormOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]"
                  style={pillBtn(false)}
                >
                  <Compass className="w-4 h-4" style={{ animation: 'gentleSpin 8s linear infinite' }} /> Shop by Goal <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
              {goalOpen && (
                <DropdownPanel>
                  <OptionRow
                    icon={LayoutGrid}
                    label="All"
                    active={!activeCondition}
                    onClick={() => { onConditionChange(null); setGoalOpen(false); }}
                  />
                  {(conditions || []).map(c => (
                    <OptionRow
                      key={c.id}
                      icon={getConditionIcon(c.slug)}
                      label={c.name}
                      active={activeCondition === c.slug}
                      count={conditionCounts?.get(c.slug)}
                      onClick={() => {
                        onConditionChange(activeCondition === c.slug ? null : c.slug);
                        setGoalOpen(false);
                      }}
                    />
                  ))}
                </DropdownPanel>
              )}
            </div>

            {/* Form dropdown */}
            <div ref={formRef} className="relative">
              {activeForm ? (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]"
                  style={pillBtn(true)}
                >
                  {(() => { const Icon = FORM_ICON_MAP[activeForm] || Leaf; return <Icon className="w-4 h-4" />; })()}
                  <span>{activeFormName}</span>
                  <X
                    className="w-3.5 h-3.5 ml-1 cursor-pointer hover:opacity-70"
                    onClick={(e) => { e.stopPropagation(); onFormChange(null); }}
                  />
                </button>
              ) : (
                <button
                  onClick={() => { setFormOpen(!formOpen); setGoalOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]"
                  style={pillBtn(false)}
                >
                  📦 Form <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
              {formOpen && (
                <DropdownPanel>
                  <OptionRow
                    icon={LayoutGrid}
                    label="All Forms"
                    active={!activeForm}
                    onClick={() => { onFormChange(null); setFormOpen(false); }}
                  />
                  {FORMS.map(f => {
                    const Icon = FORM_ICON_MAP[f.slug] || Leaf;
                    return (
                      <OptionRow
                        key={f.slug}
                        icon={Icon}
                        label={f.label}
                        active={activeForm === f.slug}
                        onClick={() => {
                          onFormChange(activeForm === f.slug ? null : f.slug);
                          setFormOpen(false);
                        }}
                      />
                    );
                  })}
                </DropdownPanel>
              )}
            </div>

            {/* Search */}
            <div ref={searchContainerRef} className="relative flex-shrink-0" style={{ width: 220 }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { onSearchChange(e.target.value); setShowSearchDropdown(e.target.value.length > 0); }}
                placeholder="Search products..."
                className="w-full h-9 pl-9 pr-8 rounded-full text-[13px] outline-none"
                style={{ background: '#ffffff', border: '1px solid #d4d0c8', fontFamily: "'DM Sans', sans-serif", color: '#333' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#1b4332'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(27,67,50,0.15)'; if (searchQuery) setShowSearchDropdown(true); }}
                onBlur={e => { e.currentTarget.style.borderColor = '#d4d0c8'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {searchQuery && (
                <button onClick={() => { onSearchChange(''); setShowSearchDropdown(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4" style={{ color: '#999' }} />
                </button>
              )}
              <SearchDropdown
                query={searchQuery}
                products={allProducts || []}
                isOpen={showSearchDropdown}
                onClose={() => setShowSearchDropdown(false)}
                onViewAll={(q) => { onSearchChange(q); setShowSearchDropdown(false); }}
              />
            </div>

            {/* Count + Sort */}
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <span className="px-2.5 py-1 rounded-full text-[11px]" style={{ border: '1px solid #1b4332', color: '#1b4332', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: 'nowrap' }}>
                {productCountLabel()}
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
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { onSortChange(opt.value); setShowSortDropdown(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                          style={{ color: sortBy === opt.value ? '#1b4332' : '#333', fontFamily: "'DM Sans', sans-serif", fontWeight: sortBy === opt.value ? 600 : 400 }}
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

          {/* Active filter badge - desktop */}
          <ActiveFilterBadge />
        </div>

        {/* ─── Tablet Layout (768–1023px) ─── */}
        <div className="hidden md:flex lg:hidden flex-col container mx-auto px-6 py-3 gap-2">
          {/* Row 1: Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { onSearchChange(e.target.value); setShowSearchDropdown(e.target.value.length > 0); }}
              placeholder="Search products..."
              className="w-full h-9 pl-9 pr-8 rounded-full text-[13px] outline-none"
              style={{ background: '#ffffff', border: '1px solid #d4d0c8', fontFamily: "'DM Sans', sans-serif", color: '#333' }}
              onFocus={() => { if (searchQuery) setShowSearchDropdown(true); }}
            />
            {searchQuery && (
              <button onClick={() => { onSearchChange(''); setShowSearchDropdown(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: '#999' }} />
              </button>
            )}
            <SearchDropdown
              query={searchQuery}
              products={allProducts || []}
              isOpen={showSearchDropdown}
              onClose={() => setShowSearchDropdown(false)}
              onViewAll={(q) => { onSearchChange(q); setShowSearchDropdown(false); }}
            />
          </div>

          {/* Row 2: Filter dropdowns + Count + Sort */}
          <div className="flex items-center gap-2">
            {/* Goal dropdown */}
            <div ref={goalRef} className="relative">
              {activeCondition ? (
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px]" style={pillBtn(true)}>
                  {activeConditionName}
                  <X className="w-3 h-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); onConditionChange(null); }} />
                </button>
              ) : (
                <button onClick={() => { setGoalOpen(!goalOpen); setFormOpen(false); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px]" style={pillBtn(false)}>
                  🎯 Goal <ChevronDown className="w-3 h-3" />
                </button>
              )}
              {goalOpen && (
                <DropdownPanel>
                  <OptionRow icon={LayoutGrid} label="All" active={!activeCondition} onClick={() => { onConditionChange(null); setGoalOpen(false); }} />
                  {(conditions || []).map(c => (
                    <OptionRow key={c.id} icon={getConditionIcon(c.slug)} label={c.name} active={activeCondition === c.slug} count={conditionCounts?.get(c.slug)} onClick={() => { onConditionChange(activeCondition === c.slug ? null : c.slug); setGoalOpen(false); }} />
                  ))}
                </DropdownPanel>
              )}
            </div>

            {/* Form dropdown */}
            <div ref={formRef} className="relative">
              {activeForm ? (
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px]" style={pillBtn(true)}>
                  {activeFormName}
                  <X className="w-3 h-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); onFormChange(null); }} />
                </button>
              ) : (
                <button onClick={() => { setFormOpen(!formOpen); setGoalOpen(false); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px]" style={pillBtn(false)}>
                  📦 Form <ChevronDown className="w-3 h-3" />
                </button>
              )}
              {formOpen && (
                <DropdownPanel>
                  <OptionRow icon={LayoutGrid} label="All Forms" active={!activeForm} onClick={() => { onFormChange(null); setFormOpen(false); }} />
                  {FORMS.map(f => (
                    <OptionRow key={f.slug} icon={FORM_ICON_MAP[f.slug] || Leaf} label={f.label} active={activeForm === f.slug} onClick={() => { onFormChange(activeForm === f.slug ? null : f.slug); setFormOpen(false); }} />
                  ))}
                </DropdownPanel>
              )}
            </div>

            <span className="ml-auto px-2.5 py-1 rounded-full text-[11px]" style={{ border: '1px solid #1b4332', color: '#1b4332', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: 'nowrap' }}>
              {productCountLabel()}
            </span>
            <div className="relative">
              <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="h-9 px-3 rounded-lg text-[13px] flex items-center gap-1" style={{ border: '1px solid #d4d0c8', color: '#555', fontFamily: "'DM Sans', sans-serif" }}>
                Sort <ChevronDown className="w-3 h-3" />
              </button>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-xl py-1 min-w-[180px]" style={{ background: '#ffffff', border: '1px solid #d4d0c8' }}>
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => { onSortChange(opt.value); setShowSortDropdown(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-black/5" style={{ color: sortBy === opt.value ? '#1b4332' : '#333', fontFamily: "'DM Sans', sans-serif", fontWeight: sortBy === opt.value ? 600 : 400 }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <ActiveFilterBadge />
        </div>

        {/* ─── Mobile Layout (<768px) ─── */}
        <div className="md:hidden flex flex-col gap-1.5 px-4 py-3">
          {/* Row 1: Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { onSearchChange(e.target.value); setShowSearchDropdown(e.target.value.length > 0); }}
              placeholder="Search products..."
              className="w-full rounded-full text-[13px] outline-none"
              style={{ height: 44, paddingLeft: 36, paddingRight: 36, background: '#ffffff', border: '1px solid #d4d0c8', fontFamily: "'DM Sans', sans-serif", color: '#333' }}
              onFocus={() => { if (searchQuery) setShowSearchDropdown(true); }}
            />
            {searchQuery && (
              <button onClick={() => { onSearchChange(''); setShowSearchDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: '#999' }} />
              </button>
            )}
            <SearchDropdown
              query={searchQuery}
              products={allProducts || []}
              isOpen={showSearchDropdown}
              onClose={() => setShowSearchDropdown(false)}
              onViewAll={(q) => { onSearchChange(q); setShowSearchDropdown(false); }}
            />
          </div>

          {/* Row 2: Filter buttons + Sort */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSheet("goal")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full text-[13px]"
              style={{ ...pillBtn(!!activeCondition), minHeight: 44 }}
            >
              {activeCondition ? (
                <>
                  {activeConditionName}
                  <X className="w-3.5 h-3.5" onClick={(e) => { e.stopPropagation(); onConditionChange(null); }} />
                </>
              ) : (
                <>🎯 Goal <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
            <button
              onClick={() => setMobileSheet("form")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full text-[13px]"
              style={{ ...pillBtn(!!activeForm), minHeight: 44 }}
            >
              {activeForm ? (
                <>
                  {activeFormName}
                  <X className="w-3.5 h-3.5" onClick={(e) => { e.stopPropagation(); onFormChange(null); }} />
                </>
              ) : (
                <>📦 Form <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
            <button
              onClick={() => setMobileSheet("sort")}
              className="flex-shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center"
              style={{ border: '1px solid #d4d0c8', color: '#555', background: '#fff' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Product count */}
          <p className="text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#888' }}>
            {productCountLabel()}
          </p>

          {/* Active filter badge - mobile */}
          <ActiveFilterBadge />
        </div>
      </div>

      {/* ─── Mobile Bottom Sheets ─── */}
      {mobileSheet === "goal" && (
        <BottomSheet title="Shop by Goal" onClose={() => setMobileSheet(null)}>
          <OptionRow icon={LayoutGrid} label="All" active={!activeCondition} onClick={() => { onConditionChange(null); setMobileSheet(null); }} />
          {(conditions || []).map(c => (
            <OptionRow key={c.id} icon={getConditionIcon(c.slug)} label={c.name} active={activeCondition === c.slug} count={conditionCounts?.get(c.slug)} onClick={() => { onConditionChange(activeCondition === c.slug ? null : c.slug); setMobileSheet(null); }} />
          ))}
        </BottomSheet>
      )}

      {mobileSheet === "form" && (
        <BottomSheet title="Product Form" onClose={() => setMobileSheet(null)}>
          <OptionRow icon={LayoutGrid} label="All Forms" active={!activeForm} onClick={() => { onFormChange(null); setMobileSheet(null); }} />
          {FORMS.map(f => (
            <OptionRow key={f.slug} icon={FORM_ICON_MAP[f.slug] || Leaf} label={f.label} active={activeForm === f.slug} onClick={() => { onFormChange(activeForm === f.slug ? null : f.slug); setMobileSheet(null); }} />
          ))}
        </BottomSheet>
      )}

      {mobileSheet === "sort" && (
        <BottomSheet title="Sort" onClose={() => setMobileSheet(null)}>
          {SORT_OPTIONS.map(opt => (
            <OptionRow key={opt.value} icon={LayoutGrid} label={opt.label} active={sortBy === opt.value} onClick={() => { onSortChange(opt.value); setMobileSheet(null); }} />
          ))}
        </BottomSheet>
      )}

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes filterBadgeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
