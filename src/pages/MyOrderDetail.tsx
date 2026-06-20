import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Package, CheckCircle2, Truck, Clock, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { StoreFooter } from "@/components/store/StoreFooter";
import { SEOHead } from "@/components/SEOHead";

const STAGES = [
  { key: "pending", label: "Order placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function MyOrderDetail() {
  const { orderNumber } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true, state: { from: `/account/orders/${orderNumber}` } });
    }
  }, [authLoading, user, navigate, orderNumber]);

  useEffect(() => {
    if (!user || !orderNumber) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!o) {
        setOrder(null);
        setLoading(false);
        return;
      }
      setOrder(o);
      const { data: it } = await supabase
        .from("order_items")
        .select("id, product_id, product_name, quantity, price_usd, price_xcd")
        .eq("order_id", o.id);
      if (cancelled) return;
      setItems(it || []);
      const pids = [...new Set((it || []).map((i: any) => i.product_id))];
      if (pids.length) {
        const { data: prods } = await supabase
          .from("products")
          .select("id, image_url")
          .in("id", pids);
        if (!cancelled) {
          const map: Record<string, string | null> = {};
          (prods || []).forEach((p: any) => { map[p.id] = p.image_url; });
          setProductImages(map);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, orderNumber]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <main className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Order not found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We couldn't find an order with that number on your account.
          </p>
          <Button asChild>
            <Link to="/account/orders">Back to My Orders</Link>
          </Button>
        </main>
        <StoreFooter />
      </div>
    );
  }

  const currency = order.currency_used || "USD";
  const formatAmount = (usd: number, xcd: number) =>
    currency === "XCD" ? `EC$${Number(xcd).toFixed(2)}` : `$${Number(usd).toFixed(2)}`;

  const status = (order.status || "pending").toLowerCase();
  const currentStageIndex = STAGES.findIndex((s) => s.key === status);
  const effectiveIndex = status === "cancelled" ? -1 : currentStageIndex;

  return (
    <div className="min-h-screen bg-background pt-20">
      <SEOHead title={`Order ${order.order_number} | Mount Kailash`} description="Order details" path={`/account/orders/${orderNumber}`} noindex />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Order Number</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground font-mono">
            {order.order_number}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Placed on {formatDate(order.created_at)}</p>
        </div>

        {/* Status timeline */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-lg text-foreground">Order Status</h2>
              <Badge variant="outline" className="capitalize">{status}</Badge>
            </div>
            {status === "cancelled" ? (
              <p className="text-sm text-destructive">This order was cancelled.</p>
            ) : (
              <div className="flex items-center justify-between">
                {STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const reached = idx <= effectiveIndex;
                  const current = idx === effectiveIndex;
                  return (
                    <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                      {idx > 0 && (
                        <div
                          className={`absolute top-5 right-1/2 w-full h-0.5 ${idx <= effectiveIndex ? "bg-primary" : "bg-border"}`}
                        />
                      )}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          reached
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border text-muted-foreground"
                        } ${current ? "ring-4 ring-primary/20" : ""}`}
                      >
                        {reached && idx < effectiveIndex ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <p className={`text-xs mt-2 text-center ${reached ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {stage.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
            {order.tracking_number && (
              <div className="mt-6 p-3 bg-muted/40 rounded-lg text-sm">
                <span className="text-muted-foreground">Tracking: </span>
                <span className="font-mono font-medium text-foreground">{order.tracking_number}</span>
                {order.tracking_carrier && <span className="text-muted-foreground"> ({order.tracking_carrier})</span>}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Items */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h2 className="font-serif font-semibold text-lg text-foreground mb-4">Items</h2>
              <div className="divide-y divide-border">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      {productImages[it.product_id] ? (
                        <img
                          src={productImages[it.product_id]!}
                          alt={it.product_name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{it.product_name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {it.quantity}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-foreground">
                        {formatAmount(it.price_usd * it.quantity, it.price_xcd * it.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAmount(it.price_usd, it.price_xcd)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatAmount(order.subtotal_usd, order.subtotal_xcd)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{formatAmount(order.shipping_usd || 0, order.shipping_xcd || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatAmount(order.total_usd, order.total_xcd)} {currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & payment */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif font-semibold text-base text-foreground mb-3">Delivery</h3>
                <p className="text-sm text-foreground">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.address_line1}</p>
                {order.address_line2 && <p className="text-sm text-muted-foreground">{order.address_line2}</p>}
                <p className="text-sm text-muted-foreground">
                  {order.city}{order.state_province ? `, ${order.state_province}` : ""} {order.postal_code || ""}
                </p>
                <p className="text-sm text-muted-foreground">{order.country}</p>
                {order.phone && <p className="text-sm text-muted-foreground mt-2">{order.phone}</p>}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif font-semibold text-base text-foreground mb-3">Payment</h3>
                <p className="text-sm text-foreground capitalize">{order.payment_method}</p>
                <p className="text-sm text-muted-foreground capitalize">Status: {order.payment_status}</p>
                {order.payment_transaction_id && (
                  <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                    {order.payment_transaction_id}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}