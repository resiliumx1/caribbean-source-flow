import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, Plus, Loader2, Search, Eye } from "lucide-react";
import PaymentPlanDetail, { type Plan } from "@/components/admin/PaymentPlanDetail";
import { ScrollTabs, FilterSheet, MobileTable, StackedCard } from "@/components/admin/responsive";

const PUBLIC_SITE_ORIGIN = "https://www.mountkailashslu.com";
const buildPayLink = (id: string) => `${PUBLIC_SITE_ORIGIN}/pay/${id}`;

function fmt(n: number | string) {
  return `$${Number(n).toFixed(2)}`;
}

export default function AdminPaymentPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"active" | "archived">("active");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Plan | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
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
    const rows = (data as Plan[]) || [];
    setPlans(rows);
    setSelected((prev) => (prev ? rows.find((r) => r.id === prev.id) ?? null : null));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plans
      .filter((p) => (view === "archived" ? !!p.archived_at : !p.archived_at))
      .filter((p) =>
        !q ||
        p.customer_name.toLowerCase().includes(q) ||
        p.customer_email.toLowerCase().includes(q) ||
        p.package_name.toLowerCase().includes(q),
      );
  }, [plans, view, query]);

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
    if (error) { setSaving(false); return toast.error(error.message); }

    const { data: session } = await supabase.auth.getUser();
    await supabase.from("payment_plan_audit").insert({
      plan_id: data.id,
      action: "plan_created",
      changes: { total_amount: total, min_payment: min, package_name: form.package_name.trim() },
      actor_id: session?.user?.id ?? null,
      actor_email: session?.user?.email ?? null,
    });
    setSaving(false);
    setOpen(false);
    setForm({ customer_name: "", customer_email: "", package_name: "", total_amount: "", min_payment: "" });
    await navigator.clipboard.writeText(buildPayLink(data.id)).catch(() => {});
    toast.success("Plan created — link copied to clipboard");
    load();
  };

  const copyLink = async (id: string) => {
    await navigator.clipboard.writeText(buildPayLink(id)).catch(() => {});
    toast.success("Payment link copied");
  };

  const openDetail = (p: Plan) => {
    setSelected(p);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Plans</h1>
          <p className="text-sm text-muted-foreground">
            Create instalment plans, share payment links, review logs and issue refunds.
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

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as "active" | "archived")}>
          <ScrollTabs activeKey={view}>
            <TabsList>
              <TabsTrigger value="active" className="min-h-[44px]">Active</TabsTrigger>
              <TabsTrigger value="archived" className="min-h-[44px]">Archived</TabsTrigger>
            </TabsList>
          </ScrollTabs>
        </Tabs>
        <FilterSheet triggerLabel="Search" activeCount={query ? 1 : 0} className="flex-1">
          <div className="relative flex-1 min-w-[220px] md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 min-h-[44px]" placeholder="Search customer, email or package"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </FilterSheet>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-muted-foreground">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-muted-foreground">
          {view === "archived" ? "No archived plans." : "No payment plans yet."}
        </div>
      ) : (
        <MobileTable
          items={visible}
          renderRow={(p) => (
            <StackedCard
              primary={
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-foreground truncate">{p.customer_name}</div>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                      style={{
                        background: p.status === "paid" ? "#15803d22" : p.status === "cancelled" ? "#6b728022" : "#b4530922",
                        color: p.status === "paid" ? "#15803d" : p.status === "cancelled" ? "#6b7280" : "#b45309",
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{p.customer_email}</div>
                  <div className="text-sm text-foreground">{p.package_name}</div>
                  <div className="text-sm font-semibold">Remaining: {fmt(p.balance_remaining)}</div>
                </>
              }
              details={
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span>{fmt(p.total_amount)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>{fmt(p.amount_paid)}</span></div>
                </>
              }
              actions={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 min-h-[44px]" onClick={() => openDetail(p)}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  {!p.archived_at && (
                    <Button size="sm" variant="outline" className="gap-1.5 min-h-[44px]" onClick={() => copyLink(p.id)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              }
            />
          )}
          table={
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
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/30 cursor-pointer"
                      onClick={() => openDetail(p)}>
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
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openDetail(p)}>
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                          {!p.archived_at && (
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copyLink(p.id)}>
                              <Copy className="h-3.5 w-3.5" /> Copy
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      )}

      <PaymentPlanDetail
        plan={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onChanged={load}
      />
    </div>
  );
}
