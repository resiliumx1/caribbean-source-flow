import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, CheckCircle2, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type FailedOrderAlert = {
  id: string;
  paypal_capture_id: string;
  paypal_order_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  amount_usd: number | null;
  error_message: string | null;
  resolved: boolean;
  created_at: string;
};

type PaymentAttempt = {
  id: string;
  stage: string;
  error_name: string | null;
  error_message: string | null;
  paypal_order_id: string | null;
  cart_total_usd: number | null;
  customer_email: string | null;
  created_at: string;
};

type EmailFailure = {
  id: string;
  email_type: string;
  recipient: string | null;
  error_message: string;
  created_at: string;
};

function when(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function AdminPaymentAlerts() {
  const [captureAlerts, setCaptureAlerts] = useState<FailedOrderAlert[]>([]);
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [emailFailures, setEmailFailures] = useState<EmailFailure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      supabase.from("failed_order_alerts").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("payment_attempts").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("email_send_failures").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setCaptureAlerts((a.data as FailedOrderAlert[]) || []);
    setAttempts((b.data as PaymentAttempt[]) || []);
    setEmailFailures((c.data as EmailFailure[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("payment-alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "failed_order_alerts" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_attempts" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const resolve = async (id: string, resolved: boolean) => {
    const { error } = await supabase.from("failed_order_alerts").update({ resolved }).eq("id", id);
    if (error) {
      toast({ title: "Could not update alert", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: resolved ? "Marked as resolved" : "Reopened" });
    fetchAll();
  };

  const webhookFailures = attempts.filter((a) => a.stage?.toLowerCase().startsWith("webhook"));
  const otherFailures = attempts.filter((a) => !a.stage?.toLowerCase().startsWith("webhook"));
  const visibleCaptureAlerts = showResolved ? captureAlerts : captureAlerts.filter((a) => !a.resolved);
  const openCount = captureAlerts.filter((a) => !a.resolved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Payment Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Failed webhooks and captured payments that never became orders.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Unmatched captures", value: openCount, tone: openCount > 0 },
          { label: "Webhook failures", value: webhookFailures.length, tone: webhookFailures.length > 0 },
          { label: "Email failures", value: emailFailures.length, tone: emailFailures.length > 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${s.tone ? "text-destructive" : "text-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Captured but no order */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Payments captured without an order
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setShowResolved((v) => !v)}>
            {showResolved ? "Hide resolved" : "Show resolved"}
          </Button>
        </div>
        {visibleCaptureAlerts.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            No unmatched captures. Every successful payment created an order.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleCaptureAlerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {a.customer_name || a.customer_email || "Unknown customer"}
                      {a.amount_usd != null && <span className="ml-2 text-muted-foreground">${Number(a.amount_usd).toFixed(2)}</span>}
                    </p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      Txn {a.paypal_capture_id}
                      {a.paypal_order_id ? ` · Order ref ${a.paypal_order_id}` : ""}
                      {a.customer_email ? ` · ${a.customer_email}` : ""}
                    </p>
                    {a.error_message && (
                      <p className="mt-2 rounded bg-destructive/10 p-2 text-xs text-destructive">{a.error_message}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">{when(a.created_at)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={a.resolved ? "outline" : "default"}
                    className="gap-2"
                    onClick={() => resolve(a.id, !a.resolved)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {a.resolved ? "Reopen" : "Mark resolved"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Webhook failures */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Payment provider webhook failures</h2>
        {webhookFailures.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            No webhook failures logged.
          </p>
        ) : (
          <div className="space-y-2">
            {webhookFailures.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card p-4 text-sm">
                <p className="font-medium text-foreground">{a.error_name || "Webhook error"} · {a.stage}</p>
                <p className="mt-1 break-words text-xs text-muted-foreground">{a.error_message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {when(a.created_at)}{a.customer_email ? ` · ${a.customer_email}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Other payment attempt failures */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Failed payment attempts</h2>
        {otherFailures.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            No failed checkout attempts logged.
          </p>
        ) : (
          <div className="space-y-2">
            {otherFailures.slice(0, 30).map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card p-4 text-sm">
                <p className="font-medium text-foreground">
                  {a.error_name || "Error"} · {a.stage}
                  {a.cart_total_usd != null && <span className="ml-2 text-muted-foreground">${Number(a.cart_total_usd).toFixed(2)}</span>}
                </p>
                <p className="mt-1 break-words text-xs text-muted-foreground">{a.error_message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {when(a.created_at)}{a.customer_email ? ` · ${a.customer_email}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Email failures */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
          <Mail className="h-4 w-4" /> Notification email failures
        </h2>
        {emailFailures.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            No email delivery failures.
          </p>
        ) : (
          <div className="space-y-2">
            {emailFailures.map((e) => (
              <div key={e.id} className="rounded-lg border border-border bg-card p-4 text-sm">
                <p className="font-medium text-foreground">{e.email_type} → {e.recipient || "unknown"}</p>
                <p className="mt-1 break-words text-xs text-muted-foreground">{e.error_message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{when(e.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
