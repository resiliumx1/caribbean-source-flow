import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Truck, Save, Mail, X, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const PAYMENT_OPTIONS = ["unpaid", "paid", "refunded"];
const FULFILLMENT_OPTIONS = ["unfulfilled", "shipped", "delivered", "cancelled"];
const CARRIER_OPTIONS = [
  { value: "", label: "No carrier" },
  { value: "usps", label: "USPS" },
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "dhl", label: "DHL" },
  { value: "other", label: "Other" },
];

const PAYMENT_COLORS: Record<string, string> = {
  paid: "#15803d",
  unpaid: "#b45309",
  refunded: "#6b7280",
};

const FULFILLMENT_COLORS: Record<string, string> = {
  unfulfilled: "#b45309",
  shipped: "#1d4ed8",
  delivered: "#15803d",
  cancelled: "#6b7280",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hideTest, setHideTest] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    payment_status: "",
    fulfillment_status: "",
    tracking_number: "",
    tracking_carrier: "",
  });
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  // Auto-open an order if navigated here with state.openOrderId (e.g. from notifications)
  useEffect(() => {
    const pendingId = (location.state as any)?.openOrderId;
    if (pendingId && orders.some(o => o.id === pendingId)) {
      setSelectedId(pendingId);
      setEditing(false);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [orders, location.state]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (selectedId) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [selectedId]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) {
      setOrders(data);
      const ids = data.map(o => o.id);
      if (ids.length > 0) {
        const { data: items } = await supabase.from("order_items").select("*").in("order_id", ids);
        if (items) {
          const grouped: Record<string, any[]> = {};
          items.forEach(i => {
            if (!grouped[i.order_id]) grouped[i.order_id] = [];
            grouped[i.order_id].push(i);
          });
          setOrderItems(grouped);
        }
      }
    }
    setLoading(false);
  };

  const openOrder = (order: any) => {
    setSelectedId(order.id);
    setEditing(false);
  };

  const startEdit = (order: any) => {
    setEditing(true);
    setEditData({
      payment_status: order.payment_status || "unpaid",
      fulfillment_status: order.fulfillment_status || "unfulfilled",
      tracking_number: order.tracking_number || "",
      tracking_carrier: order.tracking_carrier || "",
    });
  };

  const saveEdit = async () => {
    if (!selectedId) return;
    setSaving(true);
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: editData.payment_status,
        fulfillment_status: editData.fulfillment_status,
        status: editData.fulfillment_status, // keep legacy column in sync
        tracking_number: editData.tracking_number || null,
        tracking_carrier: editData.tracking_carrier || null,
      })
      .eq("id", selectedId);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: "Order updated successfully." });
      setEditing(false);
      fetchOrders();
    }
  };

  const formatDateTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  };

  const resendConfirmation = async (orderId: string) => {
    setResending(true);
    const { data, error } = await supabase.functions.invoke("send-order-emails", {
      body: { orderId, emailType: "order_placed" },
    });
    setResending(false);
    if (error || (data as any)?.error) {
      toast({
        title: "Email failed",
        description: (error as any)?.message || (data as any)?.error || "Could not send email.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Email sent", description: "Confirmation email resent to the customer." });
    }
  };

  const filtered = orders.filter(o => {
    if (hideTest && o.is_test) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (o.order_number || "").toLowerCase().includes(q)
      || (o.email || "").toLowerCase().includes(q)
      || (o.customer_name || "").toLowerCase().includes(q)
      || (o.tracking_number || "").toLowerCase().includes(q);
  });

  const selected = selectedId ? orders.find(o => o.id === selectedId) : null;
  const selectedItems = selected ? (orderItems[selected.id] || []) : [];

  const formatAddress = (o: any) => {
    const parts = [o.address_line1, o.address_line2, [o.city, o.state_province, o.postal_code].filter(Boolean).join(", "), o.country].filter(Boolean);
    return parts.length ? parts.join("\n") : "No address on file";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideTest}
              onChange={(e) => setHideTest(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            Hide test orders
          </label>
          <div className="relative" style={{ width: 260 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, name, email, tracking..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const items = orderItems[order.id] || [];
            const payment = (order.payment_status || "unpaid").toLowerCase();
            const fulfillment = (order.fulfillment_status || order.status || "unfulfilled").toLowerCase();
            const itemCount = items.reduce((s, i: any) => s + (i.quantity || 0), 0);

            return (
              <button
                key={order.id}
                onClick={() => openOrder(order)}
                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all min-h-[44px]"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-lg text-foreground tracking-tight">{order.order_number || "—"}</span>
                      {order.is_test && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold uppercase tracking-wider">Test</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">{order.customer_name || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(order.created_at)}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-foreground">${Number(order.total_usd).toFixed(2)}</p>
                    <p className="text-[11px] text-muted-foreground">{order.currency_used}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <Pill label={payment} color={PAYMENT_COLORS[payment] || "#6b7280"} />
                  <Pill label={fulfillment} color={FULFILLMENT_COLORS[fulfillment] || "#6b7280"} />
                </div>

                {items.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {items.map((i: any) => `${i.product_name} ×${i.quantity}`).join(", ")}
                    <span className="ml-1 text-muted-foreground/70">· {itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                  </p>
                )}

                {order.tracking_number && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 mt-2">
                    <Truck className="w-3.5 h-3.5" />
                    {order.tracking_number} {order.tracking_carrier && `(${order.tracking_carrier.toUpperCase()})`}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in"
            onClick={() => setSelectedId(null)}
          />
          <aside className="relative ml-auto w-full sm:max-w-lg h-full bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <DrawerContent
              order={selected}
              items={selectedItems}
              formatDateTime={formatDateTime}
              formatAddress={formatAddress}
              editing={editing}
              editData={editData}
              setEditData={setEditData}
              startEdit={() => startEdit(selected)}
              cancelEdit={() => setEditing(false)}
              saveEdit={saveEdit}
              saving={saving}
              resending={resending}
              onResend={() => resendConfirmation(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

function DrawerContent({
  order, items, formatDateTime, formatAddress,
  editing, editData, setEditData, startEdit, cancelEdit, saveEdit, saving,
  resending, onResend, onClose,
}: any) {
  const payment = (order.payment_status || "unpaid").toLowerCase();
  const fulfillment = (order.fulfillment_status || order.status || "unfulfilled").toLowerCase();
  const subtotal = Number(order.subtotal_usd ?? 0);
  const shipping = Number(order.shipping_usd ?? 0);
  const total = Number(order.total_usd ?? 0);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-start justify-between gap-3 z-10">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-foreground">{order.order_number || "—"}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(order.created_at)}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Pill label={payment} color={PAYMENT_COLORS[payment] || "#6b7280"} />
            <Pill label={fulfillment} color={FULFILLMENT_COLORS[fulfillment] || "#6b7280"} />
            {order.is_test && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold uppercase tracking-wider">Test</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-11 h-11 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-5 space-y-6">
        {/* Products */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Products</h3>
          <div className="space-y-2">
            {items.map((i: any) => {
              const unit = Number(i.unit_price ?? i.price_usd ?? 0);
              const line = unit * (i.quantity || 0);
              return (
                <div key={i.id} className="flex items-start justify-between gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{i.product_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Qty {i.quantity} · ${unit.toFixed(2)} each</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground shrink-0">${line.toFixed(2)}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-1.5 pt-3 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">${total.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">USD</span></span>
            </div>
          </div>
        </section>

        {/* Customer */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Customer</h3>
          <p className="text-sm font-medium text-foreground">{order.customer_name || "—"}</p>
          <p className="text-sm text-muted-foreground">{order.email}</p>
          {order.phone && <p className="text-sm text-muted-foreground">{order.phone}</p>}
        </section>

        {/* Shipping Address */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Shipping address</h3>
          <p className="text-sm text-foreground whitespace-pre-line">{formatAddress(order)}</p>
        </section>

        {/* Fulfillment */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Fulfillment</h3>
          <div className="text-sm text-foreground space-y-1">
            <p><span className="text-muted-foreground">Payment:</span> <span className="font-medium">{cap(payment)}</span></p>
            <p><span className="text-muted-foreground">Status:</span> <span className="font-medium">{cap(fulfillment)}</span></p>
            <p className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-muted-foreground" />
              {order.tracking_number
                ? <span className="font-medium">{order.tracking_number}{order.tracking_carrier ? ` (${order.tracking_carrier.toUpperCase()})` : ""}</span>
                : <span className="text-muted-foreground italic">No tracking number yet</span>}
            </p>
          </div>
        </section>

        {/* Note */}
        {(order.note || order.customer_notes) && (
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Order note</h3>
            <p className="text-sm text-foreground whitespace-pre-line bg-muted/50 rounded-lg p-3">{order.note || order.customer_notes}</p>
          </section>
        )}

        {/* Edit form */}
        {editing && (
          <section className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Edit status &amp; tracking</h3>
            <div className="space-y-2">
              <label className="block">
                <span className="text-xs text-muted-foreground">Payment status</span>
                <select
                  value={editData.payment_status}
                  onChange={(e) => setEditData((d: any) => ({ ...d, payment_status: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md border border-border bg-background text-sm px-2"
                >
                  {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Fulfillment status</span>
                <select
                  value={editData.fulfillment_status}
                  onChange={(e) => setEditData((d: any) => ({ ...d, fulfillment_status: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md border border-border bg-background text-sm px-2"
                >
                  {FULFILLMENT_OPTIONS.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs text-muted-foreground">Carrier</span>
                  <select
                    value={editData.tracking_carrier}
                    onChange={(e) => setEditData((d: any) => ({ ...d, tracking_carrier: e.target.value }))}
                    className="mt-1 w-full h-10 rounded-md border border-border bg-background text-sm px-2"
                  >
                    {CARRIER_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-muted-foreground">Tracking #</span>
                  <input
                    value={editData.tracking_number}
                    onChange={(e) => setEditData((d: any) => ({ ...d, tracking_number: e.target.value }))}
                    placeholder="Tracking number"
                    className="mt-1 w-full h-10 rounded-md border border-border bg-background text-sm px-3"
                  />
                </label>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex-1 h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save changes
                </button>
                <button
                  onClick={cancelEdit}
                  className="h-11 px-4 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer actions */}
      {!editing && (
        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-2">
          <button
            onClick={startEdit}
            className="flex-1 h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
          >
            Edit status &amp; tracking
          </button>
          <button
            onClick={onResend}
            disabled={resending}
            className="flex-1 h-11 rounded-md border border-border text-sm font-semibold text-foreground hover:bg-muted inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Resend confirmation
          </button>
        </div>
      )}
    </div>
  );
}
