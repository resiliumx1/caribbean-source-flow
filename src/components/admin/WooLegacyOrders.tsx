import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["any", "pending", "processing", "on-hold", "completed", "cancelled", "refunded", "failed"];

const STATUS_COLORS: Record<string, string> = {
  completed: "#15803d",
  processing: "#1d4ed8",
  "on-hold": "#b45309",
  pending: "#b45309",
  cancelled: "#6b7280",
  refunded: "#6b7280",
  failed: "#b91c1c",
};

function cap(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide"
      style={{ background: `${color}1f`, color }}
    >
      {cap(label)}
    </span>
  );
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function WooLegacyOrders() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("any");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const today = new Date();
  const twoMonthsAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
  const [after, setAfter] = useState(toISODate(twoMonthsAgo));
  const [before, setBefore] = useState(toISODate(today));
  const [selected, setSelected] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("woo-orders-list", {
        body: {
          page,
          per_page: 50,
          status,
          search,
          after: new Date(after + "T00:00:00Z").toISOString(),
          before: new Date(before + "T23:59:59Z").toISOString(),
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setOrders((data as any)?.orders || []);
      setTotalPages((data as any)?.totalPages || 1);
      setTotalCount((data as any)?.totalCount || 0);
    } catch (e: any) {
      toast({ title: "Failed to load WooCommerce orders", description: e.message || String(e), variant: "destructive" });
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
          Read-only history pulled live from your WooCommerce store.{" "}
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
            {STATUSES.map(s => <option key={s} value={s}>{s === "any" ? "Any status" : cap(s)}</option>)}
          </select>
        </div>
        <form onSubmit={onSearch} className="flex-1 min-w-[220px]">
          <label className="block text-[11px] text-muted-foreground mb-1">Search (email, name, order #)</label>
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
        <p className="text-center text-muted-foreground py-16">No WooCommerce orders in this range.</p>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const s = (o.status || "").toLowerCase();
            const name = `${o.billing?.first_name || ""} ${o.billing?.last_name || ""}`.trim() || "—";
            return (
              <button
                key={o.id}
                onClick={() => setSelected(o)}
                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all min-h-[44px]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-base text-foreground tracking-tight">#{o.number}</span>
                      <Pill label={s} color={STATUS_COLORS[s] || "#6b7280"} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold uppercase tracking-wider">Woo</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{o.billing?.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(o.date_created).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-foreground">{o.currency} {Number(o.total).toFixed(2)}</p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">{o.payment_method_title || "—"}</p>
                  </div>
                </div>
                {o.line_items?.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {o.line_items.map((li: any) => `${li.name} ×${li.quantity}`).join(", ")}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-9 px-3 rounded-lg border border-border text-sm disabled:opacity-40"
          >Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-9 px-3 rounded-lg border border-border text-sm disabled:opacity-40"
          >Next</button>
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 animate-in fade-in" onClick={() => setSelected(null)} />
          <aside className="relative ml-auto w-full sm:max-w-lg h-full bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Order #{selected.number}</h2>
                  <p className="text-xs text-muted-foreground">{new Date(selected.date_created).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Pill label={(selected.status || "").toLowerCase()} color={STATUS_COLORS[(selected.status || "").toLowerCase()] || "#6b7280"} />
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide bg-muted text-foreground">
                  {selected.payment_method_title || "Unknown payment"}
                </span>
              </div>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Customer</h3>
                <p className="text-sm text-foreground">{selected.billing?.first_name} {selected.billing?.last_name}</p>
                <p className="text-sm text-foreground">{selected.billing?.email}</p>
                {selected.billing?.phone && <p className="text-sm text-foreground">{selected.billing.phone}</p>}
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Billing address</h3>
                <p className="text-sm whitespace-pre-line text-foreground">
                  {[selected.billing?.address_1, selected.billing?.address_2,
                    [selected.billing?.city, selected.billing?.state, selected.billing?.postcode].filter(Boolean).join(", "),
                    selected.billing?.country].filter(Boolean).join("\n") || "—"}
                </p>
              </section>

              {selected.shipping && (selected.shipping.address_1 || selected.shipping.city) && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Shipping address</h3>
                  <p className="text-sm whitespace-pre-line text-foreground">
                    {[selected.shipping?.address_1, selected.shipping?.address_2,
                      [selected.shipping?.city, selected.shipping?.state, selected.shipping?.postcode].filter(Boolean).join(", "),
                      selected.shipping?.country].filter(Boolean).join("\n")}
                  </p>
                </section>
              )}

              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Items</h3>
                <ul className="divide-y divide-border border border-border rounded-lg">
                  {selected.line_items?.map((li: any) => (
                    <li key={li.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{li.name}</p>
                        {li.sku && <p className="text-[11px] text-muted-foreground">SKU: {li.sku}</p>}
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-foreground">×{li.quantity}</p>
                        <p className="text-xs text-muted-foreground">{selected.currency} {Number(li.total).toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between mt-3 text-sm font-bold text-foreground">
                  <span>Total</span>
                  <span>{selected.currency} {Number(selected.total).toFixed(2)}</span>
                </div>
              </section>

              {selected.customer_note && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Customer note</h3>
                  <p className="text-sm whitespace-pre-line text-foreground">{selected.customer_note}</p>
                </section>
              )}

              {selected.transaction_id && (
                <p className="text-xs text-muted-foreground">Transaction ID: {selected.transaction_id}</p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}