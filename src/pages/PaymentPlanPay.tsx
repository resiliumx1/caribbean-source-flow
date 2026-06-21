import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-background" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <Helmet>
        <title>Payment · Mount Kailash Rejuvenation Centre</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-xl mx-auto px-5 py-12">
        <header className="text-center mb-8">
          <img src="/star-seal-for-lovable.png" alt="Mount Kailash" width={56} height={56} className="mx-auto mb-3" style={{ filter: "invert(20%) sepia(40%) saturate(500%) hue-rotate(100deg) brightness(85%)" }} />
          <h1 className="text-3xl mb-1" style={{ fontFamily: "Cormorant Garamond, serif", color: "#1b4332" }}>
            Mount Kailash Rejuvenation Centre
          </h1>
          <p className="text-sm text-muted-foreground">Secure payment portal</p>
        </header>

        <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border" style={{ background: "#1b4332", color: "white" }}>
            <p className="text-xs uppercase tracking-wide opacity-80">For</p>
            <p className="text-xl font-semibold">{plan.customer_name}</p>
            <p className="text-sm opacity-90 mt-1">{plan.package_name}</p>
          </div>

          <div className="p-6 grid grid-cols-3 gap-4 text-center border-b border-border">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground tracking-wide">Total</p>
              <p className="text-lg font-semibold">{fmt(plan.total_amount)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground tracking-wide">Paid</p>
              <p className="text-lg font-semibold">{fmt(plan.amount_paid)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground tracking-wide">Remaining</p>
              <p className="text-lg font-semibold" style={{ color: "#1b4332" }}>{fmt(plan.balance_remaining)}</p>
            </div>
          </div>

          <div className="p-6">
            {paid ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3" style={{ color: "#15803d" }} />
                <p className="text-xl font-semibold" style={{ color: "#15803d", fontFamily: "Cormorant Garamond, serif" }}>
                  Paid in full
                </p>
                <p className="text-sm text-muted-foreground mt-1">Thank you for completing your payment.</p>
              </div>
            ) : receipt ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3" style={{ color: "#15803d" }} />
                <p className="text-xl font-semibold" style={{ color: "#15803d", fontFamily: "Cormorant Garamond, serif" }}>
                  Payment received — {fmt(receipt.amount)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Remaining balance: <strong>{fmt(plan.balance_remaining)}</strong>
                </p>
                {Number(plan.balance_remaining) > 0 && (
                  <button
                    className="mt-4 text-sm underline"
                    style={{ color: "#1b4332" }}
                    onClick={() => { setReceipt(null); setAmount(Number(plan.balance_remaining).toFixed(2)); }}
                  >
                    Make another payment
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <Label>Amount to pay now (USD)</Label>
                  <Input
                    type="number"
                    min={Math.min(min, remaining)}
                    max={remaining}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Minimum {fmt(Math.min(min, remaining))} · Maximum {fmt(remaining)}
                  </p>
                </div>

                {error && (
                  <div className="mb-3 p-3 rounded border text-sm" style={{ background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" }}>
                    {error}
                  </div>
                )}

                {validAmount && (
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
                )}
              </>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Payments are processed securely by PayPal. Questions? Email{" "}
          <a href="mailto:info@mountkailashslu.com" className="underline">info@mountkailashslu.com</a>
        </p>
      </div>
    </div>
  );
}