import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Package, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/lib/store-context";
import { StoreFooter } from "@/components/store/StoreFooter";
import { SEOHead } from "@/components/SEOHead";

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};
const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
};

interface OrderRow {
  id: string;
  order_number: string | null;
  created_at: string;
  total_usd: number;
  total_xcd: number;
  currency_used: string;
  status: string | null;
  payment_status: string | null;
  item_count: number;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { currency } = useStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true, state: { from: "/account/orders" } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from("orders")
        .select(
          "id, order_number, created_at, total_usd, total_xcd, currency_used, status, payment_status, order_items(id)",
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (cancelled) return;
      if (error) {
        setOrders([]);
      } else {
        setOrders(
          (data || []).map((o: any) => ({
            ...o,
            item_count: Array.isArray(o.order_items) ? o.order_items.length : 0,
          }))
        );
        setTotal(count || 0);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <SEOHead title="My Orders | Mount Kailash" description="View your order history." path="/account/orders" noindex />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <Link to="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Account
        </Link>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">My Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Signed in as {user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
            Sign Out
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-serif text-xl text-foreground mb-2">No orders yet</h2>
              <p className="text-sm text-muted-foreground mb-6">
                When you place your first order, it will show up here.
              </p>
              <Button asChild>
                <Link to="/shop">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((o) => {
                const amount = currency === "XCD" ? o.total_xcd : o.total_usd;
                const status = (o.status || "pending").toLowerCase();
                const pStatus = (o.payment_status || "pending").toLowerCase();
                return (
                  <Card key={o.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono font-semibold text-foreground">{o.order_number || "—"}</span>
                            <Badge variant="outline" className={STATUS_COLORS[status] || ""}>{status}</Badge>
                            <Badge variant="outline" className={PAYMENT_COLORS[pStatus] || ""}>payment: {pStatus}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(o.created_at)} · {o.item_count} item{o.item_count === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              {currency === "XCD" ? "EC$" : "$"}{Number(amount).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">{currency}</p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/account/orders/${o.order_number}`}>
                              View Details <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {page + 1} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}