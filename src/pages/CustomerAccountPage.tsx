import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck, ExternalLink, Search, Loader2, Leaf } from "lucide-react";
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

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = document.documentElement;
      setIsDark(el.classList.contains("dark") || el.getAttribute("data-theme") === "dark");
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

export default function CustomerAccountPage() {
  const isDark = useIsDark();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [looked, setLooked] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [trackNumber, setTrackNumber] = useState("");
  const [trackCarrier, setTrackCarrier] = useState("usps");
  const { toast } = useToast();

  const c = {
    pageBg: isDark ? "#0d1a14" : "#F4EFEA",
    cardBg: isDark ? "#1a2f25" : "#ffffff",
    textPrimary: isDark ? "#F4EFEA" : "#193325",
    textSecondary: isDark ? "#a8c8b8" : "#3D715D",
    textMuted: isDark ? "#7a8d84" : "#8a8d94",
    border: isDark ? "rgba(61,113,93,0.3)" : "#e8e5e0",
    inputBg: isDark ? "#162620" : "#ffffff",
    inputBorder: isDark ? "rgba(61,113,93,0.4)" : "#d4d0c8",
  };

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
    width: "100%", height: 48, borderRadius: 10, border: `1px solid ${c.inputBorder}`, padding: "0 14px",
    fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", background: c.inputBg, color: c.textPrimary,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%", height: 48, borderRadius: 10, border: "none", cursor: "pointer",
    background: "#1b4332", color: "#fff", fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  };

  return (
    <div style={{ minHeight: "100vh", background: c.pageBg, paddingTop: 90 }}>
      <SEOHead title="Your Account | Mount Kailash" description="Look up your orders and track shipments." path="/account" />

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Back link */}
        <Link
          to="/shop"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: c.textSecondary, textDecoration: "none", marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Back to Shop
        </Link>

        {/* Page heading */}
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 36, color: c.textPrimary, marginBottom: 8 }}>
          Your Account
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: c.textMuted, marginBottom: 40 }}>
          Look up your orders and track shipments
        </p>

        {!looked ? (
          /* Email lookup card */
          <div style={{ background: c.cardBg, borderRadius: 20, padding: 36, border: `1px solid ${c.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Leaf className="w-12 h-12 mx-auto mb-3" style={{ color: c.textSecondary, opacity: 0.8 }} />
              <p style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                Enter the email you used at checkout to view your orders and tracking info.
              </p>
            </div>
            <form onSubmit={handleLookup} className="space-y-3">
              <label style={{ fontSize: 13, fontWeight: 500, color: c.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#1b4332"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(27,67,50,0.1)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = c.inputBorder; e.currentTarget.style.boxShadow = "none"; }}
                required
              />
              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find My Orders"}
              </button>
              <p style={{ fontSize: 12, color: c.textMuted, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
                We'll look up all orders associated with this email.
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Email + different email link */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ background: isDark ? "rgba(61,113,93,0.15)" : "rgba(27,67,50,0.06)", borderRadius: 10, padding: "10px 14px", flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: c.textSecondary, fontFamily: "'Cormorant Garamond', serif" }}>Welcome back 🌿</p>
                <p style={{ fontSize: 12, color: c.textMuted, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{email}</p>
              </div>
              <button onClick={handleReset} style={{ fontSize: 12, color: c.textSecondary, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginLeft: 12, fontFamily: "'DM Sans', sans-serif" }}>
                Different email
              </button>
            </div>

            {/* Orders */}
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Leaf className="w-14 h-14 mx-auto mb-4" style={{ color: c.textMuted }} />
                <p style={{ fontSize: 18, color: c.textMuted, marginBottom: 4, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>No orders found</p>
                <p style={{ fontSize: 14, color: c.textMuted, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>We couldn't find any orders for this email.</p>
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
              <div className="space-y-3" style={{ marginBottom: 32 }}>
                {orders.map((order) => {
                  const status = STATUS_STYLES[order.status || "pending"] || STATUS_STYLES.pending;
                  const items = orderItems[order.id] || [];
                  return (
                    <div key={order.id} style={{ border: `1px solid ${c.border}`, borderRadius: 14, padding: 20, background: c.cardBg }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: c.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{formatDate(order.created_at)}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: status.bg, color: status.color, fontFamily: "'DM Sans', sans-serif" }}>
                          {status.label}
                        </span>
                      </div>
                      {order.order_number && (
                        <p style={{ fontSize: 14, fontWeight: 600, color: c.textPrimary, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>#{order.order_number}</p>
                      )}
                      {items.length > 0 && (
                        <p style={{ fontSize: 13, color: c.textMuted, marginBottom: 6, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                          {items.map((i: any) => `${i.product_name} ×${i.quantity}`).join(", ")}
                        </p>
                      )}
                      <p style={{ fontSize: 15, fontWeight: 600, color: c.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
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
                            <span style={{ fontSize: 13, color: c.textMuted }}>{order.tracking_number}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Track a Shipment */}
        <div style={{ marginTop: 32, background: c.cardBg, borderRadius: 20, padding: 36, border: `1px solid ${c.border}` }}>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 18, color: c.textPrimary, marginBottom: 16 }}>
            Track a Shipment
          </h3>
          <div className="space-y-2">
            <input
              value={trackNumber}
              onChange={(e) => setTrackNumber(e.target.value)}
              placeholder="Enter tracking number"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#1b4332"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(27,67,50,0.1)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = c.inputBorder; e.currentTarget.style.boxShadow = "none"; }}
            />
            <div style={{ display: "flex", gap: 8 }}>
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
      </main>

      <StoreFooter />
    </div>
  );
}
