import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const plans = [
  {
    id: "full",
    label: "Pay in Full",
    total: 7400,
    originalTotal: 8300,
    perPayment: 7400,
    payments: 1,
    savings: 900,
    badge: "BEST VALUE",
    badgeColor: "bg-accent text-accent-foreground",
    icon: Sparkles,
    schedule: "One-time payment today",
  },
  {
    id: "2-pay",
    label: "2 Payments",
    total: 8000,
    originalTotal: 8300,
    perPayment: 4000,
    payments: 2,
    savings: 300,
    badge: null,
    badgeColor: "",
    icon: null,
    schedule: "$4,000 today, then $4,000 in 30 days",
  },
  {
    id: "3-pay",
    label: "3 Payments",
    total: 8300,
    originalTotal: null,
    perPayment: 2766.67,
    payments: 3,
    savings: 0,
    badge: null,
    badgeColor: "",
    icon: null,
    schedule: "$2,766.67 today, then 2 monthly payments",
  },
  {
    id: "4-pay",
    label: "4 Payments",
    total: 8300,
    originalTotal: null,
    perPayment: 2075,
    payments: 4,
    savings: 0,
    badge: "MOST FLEXIBLE",
    badgeColor: "bg-emerald-600 text-white",
    icon: Zap,
    schedule: "$2,075 today, then 3 monthly payments",
  },
];

export function PaymentCalculator() {
  const [selected, setSelected] = useState("full");
  const plan = plans.find((p) => p.id === selected)!;

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-12">
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Investment & Payment Plans
          </h2>
          <p
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
            className="text-lg text-muted-foreground"
          >
            Choose the plan that works for you. No credit check required.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 transition-all duration-300 text-left",
                selected === p.id
                  ? "border-accent bg-accent/5 shadow-md"
                  : "border-border bg-card hover:border-accent/30"
              )}
            >
              {/* Radio */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  selected === p.id ? "border-accent bg-accent" : "border-muted-foreground/30"
                )}
              >
                {selected === p.id && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    style={{ fontFamily: "'Jost', sans-serif", fontWeight: 600 }}
                    className="text-foreground"
                  >
                    {p.label}
                  </span>
                  {p.badge && (
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", p.badgeColor)}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                  {p.schedule}
                </p>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-baseline gap-1.5">
                  {p.originalTotal && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${p.originalTotal.toLocaleString()}
                    </span>
                  )}
                  <span className="text-lg font-bold text-foreground">
                    ${p.perPayment.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {p.savings > 0 && (
                  <span className="text-xs text-accent font-semibold">Save ${p.savings}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Dynamic total */}
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-5 text-center mb-6"
        >
          <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>
            Total program cost
          </p>
          <p className="text-3xl font-bold text-foreground">
            ${plan.total.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
            {plan.schedule}
          </p>
        </motion.div>

        <div className="text-center">
          <a
            href="https://schools.mountkailashslu.com/hsek-application/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="hero" size="xl" className="min-h-[48px]">
              Enroll Now — ${plan.perPayment.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}{plan.payments > 1 ? "/mo" : ""}
            </Button>
          </a>
          <p className="text-xs text-muted-foreground mt-3" style={{ fontFamily: "'Jost', sans-serif" }}>
            Payment plans available for all options. No credit check required.
          </p>
        </div>
      </div>
    </section>
  );
}
