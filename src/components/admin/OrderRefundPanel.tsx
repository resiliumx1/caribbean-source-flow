import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Undo2 } from "lucide-react";

type Refund = {
  id: string;
  amount_usd: number;
  reason: string;
  admin_note: string | null;
  kind: string;
  refund_transaction_id: string | null;
  created_at: string;
};

const fmt = (n: number) => `$${Number(n).toFixed(2)}`;

export default function OrderRefundPanel({
  order,
  onRefunded,
}: {
  order: any;
  onRefunded: () => void;
}) {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const total = Number(order.total_usd ?? 0);
  const refunded = Number(order.refunded_usd ?? 0);
  const refundable = +(total - refunded).toFixed(2);

  const load = async () => {
    const { data } = await supabase
      .from("order_refunds").select("*").eq("order_id", order.id)
      .order("created_at", { ascending: false });
    setRefunds((data as Refund[]) ?? []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [order.id]);

  const submit = async () => {
    const amt = Number(amount);
    if (!(amt > 0)) return toast.error("Enter a refund amount");
    if (reason.trim().length < 3) return toast.error("A refund reason is required");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-refund", {
      body: { scope: "order", orderId: order.id, amount: amt, reason: reason.trim(), adminNote: note.trim() || undefined },
    });
    setBusy(false);
    const res = data as { error?: string; kind?: string; amount?: number } | null;
    if (error || res?.error) return toast.error(res?.error || "Refund failed");
    toast.success(
      res?.kind === "void"
        ? `Payment voided (${fmt(res?.amount ?? amt)}) — the charge never settled.`
        : `Refunded ${fmt(res?.amount ?? amt)} to the customer.`,
    );
    setOpen(false);
    setReason(""); setNote("");
    onRefunded();
    load();
  };

  return (
    <section>
      <h3 className="uppercase tracking-widest text-[11px] font-bold text-muted-foreground mb-3">Refunds</h3>
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Refunded to date</span>
          <span className="font-semibold tabular-nums">{fmt(refunded)} of {fmt(total)}</span>
        </div>

        {refunds.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-background p-3 text-sm">
            <div className="flex justify-between font-medium">
              <span className="capitalize">{r.kind}</span>
              <span className="tabular-nums text-destructive">−{fmt(r.amount_usd)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              {r.refund_transaction_id ? ` · txn ${r.refund_transaction_id}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">Reason: {r.reason}</p>
            {r.admin_note && <p className="text-xs text-muted-foreground">Note: {r.admin_note}</p>}
          </div>
        ))}

        {!order.payment_transaction_id ? (
          <p className="text-xs text-muted-foreground">
            No card transaction on file — this order can't be refunded automatically.
          </p>
        ) : refundable <= 0 ? (
          <p className="text-xs text-muted-foreground">This order is fully refunded.</p>
        ) : (
          <Button
            variant="outline" size="sm" className="gap-1.5"
            onClick={() => { setAmount(refundable.toFixed(2)); setOpen(true); }}
          >
            <Undo2 className="h-3.5 w-3.5" /> Refund up to {fmt(refundable)}
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund order</DialogTitle>
            <DialogDescription>
              Funds return to the customer's card via Authorize.net. Charges that haven't settled yet are voided instead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Refund amount (USD)</Label>
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>Reason (required)</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Item out of stock" />
            </div>
            <div>
              <Label>Internal note (optional)</Label>
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />} Issue refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
