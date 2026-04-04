import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Truck, ExternalLink, Search, Loader2, ShoppingBag, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface CustomerPortalProps {
  open: boolean;
  onClose: () => void;
}

export function CustomerPortal({ open, onClose }: CustomerPortalProps) {
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
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not look up orders.", variant: "destructive" });
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (!open) return null;

  const S: Record<string, React.CSSProperties> = {
    overlay: { position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.5)", transition: "opacity 0.2s" },
    panel: {
      position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 9999, width: "min(420px, 100vw)",
      background: "#ffffff", boxShadow: "-8px 0 30px rgba(0,0,0,0.15)", overflowY: "auto" as const,
      animation: "portalSlideIn 300ms ease-out forwards",
      fontFamily: "'DM Sans', sans-serif",
    },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #eee" },
    section: { padding: "16px 20px" },
    input: {
      width: "100%", height: 44, borderRadius: 8, border: "1px solid #d4d0c8", padding: "0 14px",
      fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
    },
    btn: {
      width: "100%", height: 44, borderRadius: 8, border: "none", cursor: "pointer",
      background: "#1b4332", color: "#fff", fontSize: 14, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    },
    sectionTitle: { fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: "#333", marginBottom: 12 },
  };

  return (
    <>
      <div style={S.overlay} onClick={onClose} />
      <div style={S.panel}>
        <div style={S.header}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: "#1b4332" }}>
            {looked ? "Your Orders" : "Look Up Orders"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X className="w-5 h-5" style={{ color: "#888" }} />
          </button>
        </div>

        {!looked ? (
          <div style={S.section}>
            <form onSubmit={handleLookup}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>
                Enter the email you used at checkout
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={S.input}
                required
              />
              <button type="submit" style={{ ...S.btn, marginTop: 12 }} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find My Orders"}
              </button>
              <p style={{ fontSize: 12, color: "#999", fontStyle: "italic", marginTop: 12, lineHeight: 1.6 }}>
                We'll look up all orders associated with this email address.
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Orders */}
            <div style={S.section}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontSize: 13, color: "#888" }}>{email}</p>
                <button onClick={handleReset} style={{ fontSize: 12, color: "#1b4332", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Different email
                </button>
              </div>
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <ShoppingBag className="w-8 h-8 mx-auto mb-3" style={{ color: "#ccc" }} />
                  <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>No orders found for this email.</p>
                  <Link to="/shop" onClick={onClose} style={{ fontSize: 13, color: "#1b4332", fontWeight: 600, textDecoration: "none" }}>
                    Browse our shop →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {orders.map((order) => {
                    const status = STATUS_STYLES[order.status || "pending"] || STATUS_STYLES.pending;
                    const items = orderItems[order.id] || [];
                    return (
                      <div key={order.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 14, background: "#fafafa" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "#888" }}>{formatDate(order.created_at)}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: status.bg, color: status.color }}>
                            {status.label}
                          </span>
                        </div>
                        {order.order_number && (
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>#{order.order_number}</p>
                        )}
                        {items.length > 0 && (
                          <p style={{ fontSize: 12, color: "#666", marginBottom: 6, lineHeight: 1.5 }}>
                            {items.map((i: any) => `${i.product_name} ×${i.quantity}`).join(", ")}
                          </p>
                        )}
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1b4332" }}>
                          ${Number(order.total_usd).toFixed(2)} {order.currency_used}
                        </p>
                        {order.tracking_number && (
                          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            <Truck className="w-3.5 h-3.5" style={{ color: "#1d4ed8" }} />
                            {order.tracking_carrier && CARRIER_URLS[order.tracking_carrier] ? (
                              <a
                                href={CARRIER_URLS[order.tracking_carrier](order.tracking_number)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: 12, color: "#1d4ed8", textDecoration: "underline", display: "flex", alignItems: "center", gap: 3 }}
                              >
                                {order.tracking_number} <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span style={{ fontSize: 12, color: "#555" }}>{order.tracking_number}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Track Order Section */}
            <div style={{ ...S.section, borderTop: "1px solid #eee" }}>
              <h3 style={S.sectionTitle}>Track an Order</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  value={trackNumber}
                  onChange={(e) => setTrackNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  style={{ ...S.input, flex: 1 }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={trackCarrier}
                  onChange={(e) => setTrackCarrier(e.target.value)}
                  style={{ ...S.input, flex: 1, cursor: "pointer" }}
                >
                  <option value="usps">USPS</option>
                  <option value="ups">UPS</option>
                  <option value="fedex">FedEx</option>
                  <option value="dhl">DHL</option>
                  <option value="other">Other</option>
                </select>
                <button onClick={handleTrack} style={{ ...S.btn, width: "auto", padding: "0 20px" }}>
                  <Search className="w-4 h-4" /> Track
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes portalSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
