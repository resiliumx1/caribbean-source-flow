import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { inputCls } from "./shared";

type Order = {
  id: string;
  created_at: string;
  order_number: string | null;
  woo_order_id: number | null;
  email: string | null;
  pathway_key: string | null;
  amount: number;
  currency: string;
  referral_code: string | null;
  utm_source: string | null;
  status: string;
};

const money = (n: number, c: string) => `${c === "USD" ? "$" : `${c} `}${Number(n).toFixed(2)}`;

export default function WceOrders() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathway, setPathway] = useState("all");
  const [source, setSource] = useState("all");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_orders").select("*").order("created_at", { ascending: false });
      if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
      setRows((data ?? []) as Order[]);
      setLoading(false);
    })();
  }, []);

  const pathways = useMemo(
    () => Array.from(new Set(rows.map((r) => r.pathway_key).filter(Boolean))) as string[],
    [rows]
  );
  const sources = useMemo(
    () => Array.from(new Set(rows.map((r) => r.utm_source).filter(Boolean))) as string[],
    [rows]
  );

  const filtered = rows.filter(
    (r) =>
      (pathway === "all" || r.pathway_key === pathway) &&
      (source === "all" || r.utm_source === source)
  );

  const revenue = filtered.reduce((s, r) => s + Number(r.amount || 0), 0);

  const countBy = (key: "pathway_key" | "utm_source") =>
    filtered.reduce<Record<string, number>>((acc, r) => {
      const k = r[key] || "(none)";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

  const exportCsv = () => {
    const head = ["Order", "Date", "Email", "Pathway", "Amount", "Currency", "Referral", "UTM source", "Status"];
    const lines = filtered.map((r) => [
      r.order_number ?? "",
      new Date(r.created_at).toISOString(),
      r.email ?? "",
      r.pathway_key ?? "",
      Number(r.amount || 0).toFixed(2),
      r.currency,
      r.referral_code ?? "",
      r.utm_source ?? "",
      r.status,
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
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Total revenue</p>
          <p className="text-2xl font-bold text-foreground">${revenue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{filtered.length} orders</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">By pathway</p>
          {Object.entries(countBy("pathway_key")).map(([k, v]) => (
            <p key={k} className="text-sm text-foreground">{k}: <strong>{v}</strong></p>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">By UTM source</p>
          {Object.entries(countBy("utm_source")).map(([k, v]) => (
            <p key={k} className="text-sm text-foreground">{k}: <strong>{v}</strong></p>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Pathway</label>
          <select className={inputCls} value={pathway} onChange={(e) => setPathway(e.target.value)}>
            <option value="all">All pathways</option>
            {pathways.map((p) => <option key={p} value={p}>{p}</option>)}
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
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Pathway</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Referral</th>
              <th className="p-3 text-left">UTM source</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-mono font-bold text-foreground">{r.order_number ?? "—"}</td>
                <td className="p-3">{r.email ?? "—"}</td>
                <td className="p-3">{r.pathway_key ?? "—"}</td>
                <td className="p-3 font-medium">{money(r.amount, r.currency)}</td>
                <td className="p-3 font-mono">{r.referral_code ?? "—"}</td>
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
