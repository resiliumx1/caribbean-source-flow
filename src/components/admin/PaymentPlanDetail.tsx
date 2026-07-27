import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2, RotateCcw, Undo2, RefreshCw, Ban, Archive, ArchiveRestore, CreditCard,
  AlertTriangle, History, Save,
} from "lucide-react";

export type Plan = {
  id: string;
  customer_name: string;
  customer_email: string;
  package_name: string;
  total_amount: number;
  amount_paid: number;
  balance_remaining: number;
  min_payment: number | null;
  status: string;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
};

type Payment = {
  id: string;
  plan_id: string;
  amount: number;
  paypal_capture_id: string;
  created_at: string;
  status: string;
  type: string;
  card_last4: string | null;
  card_type: string | null;
  refunded_amount: number;
  parent_payment_id: string | null;
  reason: string | null;
  admin_note: string | null;
};

type Schedule = {
  id: string;
  amount: number;
  cadence: string;
  status: string;
  next_run_date: string | null;
  last_run_at: string | null;
  last_error: string | null;
};

type AuditRow = {
  id: string;
  action: string;
  changes: Record<string, unknown>;
  actor_email: string | null;
  created_at: string;
};

const fmt = (n: number | string) => `$${Number(n).toFixed(2)}`;
const dt = (s: string) =>
  new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function PaymentPlanDetail({
  plan,
  open,
  onOpenChange,
  onChanged,
}: {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged: () => void;
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [edit, setEdit] = useState({
    customer_name: "", customer_email: "", package_name: "",
    total_amount: "", min_payment: "", status: "active", notes: "",
  });

  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const [confirmArchive, setConfirmArchive] = useState(false);

  const load = async () => {
    if (!plan) return;
    setLoading(true);
    const [p, s, a] = await Promise.all([
      supabase.from("payments").select("*").eq("plan_id", plan.id).order("created_at", { ascending: false }),
      supabase.from("plan_billing_schedules").select("*").eq("plan_id", plan.id).order("created_at", { ascending: false }),
      supabase.from("payment_plan_audit").select("*").eq("plan_id", plan.id).order("created_at", { ascending: false }),
    ]);
    setPayments((p.data as Payment[]) ?? []);
    setSchedules((s.data as Schedule[]) ?? []);
    setAudit((a.data as AuditRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (open && plan) {
      setEdit({
        customer_name: plan.customer_name,
        customer_email: plan.customer_email,
        package_name: plan.package_name,
        total_amount: String(plan.total_amount),
        min_payment: plan.min_payment != null ? String(plan.min_payment) : "",
        status: plan.status,
        notes: plan.notes ?? "",
      });
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan?.id]);

  const totals = useMemo(() => {
    const succeeded = payments.filter((p) => p.type === "payment" && p.status === "succeeded");
    const refunds = payments.filter((p) => p.type === "refund" || p.type === "void");
    const failed = payments.filter((p) => p.status !== "succeeded");
    return {
      collected: succeeded.reduce((s, p) => s + Number(p.amount), 0),
      refunded: refunds.reduce((s, p) => s + Number(p.amount), 0),
      failedCount: failed.length,
    };
  }, [payments]);

  if (!plan) return null;

  const reconciliationOff =
    Math.abs((totals.collected - totals.refunded) - Number(plan.amount_paid)) > 0.01;

  const saveEdits = async () => {
    const total = Number(edit.total_amount);
    if (!edit.customer_name.trim() || !edit.customer_email.trim() || !edit.package_name.trim() || !(total > 0)) {
      return toast.error("Fill in all required fields");
    }
    setBusy(true);
    const min = edit.min_payment ? Number(edit.min_payment) : null;
    const paid = Number(plan.amount_paid);
    const balance = Math.max(total - paid, 0);
    const status = edit.status === "active" && balance <= 0 ? "paid" : edit.status;

    const { error } = await supabase.from("payment_plans").update({
      customer_name: edit.customer_name.trim(),
      customer_email: edit.customer_email.trim(),
      package_name: edit.package_name.trim(),
      total_amount: total,
      min_payment: min,
      balance_remaining: balance,
      status,
      notes: edit.notes.trim() || null,
    }).eq("id", plan.id);
    if (error) { setBusy(false); return toast.error(error.message); }

    const { data: session } = await supabase.auth.getUser();
    await supabase.from("payment_plan_audit").insert({
      plan_id: plan.id,
      action: "plan_updated",
      changes: {
        before: {
          customer_name: plan.customer_name, package_name: plan.package_name,
          total_amount: plan.total_amount, min_payment: plan.min_payment, status: plan.status,
        },
        after: { ...edit, total_amount: total, min_payment: min, balance_remaining: balance, status },
      },
      actor_id: session?.user?.id ?? null,
      actor_email: session?.user?.email ?? null,
    });
    setBusy(false);
    toast.success("Plan updated");
    onChanged();
    load();
  };

  const toggleArchive = async () => {
    setBusy(true);
    const archiving = !plan.archived_at;
    const { data: session } = await supabase.auth.getUser();
    const { error } = await supabase.from("payment_plans").update({
      archived_at: archiving ? new Date().toISOString() : null,
      archived_by: archiving ? session?.user?.id ?? null : null,
      status: archiving ? "cancelled" : "active",
    }).eq("id", plan.id);
    if (error) { setBusy(false); return toast.error(error.message); }

    await supabase.from("payment_plan_audit").insert({
      plan_id: plan.id,
      action: archiving ? "plan_archived" : "plan_restored",
      changes: {},
      actor_id: session?.user?.id ?? null,
      actor_email: session?.user?.email ?? null,
    });
    setBusy(false);
    setConfirmArchive(false);
    toast.success(archiving ? "Plan archived — its payment link no longer works" : "Plan restored");
    onChanged();
    onOpenChange(false);
  };

  const submitRefund = async () => {
    if (!refundTarget) return;
    const amt = Number(refundAmount);
    if (!(amt > 0)) return toast.error("Enter a refund amount");
    if (refundReason.trim().length < 3) return toast.error("A refund reason is required");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-refund", {
      body: {
        scope: "plan_payment",
        paymentId: refundTarget.id,
        amount: amt,
        reason: refundReason.trim(),
        adminNote: refundNote.trim() || undefined,
      },
    });
    setBusy(false);
    const res = data as { error?: string; kind?: string; amount?: number } | null;
    if (error || res?.error) {
      return toast.error(res?.error || "Refund failed. Check Payment Alerts for details.");
    }
    toast.success(
      res?.kind === "void"
        ? `Payment voided (${fmt(res?.amount ?? amt)}) — it never settled, so nothing was charged.`
        : `Refunded ${fmt(res?.amount ?? amt)} to the customer's card.`,
    );
    setRefundTarget(null);
    setRefundReason("");
    setRefundNote("");
    onChanged();
    load();
  };

  const scheduleAction = async (scheduleId: string, action: "cancel" | "sync") => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("plan-autobill", {
      body: { action, scheduleId },
    });
    setBusy(false);
    const res = data as { error?: string; recorded?: number } | null;
    if (error || res?.error) return toast.error(res?.error || "Action failed");
    toast.success(
      action === "cancel"
        ? "Automatic payments cancelled"
        : `Synced — ${res?.recorded ?? 0} new payment(s) recorded`,
    );
    onChanged();
    load();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {plan.customer_name}
              <Badge variant={plan.status === "paid" ? "default" : "secondary"}>{plan.status}</Badge>
              {plan.archived_at && <Badge variant="outline">archived</Badge>}
            </DialogTitle>
            <DialogDescription>{plan.package_name} · {plan.customer_email}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Total", fmt(plan.total_amount)],
              ["Paid", fmt(plan.amount_paid)],
              ["Remaining", fmt(plan.balance_remaining)],
              ["Refunded", fmt(totals.refunded)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-lg font-semibold text-foreground">{value}</div>
              </div>
            ))}
          </div>

          {(reconciliationOff || totals.failedCount > 0) && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
              <div>
                {reconciliationOff && (
                  <p>Ledger mismatch: payments total {fmt(totals.collected - totals.refunded)} but the plan shows {fmt(plan.amount_paid)} paid.</p>
                )}
                {totals.failedCount > 0 && <p>{totals.failedCount} payment attempt(s) did not succeed.</p>}
              </div>
            </div>
          )}

          <Tabs defaultValue="log">
            <TabsList>
              <TabsTrigger value="log">Payment log</TabsTrigger>
              <TabsTrigger value="auto">Auto-billing</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* -------- payments -------- */}
            <TabsContent value="log" className="space-y-3">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading…</div>
              ) : payments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No payments recorded yet.</div>
              ) : payments.map((p) => {
                const isRefund = p.type === "refund" || p.type === "void";
                const refundable = +(Number(p.amount) - Number(p.refunded_amount ?? 0)).toFixed(2);
                return (
                  <div key={p.id} className="rounded-lg border border-border p-3 flex flex-wrap items-center gap-3 justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold ${isRefund ? "text-destructive" : "text-foreground"}`}>
                          {isRefund ? "−" : "+"}{fmt(p.amount)}
                        </span>
                        <Badge variant="outline" className="capitalize">{p.type}</Badge>
                        {p.status !== "succeeded" && <Badge variant="destructive">{p.status}</Badge>}
                        {Number(p.refunded_amount) > 0 && !isRefund && (
                          <Badge variant="secondary">{fmt(p.refunded_amount)} refunded</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {dt(p.created_at)} · txn {p.paypal_capture_id}
                        {p.card_last4 ? ` · ${p.card_type ?? "card"} ••${p.card_last4}` : ""}
                      </div>
                      {p.reason && <div className="text-xs text-muted-foreground mt-1">Reason: {p.reason}</div>}
                      {p.admin_note && <div className="text-xs text-muted-foreground">Note: {p.admin_note}</div>}
                    </div>
                    {!isRefund && p.status === "succeeded" && refundable > 0 && (
                      <Button
                        size="sm" variant="outline" className="gap-1.5"
                        onClick={() => { setRefundTarget(p); setRefundAmount(refundable.toFixed(2)); }}
                      >
                        <Undo2 className="h-3.5 w-3.5" /> Refund
                      </Button>
                    )}
                  </div>
                );
              })}
            </TabsContent>

            {/* -------- auto-billing -------- */}
            <TabsContent value="auto" className="space-y-3">
              {schedules.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No automatic payments set up. The customer can turn on recurring instalments from their payment link.
                </p>
              ) : schedules.map((s) => (
                <div key={s.id} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{fmt(s.amount)} {s.cadence}</span>
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.next_run_date ? `Next charge ${s.next_run_date}` : "No further charges scheduled"}
                    {s.last_run_at ? ` · last synced ${dt(s.last_run_at)}` : ""}
                  </div>
                  {s.last_error && <p className="text-xs text-destructive">{s.last_error}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={busy}
                      onClick={() => scheduleAction(s.id, "sync")}>
                      <RefreshCw className="h-3.5 w-3.5" /> Sync charges
                    </Button>
                    {s.status === "active" && (
                      <Button size="sm" variant="destructive" className="gap-1.5" disabled={busy}
                        onClick={() => scheduleAction(s.id, "cancel")}>
                        <Ban className="h-3.5 w-3.5" /> Cancel auto-pay
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* -------- edit -------- */}
            <TabsContent value="edit" className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Customer name</Label>
                  <Input value={edit.customer_name} onChange={(e) => setEdit({ ...edit, customer_name: e.target.value })} />
                </div>
                <div>
                  <Label>Customer email</Label>
                  <Input value={edit.customer_email} onChange={(e) => setEdit({ ...edit, customer_email: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Package / item</Label>
                  <Input value={edit.package_name} onChange={(e) => setEdit({ ...edit, package_name: e.target.value })} />
                </div>
                <div>
                  <Label>Total amount (USD)</Label>
                  <Input type="number" step="0.01" value={edit.total_amount}
                    onChange={(e) => setEdit({ ...edit, total_amount: e.target.value })} />
                </div>
                <div>
                  <Label>Minimum payment</Label>
                  <Input type="number" step="0.01" value={edit.min_payment}
                    onChange={(e) => setEdit({ ...edit, min_payment: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Internal notes</Label>
                  <Textarea rows={3} value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Changing the total recalculates the remaining balance from {fmt(plan.amount_paid)} already paid.
              </p>
              <Separator />
              <div className="flex flex-wrap gap-2 justify-between">
                <Button onClick={saveEdits} disabled={busy} className="gap-2">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
                </Button>
                <Button variant={plan.archived_at ? "outline" : "destructive"} className="gap-2"
                  disabled={busy} onClick={() => setConfirmArchive(true)}>
                  {plan.archived_at ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  {plan.archived_at ? "Restore plan" : "Delete plan"}
                </Button>
              </div>
            </TabsContent>

            {/* -------- history -------- */}
            <TabsContent value="history" className="space-y-2">
              {audit.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No changes recorded yet.</p>
              ) : audit.map((a) => (
                <div key={a.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-sm font-medium capitalize">
                    <History className="h-3.5 w-3.5 text-muted-foreground" />
                    {a.action.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dt(a.created_at)}{a.actor_email ? ` · ${a.actor_email}` : ""}
                  </div>
                  {a.changes && Object.keys(a.changes).length > 0 && (
                    <pre className="mt-2 text-[11px] bg-muted/50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(a.changes, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* refund dialog */}
      <Dialog open={!!refundTarget} onOpenChange={(v) => !v && setRefundTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund payment</DialogTitle>
            <DialogDescription>
              Money is returned to the customer's card through Authorize.net. Unsettled payments are
              voided instead of refunded.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Refund amount (USD)</Label>
              <Input type="number" step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
            </div>
            <div>
              <Label>Reason (required)</Label>
              <Input value={refundReason} onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Customer cancelled retreat booking" />
            </div>
            <div>
              <Label>Internal note (optional)</Label>
              <Textarea rows={2} value={refundNote} onChange={(e) => setRefundNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundTarget(null)}>Cancel</Button>
            <Button onClick={submitRefund} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Issue refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* archive confirm */}
      <AlertDialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {plan.archived_at ? "Restore this payment plan?" : "Delete this payment plan?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {plan.archived_at
                ? "The plan becomes active again and its payment link starts working."
                : `This archives ${plan.customer_name}'s plan and disables its payment link. Payment history is kept and the plan can be restored later. No money is refunded.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={toggleArchive}>
              {plan.archived_at ? "Restore plan" : "Yes, delete plan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
