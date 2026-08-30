import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthorizeNetCardForm, type OpaqueData } from "@/components/payments/AuthorizeNetCardForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Loader2, ShieldCheck, Lock, CalendarClock, RefreshCw } from "lucide-react";

type Plan = {
  id: string;
  customer_name: string;
  package_name: string;
  total_amount: number;
  amount_paid: number;
  balance_remaining: number;
  min_payment: number | null;
  status: string;
  customer_email?: string | null;
};

const fmt = (n: number | string) => `$${Number(n).toFixed(2)}`;

/** Normalise a user-typed money string to a plain number.
 *  Strips currency symbols/spaces, removes thousands separators, and converts
 *  comma decimals ("1227,60") to period decimals. Returns null on NaN. */
function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/[$€£\s ]/g, "");
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > lastDot) {
    // comma is the decimal separator: drop dots (thousands), swap comma
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    // dot is decimal (or none): drop commas (thousands)
    s = s.replace(/,/g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Pull the real error message out of a failed edge-function call. */
async function extractFnError(error: any, resError?: string | null, fallback = "Payment failed."): Promise<string> {
  if (resError) return resError;
  if (error) {
    try {
      const ctx = error?.context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json().catch(() => null);
        console.log("Edge function error body:", body);
        if (body?.error) return String(body.error);
        if (body?.message) return String(body.message);
      } else if (ctx && typeof ctx.text === "function") {
        const text = await ctx.text().catch(() => "");
        console.log("Edge function error text:", text);
        try {
          const body = JSON.parse(text);
          if (body?.error) return String(body.error);
          if (body?.message) return String(body.message);
        } catch { /* not JSON */ }
        if (text) return text.slice(0, 300);
      }
    } catch { /* fall through */ }
    if (error?.message) return String(error.message);
  }
  return fallback;
}

export default function PaymentPlanPay() {
  const { planId } = useParams<{ planId: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ amount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"once" | "auto">("once");
  const [cadence, setCadence] = useState<"weekly" | "biweekly" | "monthly">("monthly");
  const [schedule, setSchedule] = useState<{ amount: number; cadence: string; next_run_date: string | null } | null>(null);
  const [autoDone, setAutoDone] = useState(false);

  const load = async () => {
    if (!planId) return;
    const { data: res, error } = await supabase.functions.invoke("get-payment-plan", {
      body: { planId },
    });
    const payload = res as { plan?: Plan; schedule?: typeof schedule } | null;
    const data = payload?.plan;
    if (error || !data) {
      setNotFound(true);
    } else {
      setPlan(data as Plan);
      setSchedule(payload?.schedule ?? null);
      setAmount(Number(data.balance_remaining).toFixed(2));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [planId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>Payment plan not found</h1>
          <p className="text-muted-foreground">This link is invalid or has been removed. Please contact Mount Kailash for assistance.</p>
        </div>
      </div>
    );
  }

  const paid = plan.status === "paid" || Number(plan.balance_remaining) <= 0;
  const min = Number(plan.min_payment ?? 1);
  const remaining = Number(plan.balance_remaining);
  const amtNum = parseAmount(amount);
  const validAmount =
    amtNum !== null && amtNum > 0 && amtNum >= Math.min(min, remaining) && amtNum <= remaining;

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "DM Sans, sans-serif",
        background:
          "linear-gradient(180deg, #f5f1e8 0%, #faf7f0 35%, #ffffff 100%)",
      }}
    >
      <Helmet>
        <title>Payment · Mount Kailash Rejuvenation Centre</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <header className="text-center mb-8 sm:mb-10">
          <img
            src="/star-seal-for-lovable.png"
            alt="Mount Kailash"
            width={64}
            height={64}
            className="mx-auto mb-4"
            style={{ filter: "invert(20%) sepia(40%) saturate(500%) hue-rotate(100deg) brightness(85%)" }}
          />
          <h1
            className="text-3xl sm:text-4xl leading-tight mb-2"
            style={{ fontFamily: "Cormorant Garamond, serif", color: "#1b4332" }}
          >
            Mount Kailash Rejuvenation Centre
          </h1>
          <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Secure payment portal
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card shadow-[0_8px_30px_-12px_rgba(27,67,50,0.18)] overflow-hidden">
          <div className="px-6 py-5 sm:px-8 sm:py-6" style={{ background: "#1b4332", color: "white" }}>
            <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">Payment for</p>
            <p className="text-xl sm:text-2xl font-semibold mt-1">{plan.customer_name}</p>
            <p className="text-sm opacity-90 mt-1">{plan.package_name}</p>
          </div>

          {/* Balance summary + progress */}
          <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-border">
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Remaining balance</p>
              <p className="text-xs text-muted-foreground">
                {fmt(plan.amount_paid)} of {fmt(plan.total_amount)} paid
              </p>
            </div>
            <p
              className="text-4xl sm:text-5xl font-semibold tracking-tight"
              style={{ color: "#1b4332", fontFamily: "Cormorant Garamond, serif" }}
            >
              {fmt(plan.balance_remaining)}
            </p>
            {(() => {
              const pct = Math.max(
                0,
                Math.min(100, (Number(plan.amount_paid) / Math.max(1, Number(plan.total_amount))) * 100),
              );
              return (
                <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: "#1b4332" }}
                  />
                </div>
              );
            })()}
          </div>

          <div className="p-6 sm:p-8">
            {paid ? (
              <div className="text-center py-10">
                <CheckCircle2 className="h-14 w-14 mx-auto mb-4" style={{ color: "#15803d" }} />
                <p className="text-2xl font-semibold" style={{ color: "#15803d", fontFamily: "Cormorant Garamond, serif" }}>
                  Paid in full
                </p>
                <p className="text-sm text-muted-foreground mt-2">Thank you for completing your payment.</p>
              </div>
            ) : receipt ? (
              <div className="text-center py-10">
                <CheckCircle2 className="h-14 w-14 mx-auto mb-4" style={{ color: "#15803d" }} />
                <p className="text-2xl font-semibold" style={{ color: "#15803d", fontFamily: "Cormorant Garamond, serif" }}>
                  Payment received — {fmt(receipt.amount)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Remaining balance: <strong>{fmt(plan.balance_remaining)}</strong>
                </p>
                {Number(plan.balance_remaining) > 0 && (
                  <button
                    className="mt-5 text-sm underline"
                    style={{ color: "#1b4332" }}
                    onClick={() => { setReceipt(null); setAmount(Number(plan.balance_remaining).toFixed(2)); }}
                  >
                    Make another payment
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <Label className="text-sm font-medium">Amount to pay now (USD)</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg h-12 pl-7 font-semibold"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                      Min {fmt(Math.min(min, remaining))} · Max {fmt(remaining)}
                    </p>
                    <div className="flex gap-1.5">
                      {[0.25, 0.5, 1].map((f) => {
                        const val = +(remaining * f).toFixed(2);
                        const label = f === 1 ? "Full" : `${f * 100}%`;
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setAmount(val.toFixed(2))}
                            className="text-xs px-2.5 py-1 rounded-md border border-border hover:border-foreground/40 transition-colors"
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-3 p-3 rounded border text-sm" style={{ background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" }}>
                    {error}
                  </div>
                )}

                {schedule ? (
                  <div className="mb-4 p-3 rounded-lg border border-border bg-muted/40 text-sm flex items-start gap-2">
                    <RefreshCw className="h-4 w-4 mt-0.5" style={{ color: "#1b4332" }} />
                    <div>
                      Automatic instalments of <strong>{fmt(schedule.amount)}</strong> are set up ({schedule.cadence})
                      {schedule.next_run_date ? `, next on ${schedule.next_run_date}` : ""}. You can still make an extra
                      payment below at any time.
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      {([["once", "Pay once"], ["auto", "Automatic instalments"]] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => { setMode(value); setError(null); }}
                          className="rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors"
                          style={{
                            borderColor: mode === value ? "#1b4332" : "hsl(var(--border))",
                            background: mode === value ? "#1b433212" : "transparent",
                            color: mode === value ? "#1b4332" : "inherit",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {mode === "auto" && (
                      <div className="rounded-lg border border-border p-3 space-y-2">
                        <Label className="text-sm font-medium inline-flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5" /> Charge this amount
                        </Label>
                        <Select value={cadence} onValueChange={(v) => setCadence(v as typeof cadence)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Every week</SelectItem>
                            <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                            <SelectItem value="monthly">Every month</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Your card is charged {fmt(amtNum || 0)} starting tomorrow until the balance of{" "}
                          {fmt(remaining)} is cleared. You can cancel any time by contacting us.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {autoDone && (
                  <div className="mb-4 p-3 rounded-lg border text-sm" style={{ background: "#dcfce7", borderColor: "#bbf7d0", color: "#166534" }}>
                    Automatic instalments are now active. You'll receive a receipt after each payment.
                  </div>
                )}

                {validAmount && amtNum !== null ? (
                  <AuthorizeNetCardForm
                    amountUsd={amtNum}
                    processing={processing}
                    defaultCardholderName={plan.customer_name}
                    buttonLabel={mode === "auto" && !schedule
                      ? `Start ${cadence} payments of $${amtNum.toFixed(2)}`
                      : undefined}
                    onToken={async ({ opaqueData, cardholderName, billingZip }: { opaqueData: OpaqueData; cardholderName: string; billingZip: string }) => {
                      setError(null);
                      setProcessing(true);
                      try {
                        if (mode === "auto" && !schedule) {
                          const { data: res, error } = await supabase.functions.invoke("plan-autobill", {
                            body: {
                              action: "setup",
                              planId: plan.id,
                              amount: amtNum,
                              cadence,
                              opaqueData,
                              cardholderName,
                              billingZip,
                              email: plan.customer_email ?? undefined,
                            },
                          });
                          if (error || !res?.success) {
                            const msg = await extractFnError(error, res?.error, "Could not set up automatic payments.");
                            setError(msg);
                            throw new Error(msg);
                          }
                          setAutoDone(true);
                          load();
                          return;
                        }
                        const { data: res, error } = await supabase.functions.invoke("authnet-plan-charge", {
                          body: {
                            planId: plan.id,
                            requestedAmount: amtNum,
                            opaqueData,
                            cardholderName,
                            billingZip,
                            email: plan.customer_email ?? undefined,
                          },
                        });
                        if (error || !res?.success) {
                          const msg = await extractFnError(error, res?.error);
                          setError(msg);
                          throw new Error(msg);
                        }
                        if (res.plan) setPlan(res.plan);
                        setReceipt({ amount: Number(res.amount) });
                        load();
                      } finally {
                        setProcessing(false);
                      }
                    }}
                  />
                ) : (
                  <div className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                    Enter an amount between {fmt(Math.min(min, remaining))} and {fmt(remaining)} to continue.
                  </div>
                )}

                <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Encrypted &amp; processed securely by Authorize.net
                </div>
              </>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Questions? Email{" "}
          <a href="mailto:info@mountkailashslu.com" className="underline">info@mountkailashslu.com</a>
        </p>
      </div>
    </div>
  );
}