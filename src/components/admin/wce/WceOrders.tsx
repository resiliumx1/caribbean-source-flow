/** WCE event revenue — a filtered view of the real store orders whose line items
 *  include a product linked to a WCE pathway. No parallel order table. */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { inputCls } from "./shared";

type Row = {
  id: string;
  created_at: string;
  order_number: string | null;
  email: string;
  customer_name: string;
  total_usd: number;
  currency_used: string;
  payment_status: string | null;
  status: string | null;
  coupon_code: string | null;
  referral_code: string | null;
  utm_source: string | null;
  tiers: string[];
};

export default function WceOrders() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState("all");
  const [source, setSource] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        // 1. Which products are WCE pathway tiers?
        const { data: pathways, error: pErr } = await supabase
          .from("wce_pathways").select("product_id").not("product_id", "is", null);
        if (pErr) throw pErr;
        const productIds = (pathways ?? []).map((p) => p.product_id as string);
        if (productIds.length === 0) { setLoading(false); return; }

        // 2. Order line items for those products.
        const { data: lines, error: lErr } = await supabase
          .from("order_items").select("order_id, product_id, product_name").in("product_id", productIds);
        if (lErr) throw lErr;
        const orderIds = Array.from(new Set((lines ?? []).map((l) => l.order_id)));
        if (orderIds.length === 0) { setLoading(false); return; }

        // 3. The real orders themselves.
        const { data: orders, error: oErr } = await supabase
          .from("orders")
          .select("id, created_at, order_number, email, customer_name, total_usd, currency_used, payment_status, status, coupon_code, referral_code, utm_source")
          .in("id", orderIds)
          .order("created_at", { ascending: false });
        if (oErr) throw oErr;

        const tiersByOrder = new Map<string, string[]>();
        for (const l of lines ?? []) {
          const list = tiersByOrder.get(l.order_id) ?? [];
          if (!list.includes(l.product_name)) list.push(l.product_name);
          tiersByOrder.set(l.order_id, list);
        }
        setRows(((orders ?? []) as any[]).map((o) => ({ ...o, tiers: tiersByOrder.get(o.id) ?? [] })));
      } catch (e: any) {
        toast({ title: "Load failed", description: e?.message ?? "Unknown error", variant: "destructive" });
      }
      setLoading(false);
    })();
  }, []);

  const tiers = useMemo(() => Array.from(new Set(rows.flatMap((r) => r.tiers))), [rows]);
  const sources = useMemo(
    () => Array.from(new Set(rows.map((r) => r.utm_source).filter(Boolean))) as string[],
    [rows]
  );

  const filtered = rows.filter(
    (r) =>
      (tier === "all" || r.tiers.includes(tier)) &&
      (source === "all" || r.utm_source === source)
  );

  const revenue = filtered.reduce((s, r) => s + Number(r.total_usd || 0), 0);

  const countTiers = () =>
    filtered.reduce<Record<string, number>>((acc, r) => {
      for (const t of r.tiers.length ? r.tiers : ["(none)"]) acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});

  const countSources = () =>
    filtered.reduce<Record<string, number>>((acc, r) => {
      const k = r.utm_source || "(direct)";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

  const exportCsv = () => {
    const head = ["Order", "Date", "Customer", "Email", "Tiers", "Total USD", "Currency", "Discount code", "Referral", "UTM source", "Payment", "Status"];
    const lines = filtered.map((r) => [
      r.order_number ?? "",
      new Date(r.created_at).toISOString(),
      r.customer_name,
      r.email,
      r.tiers.join(" | "),
      Number(r.total_usd || 0).toFixed(2),
      r.currency_used,
      r.coupon_code ?? "",
      r.referral_code ?? "",
      r.utm_source ?? "",
      r.payment_status ?? "",
      r.status ?? "",
    ]);
    const csv = [head, ...lines]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `wce-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Event revenue only — store orders containing a WCE pathway ticket. Full order details live in Orders.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Event revenue</p>
          <p className="text-2xl font-bold text-foreground">${revenue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{filtered.length} orders</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">By tier</p>
          {Object.entries(countTiers()).map(([k, v]) => (
            <p key={k} className="text-sm text-foreground">{k}: <strong>{v}</strong></p>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">By UTM source</p>
          {Object.entries(countSources()).map(([k, v]) => (
            <p key={k} className="text-sm text-foreground">{k}: <strong>{v}</strong></p>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Tier</label>
          <select className={inputCls} value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="all">All tiers</option>
            {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">UTM source</label>
          <select className={inputCls} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">All sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Tier</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">UTM source</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No event orders yet.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-mono font-bold text-foreground">{r.order_number ?? "—"}</td>
                <td className="p-3">
                  <div className="text-foreground">{r.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </td>
                <td className="p-3">{r.tiers.join(", ") || "—"}</td>
                <td className="p-3 font-medium">${Number(r.total_usd || 0).toFixed(2)}</td>
                <td className="p-3 font-mono text-xs">{r.coupon_code ?? r.referral_code ?? "—"}</td>
                <td className="p-3">{r.utm_source ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}