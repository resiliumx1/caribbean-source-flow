import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreFooter } from "@/components/store/StoreFooter";
import { supabase } from "@/integrations/supabase/client";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const orderId = params.get("o");
  const [ebooks, setEbooks] = useState<{ product_id: string; title: string }[]>([]);
  const ebookBase = orderId
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ebook-download?order=${encodeURIComponent(orderId)}`
    : null;

  useEffect(() => {
    if (!ebookBase) return;
    fetch(`${ebookBase}&check=1`)
      .then((r) => r.json())
      .then((d) => setEbooks(Array.isArray(d?.ebooks) ? d.ebooks : []))
      .catch(() => setEbooks([]));
  }, [ebookBase]);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }
    // Best-effort: visible only to the owner (auth user) or admin per RLS.
    // For guests the page still renders the order number from the URL.
    supabase
      .from("orders")
      .select("order_number, customer_name, email, total_usd, total_xcd, currency_used")
      .eq("order_number", orderNumber)
      .maybeSingle()
      .then(({ data }) => {
        setOrder(data);
        setLoading(false);
      });
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            Thank you for your order
          </h1>

          <p className="text-muted-foreground mb-6">
            Your payment was received and your order is now being prepared.
          </p>

          <div className="bg-muted/40 rounded-lg px-4 py-3 inline-block mb-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Order Number
            </p>
            <p className="text-xl font-semibold text-foreground font-mono">
              {orderNumber || "—"}
            </p>
          </div>

          {ebookBase && ebooks.length > 0 && (
            <div className="border-2 border-primary/40 bg-primary/5 rounded-xl p-5 mb-6">
              <p className="font-serif text-lg font-semibold text-foreground mb-3">
                Your ebook is ready to download
              </p>
              <div className="flex flex-col gap-2 items-center">
                {ebooks.map((e) => (
                  <Button asChild key={e.product_id} size="lg">
                    <a href={`${ebookBase}&product=${e.product_id}`}>
                      <Download className="w-4 h-4 mr-2" /> Download {e.title} (PDF)
                    </a>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                We've also emailed you this download link.
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center text-muted-foreground text-sm mb-6">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading order…
            </div>
          ) : order ? (
            <div className="text-sm text-muted-foreground mb-6">
              A confirmation email is on its way to{" "}
              <span className="text-foreground font-medium">{order.email}</span>.
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-1.5">
              <Mail className="w-4 h-4" />
              Keep this order number — you can look up your order anytime from
              the customer portal.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
            <Button asChild>
              <Link to="/account">View My Orders</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Questions? Contact us at{" "}
            <a
              href="mailto:info@mountkailashslu.com"
              className="underline hover:opacity-80"
            >
              info@mountkailashslu.com
            </a>
          </p>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}