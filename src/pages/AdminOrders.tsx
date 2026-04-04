import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Truck, Package, CheckCircle, XCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];
const CARRIER_OPTIONS = [
  { value: "", label: "No carrier" },
  { value: "usps", label: "USPS" },
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "dhl", label: "DHL" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#b45309",
  processing: "#b45309",
  shipped: "#1d4ed8",
  delivered: "#15803d",
  cancelled: "#dc2626",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ status: "", tracking_number: "", tracking_carrier: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchOrders(); }, []);

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

  const startEdit = (order: any) => {
    setEditingId(order.id);
    setEditData({
      status: order.status || "pending",
      tracking_number: order.tracking_number || "",
      tracking_carrier: order.tracking_carrier || "",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase
      .from("orders")
      .update({
        status: editData.status,
        tracking_number: editData.tracking_number || null,
        tracking_carrier: editData.tracking_carrier || null,
      })
      .eq("id", editingId);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: "Order updated successfully." });
      setEditingId(null);
      fetchOrders();
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (o.order_number || "").toLowerCase().includes(q)
      || (o.email || "").toLowerCase().includes(q)
      || (o.tracking_number || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <div className="relative" style={{ width: 260 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, email, tracking..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
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
            const isEditing = editingId === order.id;
            const statusColor = STATUS_COLORS[order.status || "pending"] || "#888";

            return (
              <div key={order.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-foreground">{order.order_number || "—"}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${statusColor}18`, color: statusColor }}>
                        {order.status || "pending"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)} · {order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">${Number(order.total_usd).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.currency_used}</p>
                  </div>
                </div>

                {items.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {items.map((i: any) => `${i.product_name} ×${i.quantity}`).join(", ")}
                  </p>
                )}

                {order.tracking_number && !isEditing && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-2">
                    <Truck className="w-3.5 h-3.5" />
                    {order.tracking_number} {order.tracking_carrier && `(${order.tracking_carrier.toUpperCase()})`}
                  </div>
                )}

                {isEditing ? (
                  <div className="mt-3 space-y-2 bg-muted/50 rounded-lg p-3">
                    <div className="flex gap-2">
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData(d => ({ ...d, status: e.target.value }))}
                        className="h-8 rounded-md border border-border bg-background text-xs px-2 flex-1"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <select
                        value={editData.tracking_carrier}
                        onChange={(e) => setEditData(d => ({ ...d, tracking_carrier: e.target.value }))}
                        className="h-8 rounded-md border border-border bg-background text-xs px-2"
                      >
                        {CARRIER_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={editData.tracking_number}
                        onChange={(e) => setEditData(d => ({ ...d, tracking_number: e.target.value }))}
                        placeholder="Tracking number"
                        className="h-8 rounded-md border border-border bg-background text-xs px-3 flex-1"
                      />
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5"
                      >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(order)}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Edit status & tracking
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
