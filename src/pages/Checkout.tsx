import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Minus, Plus, Trash2, Check } from "lucide-react";

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
import { readAttribution, readPathway } from "@/lib/wce-attribution";
import { dataLayerPush, pixelTrack } from "@/lib/tracking";

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
  const { cartItems, cartCount, clearCart, updateQuantity, removeFromCart } = useCart();
  const { formatPriceBoth, currency } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // Inline validation: a field only shows an error once the shopper has left it.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const blur = (field: string) => () => setTouched((p) => ({ ...p, [field]: true }));


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
    billing_same_as_shipping: "true",
    billing_name: "",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_state_province: "",
    billing_postal_code: "",
    billing_country: "LC",
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Prefill the discount field from a ?ref= code captured earlier in the session.
  // The server re-validates every code, so nothing here is trusted for pricing.
  useEffect(() => {
    const stored = readAttribution()?.referral_code;
    if (stored) setCouponCode(stored.toUpperCase());
  }, []);

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
  // A separate billing address is only collected when the shopper says the card's
  // billing address differs from where the order is going. When there is no
  // delivery address at all (digital-only cart or pickup) we must still collect
  // the card's billing address — the gateway's AVS filter declines a card when
  // no street/postal code is submitted with it.
  const billingSame = form.billing_same_as_shipping === "true" && isShipping;
  const needsBilling = !billingSame;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  // Phone is only genuinely needed when something has to be delivered.
  const phoneRequired = hasPhysical;
  const contactComplete =
    !!form.customer_name.trim() && isEmailValid && (!phoneRequired || !!form.phone.trim());
  // Countries where the bank checks a postal/ZIP code — required there for AVS.
  const zipCountries = ["US", "CA", "GB"];
  const billingZipRequired = zipCountries.includes(form.billing_country);
  const shippingZipRequired = zipCountries.includes(form.country);
  const shippingComplete =
    !isShipping ||
    (!!form.address_line1.trim() &&
      !!form.city.trim() &&
      !!form.country &&
      (!shippingZipRequired || !!form.postal_code.trim()));
  const billingComplete =
    !needsBilling ||
    (!!form.billing_address_line1.trim() &&
      !!form.billing_city.trim() &&
      !!form.billing_country &&
      (!billingZipRequired || !!form.billing_postal_code.trim()));
  const isFormValid = useMemo(
    () => contactComplete && shippingComplete && billingComplete,
    [contactComplete, shippingComplete, billingComplete]
  );

  const canPay = isFormValid && agreedToTerms && cartItems.length > 0 && !isProcessing;

  const steps = [
    { label: "Your order", done: cartItems.length > 0 },
    { label: "Contact", done: contactComplete },
    ...(hasPhysical ? [{ label: "Delivery", done: shippingComplete }] : []),
    { label: "Payment", done: false },
  ];
  const activeStep = steps.findIndex((s) => !s.done);



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

  const handleAuthNetToken = async ({ opaqueData, threeDS }: { opaqueData: OpaqueData; threeDS?: ThreeDSResult }) => {
    setIsProcessing(true);
    const attribution = readAttribution();
    const pathwayKey = readPathway();
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
          // Digital-only / pickup carts collect a separate billing address, so the
          // flag must reflect what was actually entered — otherwise it is discarded.
          form: { ...form, billing_same_as_shipping: billingSame ? "true" : "false" },
            opaqueData,
            threeDS,
          currency_used: currency,
          coupon_code: appliedCoupon?.code ?? undefined,
          // Attribution only — never used for pricing.
          attribution: attribution
            ? {
                utm_source: attribution.utm_source,
                utm_medium: attribution.utm_medium,
                utm_campaign: attribution.utm_campaign,
                utm_content: attribution.utm_content,
                utm_term: attribution.utm_term,
                referral_code: appliedCoupon?.code ?? attribution.referral_code,
                landing_path: attribution.landing_path,
              }
            : undefined,
        }),
      }
    );
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result?.order_number) {
        throw new Error(result?.error || "Payment could not be completed.");
    }
      clearCart();
      dataLayerPush("purchase", {
        order_number: result.order_number,
        transaction_id: result.order_number,
        value: totalUsd,
        currency: "USD",
        pathway_key: pathwayKey,
        referral_code: appliedCoupon?.code ?? attribution?.referral_code ?? null,
        utm_source: attribution?.utm_source ?? null,
      });
      pixelTrack("Purchase", { value: totalUsd, currency: "USD" });
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

        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
          Checkout
        </h1>

        {/* Step indication — shows how far through the shopper is. */}
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-8" aria-label="Checkout progress">
          {steps.map((step, i) => {
            const isActive = i === activeStep || (activeStep === -1 && i === steps.length - 1);
            return (
              <li key={step.label} className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    step.done
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : isActive
                      ? "border-foreground/30 bg-muted text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {step.done ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                  {step.label}
                </span>
                {i < steps.length - 1 && (
                  <span className="hidden sm:block w-6 h-px bg-border" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>

        <fieldset disabled={isProcessing} className="contents">
          <div className="grid lg:grid-cols-5 gap-8 pb-28 lg:pb-0">
            {/* Order summary — first in the DOM so mobile sees the cart before
                being asked for details; sits in the right column on desktop. */}
            <div className="lg:col-span-2 lg:order-2">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <h2 className="font-serif font-semibold text-lg text-foreground">
                    Your Order
                  </h2>

                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      if (!item.product) return null;
                      const itemPrices = formatPriceBoth(
                        item.product.price_usd * item.quantity,
                        item.product.price_xcd * item.quantity
                      );
                      return (
                        <div key={item.id} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-foreground font-medium leading-snug">
                              {item.product.name}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <button
                                type="button"
                                aria-label={`Decrease quantity of ${item.product.name}`}
                                onClick={() =>
                                  updateQuantity({
                                    productId: item.product_id,
                                    quantity: item.quantity - 1,
                                  })
                                }
                                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`Increase quantity of ${item.product.name}`}
                                onClick={() =>
                                  updateQuantity({
                                    productId: item.product_id,
                                    quantity: item.quantity + 1,
                                  })
                                }
                                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Remove ${item.product.name}`}
                                onClick={() => removeFromCart(item.product_id)}
                                className="h-9 w-9 ml-1 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <span className="text-sm text-foreground font-medium whitespace-nowrap">
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
                          placeholder="Discount or referral code"
                          aria-label="Discount or referral code"
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
                      {!appliedCoupon && couponCode && !couponError && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Referral code added from your link — tap Apply to use it.
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
                    {hasPhysical && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Shipping</span>
                        <span>{shippingUsd > 0 ? shippingPrices.primary : "Free"}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">Total</span>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{prices.primary}</p>
                        <p className="text-xs text-muted-foreground">{prices.secondary}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <FDADisclaimer variant="compact" />
              </div>
            </div>

            {/* Details and payment */}
            <div className="lg:col-span-3 lg:order-1 space-y-6">
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
                    onBlur={blur("customer_name")}
                    onChange={(e) => update("customer_name", e.target.value)}
                  />
                  {touched.customer_name && !form.customer_name.trim() && (
                    <p className="text-xs text-destructive mt-1">Please enter your name.</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    maxLength={255}
                    value={form.email}
                    onBlur={blur("email")}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  {(touched.email || form.email) && !isEmailValid && (
                    <p className="text-xs text-destructive mt-1">
                      Enter a valid email address — your confirmation goes here.
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">
                    Phone {phoneRequired ? "*" : <span className="text-muted-foreground font-normal">(optional)</span>}
                  </Label>
                  <Input
                    id="phone"
                    required={phoneRequired}
                    maxLength={30}
                    value={form.phone}
                    onBlur={blur("phone")}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                  {phoneRequired && touched.phone && !form.phone.trim() && (
                    <p className="text-xs text-destructive mt-1">
                      We need a number for delivery updates.
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery only exists when something physical is in the cart. */}
              {hasPhysical && (
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <h2 className="font-serif font-semibold text-lg text-foreground">
                    Delivery
                  </h2>
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

                  {isShipping && (
                    <>
                      <div>
                        <Label htmlFor="address_line1">Address Line 1 *</Label>
                        <Input
                          id="address_line1"
                          required
                          maxLength={200}
                          value={form.address_line1}
                          onBlur={blur("address_line1")}
                          onChange={(e) => update("address_line1", e.target.value)}
                        />
                        {touched.address_line1 && !form.address_line1.trim() && (
                          <p className="text-xs text-destructive mt-1">Please enter an address.</p>
                        )}
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
                            onBlur={blur("city")}
                            onChange={(e) => update("city", e.target.value)}
                          />
                          {touched.city && !form.city.trim() && (
                            <p className="text-xs text-destructive mt-1">Please enter a city.</p>
                          )}
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
                          <Label htmlFor="postal_code">
                            Postal / ZIP Code{shippingZipRequired ? " *" : ""}
                          </Label>
                          <Input
                            id="postal_code"
                            required={shippingZipRequired}
                            maxLength={20}
                            value={form.postal_code}
                            onBlur={blur("postal_code")}
                            onChange={(e) => update("postal_code", e.target.value)}
                          />
                          {shippingZipRequired && touched.postal_code && !form.postal_code.trim() && (
                            <p className="text-xs text-destructive mt-1">
                              Your bank checks this — please enter the ZIP/postal code.
                            </p>
                          )}
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
              )}

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-serif font-semibold text-lg text-foreground">
                  Card Billing Address
                </h2>
                {isShipping ? (
                  <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer min-h-[44px] py-2">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-primary"
                      checked={billingSame}
                      onChange={(e) =>
                        update("billing_same_as_shipping", e.target.checked ? "true" : "false")
                      }
                    />
                    <span>My billing address is the same as my delivery address</span>
                  </label>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your bank checks this address against the card before approving the payment,
                    so it is required even though nothing is being shipped.
                  </p>
                )}


                {needsBilling && (
                  <>
                    <div>
                      <Label htmlFor="billing_name">Name on Card / Account</Label>
                      <Input
                        id="billing_name"
                        maxLength={120}
                        value={form.billing_name}
                        onChange={(e) => update("billing_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_address_line1">Billing Address Line 1 *</Label>
                      <Input
                        id="billing_address_line1"
                        required
                        maxLength={200}
                        value={form.billing_address_line1}
                        onBlur={blur("billing_address_line1")}
                        onChange={(e) => update("billing_address_line1", e.target.value)}
                      />
                      {touched.billing_address_line1 && !form.billing_address_line1.trim() && (
                        <p className="text-xs text-destructive mt-1">
                          Please enter the billing address.
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="billing_address_line2">Billing Address Line 2</Label>
                      <Input
                        id="billing_address_line2"
                        maxLength={200}
                        value={form.billing_address_line2}
                        onChange={(e) => update("billing_address_line2", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing_city">City *</Label>
                        <Input
                          id="billing_city"
                          required
                          maxLength={120}
                          value={form.billing_city}
                          onBlur={blur("billing_city")}
                          onChange={(e) => update("billing_city", e.target.value)}
                        />
                        {touched.billing_city && !form.billing_city.trim() && (
                          <p className="text-xs text-destructive mt-1">Please enter a city.</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="billing_state_province">State / Parish</Label>
                        <Input
                          id="billing_state_province"
                          maxLength={120}
                          value={form.billing_state_province}
                          onChange={(e) => update("billing_state_province", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing_postal_code">
                          Postal / ZIP Code{billingZipRequired ? " *" : ""}
                        </Label>
                        <Input
                          id="billing_postal_code"
                          required={billingZipRequired}
                          maxLength={20}
                          value={form.billing_postal_code}
                          onBlur={blur("billing_postal_code")}
                          onChange={(e) => update("billing_postal_code", e.target.value)}
                        />
                        {billingZipRequired &&
                          touched.billing_postal_code &&
                          !form.billing_postal_code.trim() && (
                            <p className="text-xs text-destructive mt-1">
                              Your bank checks this — please enter the ZIP/postal code on the card.
                            </p>
                          )}
                      </div>
                      <div>
                        <Label htmlFor="billing_country">Country *</Label>
                        <select
                          id="billing_country"
                          value={form.billing_country}
                          onChange={(e) => update("billing_country", e.target.value)}
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
                    <p className="text-xs text-muted-foreground">
                      Use the address your card statement is sent to — banks check this when
                      approving the payment.
                    </p>
                  </>
                )}
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-serif font-semibold text-lg text-foreground">
                  Order Notes <span className="text-sm font-sans font-normal text-muted-foreground">(optional)</span>
                </h2>
                <Textarea
                  placeholder="Any special requests or delivery instructions..."
                  value={form.customer_notes}
                  maxLength={1000}
                  onChange={(e) => update("customer_notes", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Payment */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif font-semibold text-lg text-foreground">Payment</h2>
                  <span className="text-sm text-muted-foreground">
                    Total <span className="font-semibold text-foreground">{prices.primary}</span>
                  </span>
                </div>

                <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer select-none">
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

                <div className="relative pt-1">
                  {!canPay && !isProcessing && (
                    <p className="text-xs text-muted-foreground px-1 pb-2">
                      {!contactComplete
                        ? "Add your contact details to continue."
                        : !shippingComplete
                        ? "Complete your delivery address to continue."
                        : !billingComplete
                        ? "Complete your billing address to continue."
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
        </fieldset>
      </main>

      {/* Order total stays visible while scrolling on small screens. */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Order total</p>
          <p className="text-base font-semibold text-foreground">{prices.primary}</p>
        </div>
        <p className="text-xs text-muted-foreground max-w-[55%] text-right">
          {isProcessing
            ? "Processing payment…"
            : canPay
            ? "Ready to pay below"
            : `${steps.filter((s) => s.done).length} of ${steps.length} steps complete`}
        </p>
      </div>

      <StoreFooter />
    </div>
  );
}
