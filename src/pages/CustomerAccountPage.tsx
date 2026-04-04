import { useState } from "react";
import { Link } from "react-router-dom";
import { Truck, ExternalLink, Search, Loader2, Leaf, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StoreFooter } from "@/components/store/StoreFooter";
import { SEOHead } from "@/components/SEOHead";

const CARRIER_URLS: Record<string, (tn: string) => string> = {
  usps: (tn) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tn}`,
  ups: (tn) => `https://www.ups.com/track?tracknum=${tn}`,
  fedex: (tn) => `https://www.fedex.com/fedextrack/?trknbr=${tn}`,
  dhl: (tn) => `https://www.dhl.com/en/express/tracking.html?AWB=${tn}`,
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(234,179,8,0.15)", color: "#b45309", label: "Processing" },
  processing: { bg: "rgba(234,179,8,0.15)", color: "#b45309", label: "Processing" },
  shipped: { bg: "rgba(59,130,246,0.15)", color: "#1d4ed8", label: "Shipped" },
  delivered: { bg: "rgba(34,197,94,0.15)", color: "#15803d", label: "Delivered" },
  cancelled: { bg: "rgba(239,68,68,0.15)", color: "#dc2626", label: "Cancelled" },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function CustomerAccountPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [looked, setLooked] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [trackNumber, setTrackNumber] = useState("");
  const [trackCarrier, setTrackCarrier] = useState("usps");
  const { toast } = useToast();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("guest-orders", {
        body: { email: email.trim() },
      });
      if (error) throw error;
      setOrders(data.orders || []);
      setOrderItems(data.orderItems || {});
      setLooked(true);
    } catch {
      try {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("email", email.trim().toLowerCase())
          .order("created_at", { ascending: false });
        setOrders(ordersData || []);
        if (ordersData && ordersData.length > 0) {
          const orderIds = ordersData.map((o: any) => o.id);
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .in("order_id", orderIds);
          const grouped: Record<string, any[]> = {};
          (itemsData || []).forEach((item: any) => {
            if (!grouped[item.order_id]) grouped[item.order_id] = [];
            grouped[item.order_id].push(item);
          });
          setOrderItems(grouped);
        }
        setLooked(true);
      } catch (fallbackErr: any) {
        toast({ title: "Error", description: fallbackErr.message || "Could not look up orders.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setLooked(false);
    setOrders([]);
    setOrderItems({});
  };

  const handleTrack = () => {
    if (!trackNumber.trim()) return;
    const urlFn = CARRIER_URLS[trackCarrier];
    if (urlFn) {
      window.open(urlFn(trackNumber.trim()), "_blank");
    } else {
      toast({ title: "Tracking", description: `Tracking number: ${trackNumber}` });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 48, borderRadius: 10, border: "1px solid #d4d0c8", padding: "0 14px",
    fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#ffffff",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%", height: 48, borderRadius: 10, border: "none", cursor: "pointer",
    background: "#1b4332", color: "#fff", fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--site-bg-primary)" }}>
      <SEOHead title="Your Account | Mount Kailash" description="Look up your orders and track shipments." path="/account" />

      <main className="container mx-auto px-4 py-12" style={{ maxWidth: 600, paddingTop: 100 }}>
        {/* Back link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mb-8 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--site-text-muted)", textDecoration: "none" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        {/* Page title */}
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 32, color: "var(--site-text-primary)", marginBottom: 8 }}>
          Your Account
        </h1>
        <p style={{ fontSize: 14, color: "var(--site-text-muted)", marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>
          Look up your orders and track shipments
        </p>

        {!looked ? (
          /* Email lookup card */
          <div style={{ background: "#fafaf8", borderRadius: 16, padding: 32, border: "1px solid #f0ede8" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Leaf className="w-12 h-12 mx-auto mb-3" style={{ color: "#3D715D", opacity: 0.8 }} />
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                Enter the email you used at checkout to view your orders and tracking info.
              </p>
            </div>
            <form onSubmit={handleLookup} className="space-y-3">
              <label style={{ fontSize: 13, fontWeight: 500, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#1b4332"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(27,67,50,0.1)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#d4d0c8"; e.currentTarget.style.boxShadow = "none"; }}
                required
              />
              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find My Orders"}
              </button>
              <p style={{ fontSize: 12, color: "#999", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
                We'll look up all orders associated with this email.
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Email + different email link */}
            <div className="flex items-center justify-between mb-6">
              <div style={{ background: "rgba(27,67,50,0.06)", borderRadius: 10, padding: "10px 14px", flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#1b4332", fontFamily: "'Cormorant Garamond', serif" }}>Welcome back 🌿</p>
                <p style={{ fontSize: 12, color: "#666", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{email}</p>
              </div>
              <button onClick={handleReset} style={{ fontSize: 12, color: "#1b4332", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginLeft: 12, fontFamily: "'DM Sans', sans-serif" }}>
                Different email
              </button>
            </div>

            {/* Orders */}
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Leaf className="w-14 h-14 mx-auto mb-4" style={{ color: "#c5c0b8" }} />
                <p style={{ fontSize: 18, color: "#888", marginBottom: 4, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>No orders found</p>
                <p style={{ fontSize: 14, color: "#aaa", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>We couldn't find any orders for this email.</p>
                <Link
                  to="/shop"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    height: 44, padding: "0 24px", borderRadius: 10,
                    background: "#1b4332", color: "#fff", fontSize: 14, fontWeight: 600,
                    textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Browse our shop →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {orders.map((order) => {
                  const status = STATUS_STYLES[order.status || "pending"] || STATUS_STYLES.pending;
                  const items = orderItems[order.id] || [];
                  return (
                    <div key={order.id} style={{ border: "1px solid #f0ede8", borderRadius: 14, padding: 20, background: "#ffffff" }}>
                      <div className="flex justify-between items-center mb-2">
                        <span style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>{formatDate(order.created_at)}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: status.bg, color: status.color, fontFamily: "'DM Sans', sans-serif" }}>
                          {status.label}
                        </span>
                      </div>
                      {order.order_number && (
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>#{order.order_number}</p>
                      )}
                      {items.length > 0 && (
                        <p style={{ fontSize: 13, color: "#666", marginBottom: 6, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                          {items.map((i: any) => `${i.product_name} ×${i.quantity}`).join(", ")}
                        </p>
                      )}
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#1b4332", fontFamily: "'DM Sans', sans-serif" }}>
                        ${Number(order.total_usd).toFixed(2)} {order.currency_used}
                      </p>
                      {order.tracking_number && (
                        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                          <Truck className="w-4 h-4" style={{ color: "#1d4ed8" }} />
                          {order.tracking_carrier && CARRIER_URLS[order.tracking_carrier] ? (
                            <a
                              href={CARRIER_URLS[order.tracking_carrier](order.tracking_number)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 13, color: "#1d4ed8", textDecoration: "underline", display: "flex", alignItems: "center", gap: 3 }}
                            >
                              {order.tracking_number} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span style={{ fontSize: 13, color: "#555" }}>{order.tracking_number}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Track a Shipment */}
            <div style={{ borderTop: "1px solid #f0ede8", paddingTop: 28, marginTop: 12 }}>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 16, color: "#333", marginBottom: 14 }}>
                Track a Shipment
              </h3>
              <div className="space-y-2">
                <input
                  value={trackNumber}
                  onChange={(e) => setTrackNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  style={inputStyle}
                />
                <div className="flex gap-2">
                  <select
                    value={trackCarrier}
                    onChange={(e) => setTrackCarrier(e.target.value)}
                    style={{ ...inputStyle, flex: 1, cursor: "pointer" }}
                  >
                    <option value="usps">USPS</option>
                    <option value="ups">UPS</option>
                    <option value="fedex">FedEx</option>
                    <option value="dhl">DHL</option>
                    <option value="other">Other</option>
                  </select>
                  <button onClick={handleTrack} style={{ ...btnStyle, width: "auto", padding: "0 24px" }}>
                    <Search className="w-4 h-4" /> Track
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
