import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Package, Truck, CheckCircle, XCircle, ExternalLink, Search, LogOut, Loader2, ShoppingBag, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [retreatBookings, setRetreatBookings] = useState<any[]>([]);
  const [trackNumber, setTrackNumber] = useState("");
  const [trackCarrier, setTrackCarrier] = useState("usps");
  const { toast } = useToast();

  // Listen for auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch orders when logged in
  useEffect(() => {
    if (!user) return;
    fetchOrders();
    fetchRetreatBookings();
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) {
      setOrders(data);
      // Fetch items for each order
      const ids = data.map(o => o.id);
      if (ids.length > 0) {
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", ids);
        if (items) {
          const grouped: Record<string, any[]> = {};
          items.forEach(item => {
            if (!grouped[item.order_id]) grouped[item.order_id] = [];
            grouped[item.order_id].push(item);
          });
          setOrderItems(grouped);
        }
      }
    }
  };

  const fetchRetreatBookings = async () => {
    const { data } = await supabase
      .from("retreat_bookings")
      .select("*, retreat_types(*)")
      .eq("user_id", user!.id)
      .gte("end_date", new Date().toISOString().split("T")[0])
      .order("start_date", { ascending: true });
    if (data) setRetreatBookings(data);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSendingLink(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setSendingLink(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMagicLinkSent(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
    setOrderItems({});
    setRetreatBookings([]);
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

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

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
        {loading ? (
          <div style={{ ...S.section, display: "flex", justifyContent: "center", paddingTop: 80 }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#1b4332" }} />
          </div>
        ) : !user ? (
          <>
            {/* Not logged in */}
            <div style={S.header}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: "#1b4332" }}>Your Account</h2>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X className="w-5 h-5" style={{ color: "#888" }} /></button>
            </div>
            <div style={S.section}>
              {magicLinkSent ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(27,67,50,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <CheckCircle className="w-7 h-7" style={{ color: "#1b4332" }} />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#333", marginBottom: 8 }}>Check your email</p>
                  <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                    We've sent a login link to <strong>{email}</strong>. Click the link in the email to access your account.
                  </p>
                  <button onClick={() => setMagicLinkSent(false)} style={{ ...S.btn, background: "transparent", color: "#1b4332", border: "1px solid #d4d0c8", marginTop: 20 }}>
                    Try a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={S.input}
                    required
                  />
                  <button type="submit" style={{ ...S.btn, marginTop: 12 }} disabled={sendingLink}>
                    {sendingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Login Link"}
                  </button>
                  <p style={{ fontSize: 12, color: "#999", fontStyle: "italic", marginTop: 12, lineHeight: 1.6 }}>
                    Your account is created automatically when you make your first purchase or booking. We'll send a secure link to your email — no password needed.
                  </p>
                </form>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Logged in — Dashboard */}
            <div style={S.header}>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: "#1b4332" }}>
                  Welcome{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
                </h2>
                <p style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{user.email}</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={handleSignOut} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X className="w-5 h-5" style={{ color: "#888" }} /></button>
              </div>
            </div>

            {/* Orders Section */}
            <div style={S.section}>
              <h3 style={S.sectionTitle}>Your Orders</h3>
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <ShoppingBag className="w-8 h-8 mx-auto mb-3" style={{ color: "#ccc" }} />
                  <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>No orders yet.</p>
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

            {/* Retreat Bookings */}
            {retreatBookings.length > 0 && (
              <div style={{ ...S.section, borderTop: "1px solid #eee" }}>
                <h3 style={S.sectionTitle}>Upcoming Retreats</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {retreatBookings.map((b) => (
                    <div key={b.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 14, background: "#fafafa" }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1b4332", marginBottom: 4 }}>
                        {(b.retreat_types as any)?.name || "Retreat"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666" }}>
                        <MapPin className="w-3.5 h-3.5" />
                        {formatDate(b.start_date)} – {formatDate(b.end_date)}
                      </div>
                      <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                        {b.guest_count} guest{b.guest_count !== 1 ? "s" : ""} · ${Number(b.total_usd).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
