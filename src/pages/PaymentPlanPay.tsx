import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Loader2, ShieldCheck, Lock } from "lucide-react";

type Plan = {
  id: string;
  customer_name: string;
  package_name: string;
  total_amount: number;
  amount_paid: number;
  balance_remaining: number;
  min_payment: number | null;
  status: string;
};

const fmt = (n: number | string) => `$${Number(n).toFixed(2)}`;

export default function PaymentPlanPay() {
  const { planId } = useParams<{ planId: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ amount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!planId) return;
    const { data, error } = await supabase
      .from("payment_plans")
      .select("id,customer_name,package_name,total_amount,amount_paid,balance_remaining,min_payment,status")
      .eq("id", planId)
      .maybeSingle();
    if (error || !data) {
      setNotFound(true);
    } else {
      setPlan(data as Plan);
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
  const amtNum = Number(amount);
  const validAmount =
    Number.isFinite(amtNum) && amtNum > 0 && amtNum >= Math.min(min, remaining) && amtNum <= remaining;

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
                      type="number"
                      inputMode="decimal"
                      min={Math.min(min, remaining)}
                      max={remaining}
                      step="0.01"
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

                {validAmount ? (
                  <div style={{ opacity: processing ? 0.6 : 1, pointerEvents: processing ? "none" : "auto" }}>
                    <PayPalButtons
                      key={amount}
                      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                      createOrder={async () => {
                        setError(null);
                        const { data, error } = await supabase.functions.invoke("create-paypal-plan-order", {
                          body: { planId: plan.id, requestedAmount: amtNum },
                        });
                        if (error || !data?.orderID) {
                          setError(data?.error || error?.message || "Could not start payment");
                          throw new Error(data?.error || error?.message || "create order failed");
                        }
                        return data.orderID as string;
                      }}
                      onApprove={async (data) => {
                        setProcessing(true);
                        try {
                          const { data: res, error } = await supabase.functions.invoke("capture-paypal-plan-order", {
                            body: { orderID: data.orderID },
                          });
                          if (error || !res?.success) {
                            setError(res?.error || error?.message || "Capture failed");
                          } else {
                            if (res.plan) setPlan(res.plan);
                            setReceipt({ amount: Number(res.amount) });
                          }
                        } finally {
                          setProcessing(false);
                        }
                      }}
                      onError={(err) => {
                        console.error("PayPal error", err);
                        setError("PayPal encountered an error. Please try again.");
                      }}
                    />
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                    Enter an amount between {fmt(Math.min(min, remaining))} and {fmt(remaining)} to continue.
                  </div>
                )}

                <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Encrypted &amp; processed securely by PayPal
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