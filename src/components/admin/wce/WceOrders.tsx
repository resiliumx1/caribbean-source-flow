/** WCE event revenue — a filtered view of the real store orders whose line items
 *  include a product linked to a WCE pathway. No parallel order table. */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";
import { StatCard, StatusPill, EmptyState, SectionHeading } from "./ui";

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

  if (loading)
    return <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--wa-gold)" }} />;

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Event Orders"
        sub="Store orders containing a WCE pathway ticket. Full order details live in the main Orders area."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Event revenue" value={`$${revenue.toFixed(2)}`} accent="gold"
          hint={`${filtered.length} order${filtered.length === 1 ? "" : "s"}`} />
        <StatCard label="Tickets by tier" accent="sage"
          value={Object.values(countTiers()).reduce((a, b) => a + b, 0)}
          hint={Object.entries(countTiers()).map(([k, v]) => `${k}: ${v}`).join(" · ") || "No tiers sold yet"} />
        <StatCard label="Referred orders" accent="teal"
          value={filtered.filter((r) => r.referral_code || r.coupon_code).length}
          hint="Used a referral or discount code" />
        <StatCard label="Awaiting payment" accent="terracotta"
          value={filtered.filter((r) => (r.payment_status ?? "") !== "paid").length}
          hint="Not yet marked paid" />
      </div>

      <div className="wa-panel">
        <p className="wa-label" style={{ marginBottom: "0.5rem" }}>By UTM source</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {Object.entries(countSources()).map(([k, v]) => (
            <span key={k} className="wa-pill" data-tone="neutral">{k} · {v}</span>
          ))}
          {filtered.length === 0 && <span className="wa-muted" style={{ fontSize: "0.8rem" }}>No attribution data yet.</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="wa-label" style={{ display: "block", marginBottom: 4 }}>Tier</label>
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="all">All tiers</option>
            {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="wa-label" style={{ display: "block", marginBottom: 4 }}>UTM source</label>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">All sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="button" className="wa-btn wa-btn-primary" onClick={exportCsv} disabled={filtered.length === 0}
          style={filtered.length === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="wa-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Tier</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Code</th>
              <th>UTM source</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <EmptyState title="No event orders yet" line="Orders appear here as soon as a pathway ticket is purchased." />
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id}>
                <td data-label="Order" className="font-mono wa-strong">{r.order_number ?? "—"}</td>
                <td data-label="Customer">
                  <div className="wa-strong">{r.customer_name}</div>
                  <div className="text-xs wa-muted">{r.email}</div>
                </td>
                <td data-label="Tier">{r.tiers.join(", ") || "—"}</td>
                <td data-label="Total" className="wa-strong">${Number(r.total_usd || 0).toFixed(2)}</td>
                <td data-label="Payment"><StatusPill status={r.payment_status ?? "—"} /></td>
                <td data-label="Code" className="font-mono text-xs">{r.coupon_code ?? r.referral_code ?? "—"}</td>
                <td data-label="UTM source">{r.utm_source ?? "—"}</td>
                <td data-label="Date" className="wa-muted">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}