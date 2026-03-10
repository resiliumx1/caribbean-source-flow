import { useConditions } from "@/hooks/use-conditions";

const FORMS = [
  { label: "Tinctures", slug: "tinctures" },
  { label: "Capsules", slug: "capsules" },
  { label: "Teas", slug: "teas" },
  { label: "Bulk", slug: "raw-herbs" },
];

interface ShopFilterNavProps {
  activeCondition: string | null;
  onConditionChange: (condition: string | null) => void;
  activeForm: string | null;
  onFormChange: (form: string | null) => void;
}

export function ShopFilterNav({
  activeCondition,
  onConditionChange,
  activeForm,
  onFormChange,
}: ShopFilterNavProps) {
  const { data: conditions } = useConditions();

  return (
    <div
      id="filter-nav"
      className="sticky top-16 z-30 border-b transition-colors duration-300"
      style={{
        background: "var(--site-nav-bg)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(188,138,95,0.2)",
      }}
    >
      <div className="container mx-auto px-4 py-3">
        {/* Row 1: Conditions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span
            className="flex-shrink-0 mr-1"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--site-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Shop by Condition:
          </span>
          {(conditions || []).map((condition) => {
            const isActive = activeCondition === condition.slug;
            return (
              <button
                key={condition.id}
                onClick={() =>
                  onConditionChange(isActive ? null : condition.slug)
                }
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all min-h-[36px]"
                style={{
                  background: isActive
                    ? "var(--site-gold)"
                    : "var(--site-bg-card)",
                  color: isActive
                    ? "var(--site-green-dark)"
                    : "var(--site-text-primary)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  border: isActive
                    ? "1px solid var(--site-gold)"
                    : "1px solid var(--site-border)",
                }}
              >
                {condition.name}
              </button>
            );
          })}
        </div>

        {/* Row 2: Forms — styled with distinct borders like conditions */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span
            className="flex-shrink-0 mr-1"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--site-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            By Form:
          </span>
          {FORMS.map((form) => {
            const isActive = activeForm === form.slug;
            return (
              <button
                key={form.slug}
                onClick={() =>
                  onFormChange(isActive ? null : form.slug)
                }
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all min-h-[36px]"
                style={{
                  background: isActive
                    ? "var(--site-gold)"
                    : "var(--site-bg-card)",
                  color: isActive
                    ? "var(--site-green-dark)"
                    : "var(--site-text-primary)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  border: isActive
                    ? "1px solid var(--site-gold)"
                    : "1px solid var(--site-border)",
                }}
              >
                {form.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
