import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Truck, Save, Mail, X, Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WooLegacyOrders from "@/components/admin/WooLegacyOrders";


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

const CARRIER_URLS: Record<string, (tn: string) => string> = {
  usps: (tn) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tn}`,
  ups: (tn) => `https://www.ups.com/track?tracknum=${tn}`,
  fedex: (tn) => `https://www.fedex.com/fedextrack/?trknbr=${tn}`,
  dhl: (tn) => `https://www.dhl.com/en/express/tracking.html?AWB=${tn}`,
};

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
  const [tab, setTab] = useState<"lovable" | "woo">("lovable");
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
    cancellation_reason: "",
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

  // Close drawer/edit on Escape
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editing) setEditing(false);
      else setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, editing]);

  // Intercept browser Back so it closes the drawer (and edit modal) first
  useEffect(() => {
    if (!selectedId) return;
    window.history.pushState({ adminDrawer: true }, "");
    const onPop = () => {
      if (editing) setEditing(false);
      setSelectedId(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
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
      cancellation_reason: "",
    });
  };

  const saveEdit = async () => {
    if (!selectedId) return;
    const prev = orders.find(o => o.id === selectedId);
    const newStatus = editData.fulfillment_status;
    const prevStatus = prev?.fulfillment_status || "unfulfilled";
    const becameCancelled = newStatus === "cancelled" && prevStatus !== "cancelled";
    const reason = (editData.cancellation_reason || "").trim();
    if (becameCancelled && !reason) {
      toast({
        title: "Reason required",
        description: "Please add a short reason before cancelling this order.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const updatePayload: any = {
      payment_status: editData.payment_status,
      fulfillment_status: editData.fulfillment_status,
      status: editData.fulfillment_status,
      tracking_number: editData.tracking_number || null,
      tracking_carrier: editData.tracking_carrier || null,
    };
    if (becameCancelled) {
      const stamp = new Date().toISOString().slice(0, 10);
      const existing = (prev?.admin_notes || "").trim();
      updatePayload.admin_notes = (existing ? existing + "\n\n" : "") +
        `[${stamp}] Cancelled: ${reason}`;
    }
    const { error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", selectedId);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: "Order updated successfully." });
      // Status-change email triggers (skipping "unfulfilled")
      const becameShipped =
        newStatus === "shipped" &&
        (prevStatus !== "shipped" ||
          (editData.tracking_number && editData.tracking_number !== (prev?.tracking_number || "")));
      const becameDelivered = newStatus === "delivered" && prevStatus !== "delivered";

      const triggerEmail = async (
        emailType: "order_shipped" | "order_delivered" | "order_cancelled",
        extra: Record<string, unknown> = {},
        labels: { ok: string; fail: string },
      ) => {
        const { data, error: mailErr } = await supabase.functions.invoke("send-order-emails", {
          body: { orderId: selectedId, emailType, force: true, ...extra },
        });
        if (mailErr || (data as any)?.error) {
          toast({
            title: labels.fail,
            description: (mailErr as any)?.message || (data as any)?.error || "Could not send email.",
            variant: "destructive",
          });
        } else if (!(data as any)?.skipped) {
          toast({ title: labels.ok, description: "Customer has been notified by email." });
        }
      };

      if (becameShipped) {
        await triggerEmail("order_shipped", {}, { ok: "Shipping email sent", fail: "Shipping email failed" });
      } else if (becameDelivered) {
        await triggerEmail("order_delivered", {}, { ok: "Delivery email sent", fail: "Delivery email failed" });
      } else if (becameCancelled) {
        await triggerEmail("order_cancelled", { cancellationReason: reason }, { ok: "Cancellation email sent", fail: "Cancellation email failed" });
      }

      // Fire matching SMS (best-effort, never block)
      try {
        if (becameShipped) {
          await supabase.functions.invoke("send-sms", { body: { orderId: selectedId, smsType: "order_shipped", force: true } });
        } else if (becameCancelled) {
          await supabase.functions.invoke("send-sms", { body: { orderId: selectedId, smsType: "order_cancelled", force: true } });
        }
      } catch (e) {
        console.error("send-sms invoke failed:", e);
      }
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
      body: { orderId, emailType: "order_placed", force: true },
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
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setTab("lovable")}
            className={`px-3 h-8 text-xs font-semibold rounded-md transition ${tab === "lovable" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >Lovable Orders</button>
          <button
            onClick={() => setTab("woo")}
            className={`px-3 h-8 text-xs font-semibold rounded-md transition ${tab === "woo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >WooCommerce (legacy)</button>
        </div>
      </div>

      {tab === "woo" ? (
        <WooLegacyOrders />
      ) : (
      <>
      <div className="flex items-center justify-end mb-4 gap-4 flex-wrap">
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
                  <div
                    className="flex items-center gap-1.5 text-xs text-blue-600 mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    {order.tracking_carrier && CARRIER_URLS[order.tracking_carrier] ? (
                      <a
                        href={CARRIER_URLS[order.tracking_carrier](order.tracking_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 underline hover:no-underline"
                      >
                        {order.tracking_number} ({order.tracking_carrier.toUpperCase()})
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span>{order.tracking_number} {order.tracking_carrier && `(${order.tracking_carrier.toUpperCase()})`}</span>
                    )}
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
      </>
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col min-h-full text-[15px] leading-[1.5]">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-5 sm:px-6 py-5 flex items-start justify-between gap-3 z-10">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-foreground">{order.order_number || "—"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{formatDateTime(order.created_at)}</p>
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
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

      <div className="flex-1 px-5 sm:px-6 py-6 space-y-7">
        {/* Shipping Address */}
        <section>
          <h3 className="uppercase tracking-widest text-[11px] font-bold text-muted-foreground mb-3">Shipping Address</h3>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-foreground whitespace-pre-line font-medium">{formatAddress(order)}</p>
          </div>
        </section>

        {/* Products */}
        <section>
          <h3 className="uppercase tracking-widest text-[11px] font-bold text-muted-foreground mb-3">Products</h3>
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            {items.map((i: any) => {
              const unit = Number(i.unit_price ?? i.price_usd ?? 0);
              const line = unit * (i.quantity || 0);
              return (
                <div key={i.id} className="flex items-start justify-between gap-4 py-1">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{i.product_name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Qty {i.quantity} · ${unit.toFixed(2)} each</p>
                  </div>
                  <p className="font-semibold text-foreground tabular-nums shrink-0">${line.toFixed(2)}</p>
                </div>
              );
            })}

            <div className="space-y-2 pt-3 border-t border-border/60">
              <div className="flex justify-between text-[15px]">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground tabular-nums">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-border/60">
                <span className="text-foreground">Total</span>
                <span className="text-foreground tabular-nums">${total.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">USD</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* Customer */}
        <section>
          <h3 className="uppercase tracking-widest text-[11px] font-bold text-muted-foreground mb-3">Customer</h3>
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
            <div>
              <p className="text-muted-foreground text-sm">Name</p>
              <p className="font-medium text-foreground">{order.customer_name || "—"}</p>
            </div>
            {order.email && (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-medium text-foreground truncate">{order.email}</p>
                </div>
                <button
                  onClick={() => handleCopy(order.email, "email")}
                  className="shrink-0 w-9 h-9 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label="Copy email"
                  title="Copy email"
                >
                  {copiedField === "email" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
            {order.phone && (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-muted-foreground text-sm">Phone</p>
                  <p className="font-medium text-foreground truncate">{order.phone}</p>
                </div>
                <button
                  onClick={() => handleCopy(order.phone, "phone")}
                  className="shrink-0 w-9 h-9 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label="Copy phone"
                  title="Copy phone"
                >
                  {copiedField === "phone" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Payment & Fulfillment */}
        <section>
          <h3 className="uppercase tracking-widest text-[11px] font-bold text-muted-foreground mb-3">Payment &amp; Fulfillment</h3>
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Payment status</span>
              <span className="font-semibold text-foreground">{cap(payment)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Fulfillment status</span>
              <span className="font-semibold text-foreground">{cap(fulfillment)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Tracking</span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-muted-foreground" />
                {order.tracking_number
                  ? <span className="font-medium">{order.tracking_number}{order.tracking_carrier ? ` (${order.tracking_carrier.toUpperCase()})` : ""}</span>
                  : <span className="text-muted-foreground italic">No tracking number yet</span>}
              </span>
            </div>
          </div>
        </section>

        {/* Note */}
        {(order.note || order.customer_notes) && (
          <section>
            <h3 className="uppercase tracking-widest text-[11px] font-bold text-muted-foreground mb-3">Order Note</h3>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-foreground whitespace-pre-line">{order.note || order.customer_notes}</p>
            </div>
          </section>
        )}

        {/* Edit form */}
        {editing && (
          <section className="rounded-xl border border-border bg-muted/50 p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground">Edit status &amp; tracking</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-muted-foreground">Payment status</span>
                <select
                  value={editData.payment_status}
                  onChange={(e) => setEditData((d: any) => ({ ...d, payment_status: e.target.value }))}
                  className="mt-1.5 w-full h-11 rounded-md border border-border bg-background text-[15px] px-3"
                >
                  {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground">Fulfillment status</span>
                <select
                  value={editData.fulfillment_status}
                  onChange={(e) => setEditData((d: any) => ({ ...d, fulfillment_status: e.target.value }))}
                  className="mt-1.5 w-full h-11 rounded-md border border-border bg-background text-[15px] px-3"
                >
                  {FULFILLMENT_OPTIONS.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                </select>
              </label>
              {editData.fulfillment_status === "cancelled" && (
                <label className="block">
                  <span className="text-sm text-muted-foreground">
                    Reason for cancellation <span className="text-destructive">*</span>
                  </span>
                  <textarea
                    value={editData.cancellation_reason}
                    onChange={(e) => setEditData((d: any) => ({ ...d, cancellation_reason: e.target.value }))}
                    placeholder="e.g. Customer requested cancellation, item out of stock, payment issue..."
                    rows={3}
                    className="mt-1.5 w-full rounded-md border border-border bg-background text-[15px] px-3 py-2 resize-y"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Sent to the customer in the cancellation email and saved to admin notes.
                  </span>
                </label>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm text-muted-foreground">Carrier</span>
                  <select
                    value={editData.tracking_carrier}
                    onChange={(e) => setEditData((d: any) => ({ ...d, tracking_carrier: e.target.value }))}
                    className="mt-1.5 w-full h-11 rounded-md border border-border bg-background text-[15px] px-3"
                  >
                    {CARRIER_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-muted-foreground">Tracking #</span>
                  <input
                    value={editData.tracking_number}
                    onChange={(e) => setEditData((d: any) => ({ ...d, tracking_number: e.target.value }))}
                    placeholder="Tracking number"
                    className="mt-1.5 w-full h-11 rounded-md border border-border bg-background text-[15px] px-3"
                  />
                </label>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex-1 h-12 rounded-md bg-primary text-primary-foreground text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save changes
                </button>
                <button
                  onClick={cancelEdit}
                  className="h-12 px-5 rounded-md border border-border text-[15px] font-medium text-muted-foreground hover:text-foreground"
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
        <div className="sticky bottom-0 bg-background border-t border-border px-5 sm:px-6 py-5 flex gap-3">
          <button
            onClick={startEdit}
            className="flex-1 h-12 rounded-md bg-primary text-primary-foreground text-[15px] font-semibold hover:bg-primary/90"
          >
            Edit status &amp; tracking
          </button>
          <button
            onClick={onResend}
            disabled={resending}
            className="flex-1 h-12 rounded-md border border-border text-[15px] font-semibold text-foreground hover:bg-muted inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Resend confirmation
          </button>
        </div>
      )}
    </div>
  );
}

