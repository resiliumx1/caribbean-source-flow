import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 50;

// raw woo statuses begin with "wc-"
const STATUSES = ["any", "wc-completed", "wc-processing", "wc-on-hold", "wc-pending", "wc-cancelled", "wc-refunded", "wc-failed"];

const STATUS_COLORS: Record<string, string> = {
  "wc-completed": "#15803d",
  "wc-processing": "#1d4ed8",
  "wc-on-hold": "#b45309",
  "wc-pending": "#b45309",
  "wc-cancelled": "#6b7280",
  "wc-refunded": "#6b7280",
  "wc-failed": "#b91c1c",
};

function cleanStatus(s: string) { return (s || "").replace(/^wc-/, ""); }
function cap(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function Pill({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "#6b7280";
  return (
    <span
      className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide"
      style={{ background: `${color}1f`, color }}
    >
      {cap(cleanStatus(status))}
    </span>
  );
}

function toISODate(d: Date) { return d.toISOString().slice(0, 10); }

type LegacyOrder = {
  order_id: number;
  order_date: string;
  status: string;
  order_total: string | number | null;
  currency: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  payment_method: string | null;
  items: string | null;
};

export default function WooLegacyOrders() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<LegacyOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("any");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const today = new Date();
  // archive spans 2022-2026, default to full range
  const [after, setAfter] = useState("2022-01-01");
  const [before, setBefore] = useState(toISODate(new Date(today.getTime() + 24 * 60 * 60 * 1000)));
  const [selected, setSelected] = useState<LegacyOrder | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("legacy_woocommerce_orders")
        .select("*", { count: "exact" })
        .gte("order_date", new Date(after + "T00:00:00Z").toISOString())
        .lte("order_date", new Date(before + "T23:59:59Z").toISOString())
        .order("order_date", { ascending: false });

      if (status !== "any") q = q.eq("status", status);
      if (search) {
        const s = search.replace(/[%,]/g, "");
        q = q.or(`email.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%,order_id::text.ilike.%${s}%,items.ilike.%${s}%`);
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count, error } = await q.range(from, to);
      if (error) throw error;
      setOrders((data as LegacyOrder[]) || []);
      setTotalCount(count || 0);
    } catch (e: any) {
      toast({ title: "Failed to load legacy orders", description: e.message || String(e), variant: "destructive" });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); /* eslint-disable-next-line */ }, [page, status, after, before, search]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="text-xs text-muted-foreground">
          Read-only archive of historical WooCommerce orders (Jul 2022 – May 2026).{" "}
          {totalCount > 0 && <span className="text-foreground font-semibold">{totalCount.toLocaleString()} order{totalCount !== 1 ? "s" : ""}</span>}
          {" "}in range.
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-end mb-4 p-3 rounded-lg border border-border bg-card">
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">From</label>
          <input type="date" value={after} onChange={(e) => { setAfter(e.target.value); setPage(1); }}
            className="h-9 px-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">To</label>
          <input type="date" value={before} onChange={(e) => { setBefore(e.target.value); setPage(1); }}
            className="h-9 px-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">Status</label>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-9 px-2 rounded-lg border border-border bg-background text-sm">
            {STATUSES.map(s => <option key={s} value={s}>{s === "any" ? "Any status" : cap(cleanStatus(s))}</option>)}
          </select>
        </div>
        <form onSubmit={onSearch} className="flex-1 min-w-[220px]">
          <label className="block text-[11px] text-muted-foreground mb-1">Search (email, name, order #, item)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Press enter to search"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No legacy orders in this range.</p>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const name = `${o.first_name || ""} ${o.last_name || ""}`.trim() || "—";
            return (
              <button
                key={o.order_id}
                onClick={() => setSelected(o)}
                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all min-h-[44px]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-base text-foreground tracking-tight">#{o.order_id}</span>
                      <Pill status={o.status} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold uppercase tracking-wider">Woo · Archive</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{o.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(o.order_date).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-foreground">{o.currency || ""} {Number(o.order_total || 0).toFixed(2)}</p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">{o.payment_method || "—"}</p>
                  </div>
                </div>
                {o.items && (
                  <p className="text-xs text-muted-foreground mt-2 truncate">{o.items.replace(/\s*\|\s*/g, ", ")}</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="h-9 px-3 rounded-lg border border-border text-sm disabled:opacity-40">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="h-9 px-3 rounded-lg border border-border text-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 animate-in fade-in" onClick={() => setSelected(null)} />
          <aside className="relative ml-auto w-full sm:max-w-lg h-full bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Order #{selected.order_id}</h2>
                  <p className="text-xs text-muted-foreground">{new Date(selected.order_date).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Pill status={selected.status} />
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide bg-muted text-foreground">
                  {selected.payment_method || "Unknown payment"}
                </span>
              </div>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Customer</h3>
                <p className="text-sm text-foreground">{selected.first_name} {selected.last_name}</p>
                <p className="text-sm text-foreground">{selected.email}</p>
                {selected.phone && <p className="text-sm text-foreground">{selected.phone}</p>}
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Billing address</h3>
                <p className="text-sm whitespace-pre-line text-foreground">
                  {[selected.address,
                    [selected.city, selected.state, selected.postcode].filter(Boolean).join(", "),
                    selected.country].filter(Boolean).join("\n") || "—"}
                </p>
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Items</h3>
                {selected.items ? (
                  <ul className="divide-y divide-border border border-border rounded-lg">
                    {selected.items.split("|").map((it, i) => (
                      <li key={i} className="p-3 text-sm text-foreground">{it.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
                <div className="flex justify-between mt-3 text-sm font-bold text-foreground">
                  <span>Total</span>
                  <span>{selected.currency || ""} {Number(selected.order_total || 0).toFixed(2)}</span>
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
