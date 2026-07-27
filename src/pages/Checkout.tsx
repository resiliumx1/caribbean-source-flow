import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StoreFooter } from "@/components/store/StoreFooter";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";
import { useToast } from "@/hooks/use-toast";
import { FDADisclaimer } from "@/components/FDADisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { AuthorizeNetCardForm, type OpaqueData } from "@/components/payments/AuthorizeNetCardForm";

const COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "LC", name: "Saint Lucia" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "BS", name: "Bahamas" },
  { code: "BB", name: "Barbados" },
  { code: "BZ", name: "Belize" },
  { code: "BM", name: "Bermuda" },
  { code: "KY", name: "Cayman Islands" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "GD", name: "Grenada" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "JM", name: "Jamaica" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "SR", name: "Suriname" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TC", name: "Turks and Caicos Islands" },
  { code: "VI", name: "U.S. Virgin Islands" },
];

export default function Checkout() {
  const { cartItems, cartCount, clearCart } = useCart();
  const { formatPriceBoth, currency } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    delivery_type: "pickup" as "local" | "international" | "pickup",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "LC",
    customer_notes: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

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

  // Detect whether cart needs shipping at all (any non-digital item)
  const hasPhysical = cartItems.some(
    (i) => i.product && !(i.product as any).is_digital
  );

  // Shipping rules:
  //   - All digital → $0
  //   - Pickup (Saint Lucia) → $0
  //   - Local delivery (Saint Lucia) → 30 XCD (~$11.11 USD)
  //   - International → $30 USD (81 XCD)
  const EXCHANGE = 2.7;
  let shippingUsd = 0;
  let shippingXcd = 0;
  if (hasPhysical) {
    if (form.delivery_type === "local") {
      shippingXcd = 30;
      shippingUsd = +(30 / EXCHANGE).toFixed(2);
    } else if (form.delivery_type === "international") {
      shippingUsd = 30;
      shippingXcd = +(30 * EXCHANGE).toFixed(2);
    }
  }

  const discountUsd = appliedCoupon
    ? appliedCoupon.discount_type === "percent"
      ? +(subtotalUsd * (Number(appliedCoupon.discount_value) / 100)).toFixed(2)
      : Math.min(Number(appliedCoupon.discount_value), subtotalUsd)
    : 0;
  const discountXcd = +(discountUsd * 2.7).toFixed(2);

  const totalUsd = +(subtotalUsd - discountUsd + shippingUsd).toFixed(2);
  const totalXcd = +(subtotalXcd - discountXcd + shippingXcd).toFixed(2);

  const subtotalPrices = formatPriceBoth(subtotalUsd, subtotalXcd);
  const discountPrices = formatPriceBoth(discountUsd, discountXcd);
  const shippingPrices = formatPriceBoth(shippingUsd, shippingXcd);
  const prices = formatPriceBoth(totalUsd, totalXcd);

  // Pickup doesn't need a shipping address.
  const isShipping = hasPhysical && form.delivery_type !== "pickup";
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isFormValid = useMemo(() => {
    if (!form.customer_name.trim()) return false;
    if (!isEmailValid) return false;
    if (!form.phone.trim()) return false;
    if (isShipping) {
      if (!form.address_line1.trim()) return false;
      if (!form.city.trim()) return false;
    }
    if (!form.country) return false;
    return true;
  }, [form, isShipping, isEmailValid]);

  const canPay = isFormValid && agreedToTerms && cartItems.length > 0 && !isProcessing;

  // Called by <AuthorizeNetCardForm> after the browser tokenizes the card.
  // Capture the cart for recovery once we have a usable email (debounced).
  const capturedRef = useRef<string>("");
  useEffect(() => {
    if (!isEmailValid || cartItems.length === 0) return;
    const signature = `${form.email}|${form.customer_name}|${form.phone}|${cartItems
      .map((i) => `${i.product_id}x${i.quantity}`)
      .join(",")}`;
    if (capturedRef.current === signature) return;
    const t = setTimeout(async () => {
      capturedRef.current = signature;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-abandoned-cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            email: form.email,
            customer_name: form.customer_name,
            phone: form.phone,
            user_id: sessionData?.session?.user?.id ?? null,
            subtotal_usd: subtotalUsd,
            items: cartItems.map((i) => ({
              product_id: i.product_id,
              name: i.product?.name ?? "",
              quantity: i.quantity,
              price_usd: i.product?.price_usd ?? 0,
            })),
          }),
        });
      } catch {
        /* recovery capture is best-effort */
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [form.email, form.customer_name, form.phone, isEmailValid, cartItems, subtotalUsd]);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    setCouponError(null);
    const { data } = await supabase
      .from("coupons").select("*").ilike("code", code).maybeSingle();
    setCheckingCoupon(false);
    const now = Date.now();
    const valid =
      data &&
      data.is_active &&
      (!data.starts_at || new Date(data.starts_at).getTime() <= now) &&
      (!data.expires_at || new Date(data.expires_at).getTime() >= now) &&
      (!data.max_uses || Number(data.used_count) < Number(data.max_uses));
    if (!valid) {
      setAppliedCoupon(null);
      return setCouponError("That code isn't valid or has expired.");
    }
    if (subtotalUsd < Number(data.min_order_usd ?? 0)) {
      setAppliedCoupon(null);
      return setCouponError(`This code needs a minimum order of $${Number(data.min_order_usd).toFixed(2)}.`);
    }
    setAppliedCoupon(data);
  };

  const handleAuthNetToken = async ({ opaqueData }: { opaqueData: OpaqueData }) => {
    setIsProcessing(true);
    try {
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/authnet-charge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${
            sessionData?.session?.access_token ||
            import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          }`,
        },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
          form,
            opaqueData,
          currency_used: currency,
          coupon_code: appliedCoupon?.code ?? undefined,
        }),
      }
    );
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result?.order_number) {
        throw new Error(result?.error || "Payment could not be completed.");
    }
      clearCart();
      toast({
        title: "Order placed!",
        description: `Confirmation #${result.order_number}`,
      });
      navigate(`/order-confirmation/${result.order_number}`);
    } catch (err: any) {
      toast({
        title: "Payment failed",
        description:
          `${err?.message ?? "Payment failed."} If the charge went through but you don't see a confirmation, email info@mountkailashslu.com.`,
        variant: "destructive",
        duration: 20000,
      });
      throw err; // let the form clear its "processing" state
    } finally {
      setIsProcessing(false);
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
      {isProcessing && (
        <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl px-6 py-5 flex items-center gap-3 shadow-lg">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-foreground">
              Finalizing your order — please don't close this window…
            </span>
          </div>
        </div>
      )}

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

        <fieldset disabled={isProcessing} className="contents">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form fields */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-serif font-semibold text-lg text-foreground">
                  Contact Information
                </h2>
                <div>
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input
                    id="customer_name"
                    required
                    maxLength={120}
                    value={form.customer_name}
                    onChange={(e) => update("customer_name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  {form.email && !isEmailValid && (
                    <p className="text-xs text-destructive mt-1">
                      Enter a valid email address.
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    required
                    maxLength={30}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-serif font-semibold text-lg text-foreground">
                  Delivery
                </h2>
                {hasPhysical ? (
                  <div>
                    <Label htmlFor="delivery_type">Delivery Method *</Label>
                    <select
                      id="delivery_type"
                      value={form.delivery_type}
                      onChange={(e) => {
                        const v = e.target.value as "local" | "international" | "pickup";
                        update("delivery_type", v);
                        if (v === "local" || v === "pickup") update("country", "LC");
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="pickup">Pickup at Mount Kailash — Free (Saint Lucia)</option>
                      <option value="local">Local Delivery — 30 XCD (Saint Lucia)</option>
                      <option value="international">International Shipping — $30 USD</option>
                    </select>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your order is fully digital — no shipping required.
                  </p>
                )}

                {isShipping && (
                  <>
                    <div>
                      <Label htmlFor="address_line1">Address Line 1 *</Label>
                      <Input
                        id="address_line1"
                        required
                        maxLength={200}
                        value={form.address_line1}
                        onChange={(e) => update("address_line1", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address_line2">Address Line 2</Label>
                      <Input
                        id="address_line2"
                        maxLength={200}
                        value={form.address_line2}
                        onChange={(e) => update("address_line2", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          required
                          maxLength={120}
                          value={form.city}
                          onChange={(e) => update("city", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state_province">State / Parish</Label>
                        <Input
                          id="state_province"
                          maxLength={120}
                          value={form.state_province}
                          onChange={(e) => update("state_province", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                          id="postal_code"
                          maxLength={20}
                          value={form.postal_code}
                          onChange={(e) => update("postal_code", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <select
                          id="country"
                          value={form.country}
                          onChange={(e) => update("country", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-serif font-semibold text-lg text-foreground">
                  Order Notes
                </h2>
                <Textarea
                  placeholder="Any special requests or delivery instructions..."
                  value={form.customer_notes}
                  maxLength={1000}
                  onChange={(e) => update("customer_notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-4">
                <FDADisclaimer variant="compact" />
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
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
                        <div key={item.id} className="flex justify-between text-sm">
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

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="pb-2">
                      <div className="flex gap-2">
                        <input
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                          placeholder="Discount code"
                          aria-label="Discount code"
                          className="flex-1 h-11 rounded-md border border-border bg-background px-3 text-sm uppercase"
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          disabled={checkingCoupon || !couponCode.trim()}
                          className="h-11 px-4 rounded-md border border-border text-sm font-medium disabled:opacity-50"
                        >
                          {checkingCoupon ? "Checking…" : appliedCoupon ? "Applied" : "Apply"}
                        </button>
                      </div>
                      {couponError && <p className="text-xs text-destructive mt-1.5">{couponError}</p>}
                      {appliedCoupon && (
                        <p className="text-xs mt-1.5" style={{ color: "#15803d" }}>
                          {appliedCoupon.code} applied
                          {appliedCoupon.discount_type === "percent"
                            ? ` — ${Number(appliedCoupon.discount_value)}% off`
                            : ` — $${Number(appliedCoupon.discount_value).toFixed(2)} off`}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{subtotalPrices.primary}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm" style={{ color: "#15803d" }}>
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>−{discountPrices.primary}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping</span>
                      <span>
                        {hasPhysical && shippingUsd > 0
                          ? shippingPrices.primary
                          : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">Total</span>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{prices.primary}</p>
                        <p className="text-xs text-muted-foreground">{prices.secondary}</p>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border accent-primary shrink-0"
                      aria-label="Agree to Terms and Conditions and Privacy Policy"
                    />
                    <span className="leading-relaxed">
                      I have read and agree to the{" "}
                      <Link
                        to="/terms-and-conditions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80"
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {/* Authorize.net card form */}
                  <div className="relative pt-1">
                    {!canPay && (
                      <p className="text-xs text-muted-foreground text-center px-4 pb-2">
                        {!isFormValid
                          ? "Complete your contact & delivery details above."
                          : !agreedToTerms
                          ? "Please agree to the Terms & Privacy Policy."
                          : ""}
                      </p>
                    )}
                    <AuthorizeNetCardForm
                      amountUsd={totalUsd}
                      disabled={!canPay}
                      processing={isProcessing}
                      defaultCardholderName={form.customer_name}
                      defaultZip={form.postal_code}
                      onToken={handleAuthNetToken}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      </main>
      <StoreFooter />
    </div>
  );
}