import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StoreFooter } from "@/components/store/StoreFooter";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Checkout() {
  const { cartItems, cartCount, clearCart } = useCart();
  const { formatPriceBoth } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "LC",
    customer_note: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const subtotalUsd = cartItems.reduce(
    (sum, item) => sum + (item.product?.price_usd ?? 0) * item.quantity,
    0
  );
  const subtotalXcd = cartItems.reduce(
    (sum, item) => sum + (item.product?.price_xcd ?? 0) * item.quantity,
    0
  );
  const prices = formatPriceBoth(subtotalUsd, subtotalXcd);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.first_name || cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to checkout.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/woo-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
            })),
            billing: {
              first_name: form.first_name,
              last_name: form.last_name,
              email: form.email,
              phone: form.phone,
              address_1: form.address_1,
              address_2: form.address_2,
              city: form.city,
              state: form.state,
              postcode: form.postcode,
              country: form.country,
            },
            customer_note: form.customer_note,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Order creation failed");

      clearCart();
      toast({
        title: "Order Created!",
        description: `Order #${result.order_number} placed. Redirecting to payment...`,
      });

      // Redirect to WooCommerce payment page
      if (result.payment_url) {
        window.location.href = result.payment_url;
      }
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            Your cart is empty
          </h1>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form fields */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-serif font-semibold text-lg text-foreground">
                  Contact Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      required
                      value={form.first_name}
                      onChange={(e) => update("first_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={form.last_name}
                      onChange={(e) => update("last_name", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-serif font-semibold text-lg text-foreground">
                  Shipping Address
                </h2>
                <div>
                  <Label htmlFor="address_1">Address Line 1 *</Label>
                  <Input
                    id="address_1"
                    required
                    value={form.address_1}
                    onChange={(e) => update("address_1", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address_2">Address Line 2</Label>
                  <Input
                    id="address_2"
                    value={form.address_2}
                    onChange={(e) => update("address_2", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      required
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State / Parish</Label>
                    <Input
                      id="state"
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postcode">Postal Code</Label>
                    <Input
                      id="postcode"
                      value={form.postcode}
                      onChange={(e) => update("postcode", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-serif font-semibold text-lg text-foreground">
                  Order Notes
                </h2>
                <Textarea
                  placeholder="Any special requests or delivery instructions..."
                  value={form.customer_note}
                  onChange={(e) => update("customer_note", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24 space-y-4">
                <h2 className="font-serif font-semibold text-lg text-foreground">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  {cartItems.map((item) => {
                    if (!item.product) return null;
                    const itemPrices = formatPriceBoth(
                      item.product.price_usd * item.quantity,
                      item.product.price_xcd * item.quantity
                    );
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="text-foreground font-medium">
                          {itemPrices.primary}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {prices.primary}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {prices.secondary}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  You'll be redirected to our secure payment page to complete
                  your order.
                </p>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
      <StoreFooter />
    </div>
  );
}
