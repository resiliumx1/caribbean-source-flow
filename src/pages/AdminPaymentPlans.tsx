import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, Plus, Loader2 } from "lucide-react";

const PUBLIC_SITE_ORIGIN = "https://www.mountkailashslu.com";
const buildPayLink = (id: string) => `${PUBLIC_SITE_ORIGIN}/pay/${id}`;

type Plan = {
  id: string;
  customer_name: string;
  customer_email: string;
  package_name: string;
  total_amount: number;
  amount_paid: number;
  balance_remaining: number;
  min_payment: number | null;
  status: string;
  created_at: string;
};

function fmt(n: number | string) {
  return `$${Number(n).toFixed(2)}`;
}

export default function AdminPaymentPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    package_name: "",
    total_amount: "",
    min_payment: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_plans")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPlans((data as Plan[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const total = Number(form.total_amount);
    if (!form.customer_name || !form.customer_email || !form.package_name || !(total > 0)) {
      toast.error("Fill in all required fields");
      return;
    }
    setSaving(true);
    const min = form.min_payment ? Number(form.min_payment) : null;
    const { data, error } = await supabase
      .from("payment_plans")
      .insert({
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        package_name: form.package_name.trim(),
        total_amount: total,
        balance_remaining: total,
        min_payment: min,
      })
      .select()
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    setOpen(false);
    setForm({ customer_name: "", customer_email: "", package_name: "", total_amount: "", min_payment: "" });
    const link = buildPayLink(data.id);
    await navigator.clipboard.writeText(link).catch(() => {});
    toast.success("Plan created — link copied to clipboard");
    load();
  };

  const copyLink = async (id: string) => {
    const link = buildPayLink(id);
    await navigator.clipboard.writeText(link).catch(() => {});
    toast.success("Payment link copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Plans</h1>
          <p className="text-sm text-muted-foreground">
            Create installment plans and share a payment link with the customer.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payment Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Customer name</Label>
                <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div>
                <Label>Customer email</Label>
                <Input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              </div>
              <div>
                <Label>Package / item</Label>
                <Input value={form.package_name} onChange={(e) => setForm({ ...form, package_name: e.target.value })} placeholder="e.g. 7-Day Wellness Immersion" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Total amount (USD)</Label>
                  <Input type="number" min="0" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} />
                </div>
                <div>
                  <Label>Min payment (optional)</Label>
                  <Input type="number" min="0" step="0.01" value={form.min_payment} onChange={(e) => setForm({ ...form, min_payment: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Package</th>
              <th className="px-4 py-3 font-semibold text-right">Total</th>
              <th className="px-4 py-3 font-semibold text-right">Paid</th>
              <th className="px-4 py-3 font-semibold text-right">Remaining</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Link</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : plans.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No payment plans yet.</td></tr>
            ) : plans.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{p.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{p.customer_email}</div>
                </td>
                <td className="px-4 py-3 text-foreground">{p.package_name}</td>
                <td className="px-4 py-3 text-right">{fmt(p.total_amount)}</td>
                <td className="px-4 py-3 text-right">{fmt(p.amount_paid)}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(p.balance_remaining)}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      background: p.status === "paid" ? "#15803d22" : p.status === "cancelled" ? "#6b728022" : "#b4530922",
                      color: p.status === "paid" ? "#15803d" : p.status === "cancelled" ? "#6b7280" : "#b45309",
                    }}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copyLink(p.id)}>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}