import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { SEOHead } from "@/components/SEOHead";
import { useRetreatTypes, useRetreatDates, useSoloPricingTiers, calculateSoloPrice } from "@/hooks/use-retreats";
import { format, addDays } from "date-fns";

export default function RetreatBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [search] = useSearchParams();
  const dateId = search.get("date");
  const initialNights = Math.max(3, Number(search.get("nights") || 7));

  const navigate = useNavigate();
  const { toast } = useToast();
  const [{ isResolved }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: types = [] } = useRetreatTypes();
  const { data: dates = [] } = useRetreatDates();
  const { data: tiers = [] } = useSoloPricingTiers();

  const retreatType = useMemo(() => types.find((t) => t.slug === slug), [types, slug]);
  const groupDate = useMemo(() => dates.find((d) => d.id === dateId), [dates, dateId]);

  const [form, setForm] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    special_requests: "",
  });
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(initialNights);
  const [startDate, setStartDate] = useState<string>(
    format(addDays(new Date(), 14), "yyyy-MM-dd")
  );
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("deposit");

  // Lock dates/guests for group bookings
  useEffect(() => {
    if (groupDate) {
      setStartDate(groupDate.start_date);
    }
  }, [groupDate]);

  const isGroup = retreatType?.type === "group";
  const endDate = isGroup && groupDate
    ? groupDate.end_date
    : format(addDays(new Date(startDate), nights), "yyyy-MM-dd");

  const totalUsd = useMemo(() => {
    if (!retreatType) return 0;
    if (isGroup) {
      const per = Number(groupDate?.price_override_usd ?? retreatType.base_price_usd);
      return per * guests;
    }
    const calc = calculateSoloPrice(nights, tiers);
    return calc ? calc.total * guests : 0;
  }, [retreatType, isGroup, groupDate, guests, nights, tiers]);

  const amountDue = paymentOption === "deposit" ? +(totalUsd / 2).toFixed(2) : +totalUsd.toFixed(2);
  const balance = +(totalUsd - amountDue).toFixed(2);

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim());
  const canPay = !!(
    form.contact_name.trim() &&
    isEmailValid &&
    form.contact_phone.trim() &&
    totalUsd > 0 &&
    !isProcessing
  );

  if (!retreatType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Book ${retreatType.name} | Mount Kailash`}
        description="Reserve your spot at Mount Kailash Rejuvenation Centre. Pay in full or with a 50% deposit."
        path={`/retreats/book/${slug}`}
      />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <Link to="/retreats" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Retreats
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
          Book: {retreatType.name}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isGroup
            ? "Group immersion — fixed dates."
            : "Solo retreat — choose your dates and length of stay."}
        </p>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Dates / nights */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-serif font-semibold text-lg">Your Stay</h2>
              {isGroup ? (
                <p className="text-sm">
                  <strong>{groupDate ? format(new Date(groupDate.start_date), "MMM d, yyyy") : "—"}</strong>
                  {" → "}
                  <strong>{groupDate ? format(new Date(groupDate.end_date), "MMM d, yyyy") : "—"}</strong>
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Check-in *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={startDate}
                      min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nights">Nights *</Label>
                    <Input
                      id="nights"
                      type="number"
                      min={retreatType.min_nights}
                      max={retreatType.max_nights}
                      value={nights}
                      onChange={(e) => setNights(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="guests">Guests *</Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  max={retreatType.max_capacity}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-serif font-semibold text-lg">Contact Information</h2>
              <div>
                <Label htmlFor="contact_name">Full Name *</Label>
                <Input id="contact_name" value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} maxLength={120} />
              </div>
              <div>
                <Label htmlFor="contact_email">Email *</Label>
                <Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} maxLength={255} />
                {form.contact_email && !isEmailValid && (
                  <p className="text-xs text-destructive mt-1">Enter a valid email.</p>
                )}
              </div>
              <div>
                <Label htmlFor="contact_phone">Phone *</Label>
                <Input id="contact_phone" value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} maxLength={30} />
              </div>
              <div>
                <Label htmlFor="special_requests">Special Requests</Label>
                <Textarea id="special_requests" value={form.special_requests} onChange={(e) => update("special_requests", e.target.value)} rows={3} maxLength={1000} />
              </div>
            </div>

            {/* Payment option */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h2 className="font-serif font-semibold text-lg">Payment</h2>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30">
                <input
                  type="radio"
                  name="payment_option"
                  checked={paymentOption === "full"}
                  onChange={() => setPaymentOption("full")}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">Pay in full</p>
                  <p className="text-sm text-muted-foreground">
                    Pay ${totalUsd.toFixed(2)} USD now and you're fully booked.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30">
                <input
                  type="radio"
                  name="payment_option"
                  checked={paymentOption === "deposit"}
                  onChange={() => setPaymentOption("deposit")}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">50% deposit</p>
                  <p className="text-sm text-muted-foreground">
                    Pay ${(totalUsd / 2).toFixed(2)} USD now. Balance of ${(totalUsd / 2).toFixed(2)} USD due before arrival.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-serif font-semibold text-lg">Booking Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Retreat</span><span>{retreatType.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span>{guests}</span></div>
                {!isGroup && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Nights</span><span>{nights}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span>{format(new Date(startDate), "MMM d, yyyy")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span>{format(new Date(endDate), "MMM d, yyyy")}</span></div>
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span>${totalUsd.toFixed(2)} USD</span></div>
                <div className="flex justify-between font-semibold"><span>Due now</span><span>${amountDue.toFixed(2)} USD</span></div>
                {balance > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Balance before arrival</span><span>${balance.toFixed(2)} USD</span></div>
                )}
              </div>

              <div className="relative min-h-[48px]">
                {!canPay && (
                  <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-[1px] rounded-md flex items-center justify-center pointer-events-none">
                    <p className="text-xs text-muted-foreground text-center px-4">
                      Complete your details to continue.
                    </p>
                  </div>
                )}
                {!isResolved ? (
                  <div className="h-12 flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading secure payment…
                  </div>
                ) : (
                  <PayPalButtons
                    disabled={!canPay}
                    forceReRender={[amountDue, paymentOption, guests, nights, startDate]}
                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
                    createOrder={(_data, actions) =>
                      actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            amount: { value: amountDue.toFixed(2), currency_code: "USD" },
                            description: `Mount Kailash — ${retreatType.name}`,
                          },
                        ],
                      })
                    }
                    onApprove={async (data, actions) => {
                      if (!actions.order) return;
                      setIsProcessing(true);
                      let captureId: string | undefined;
                      try {
                        const details = await actions.order.capture();
                        captureId =
                          (details as any)?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
                          data.orderID;

                        const { data: sessionData } = await supabase.auth.getSession();
                        const res = await fetch(
                          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/retreat-checkout`,
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
                              retreat_type_id: retreatType.id,
                              retreat_date_id: groupDate?.id ?? null,
                              start_date: startDate,
                              end_date: endDate,
                              guest_count: guests,
                              payment_option: paymentOption,
                              paypal_order_id: data.orderID,
                              paypal_capture_id: captureId,
                              paypal_capture_amount_usd: amountDue,
                              contact_name: form.contact_name,
                              contact_email: form.contact_email,
                              contact_phone: form.contact_phone,
                              special_requests: form.special_requests,
                            }),
                          }
                        );
                        const result = await res.json().catch(() => ({}));
                        if (!res.ok || !result?.booking_id) {
                          throw new Error(result?.error || "Booking failed to save.");
                        }
                        toast({
                          title: "Retreat booked!",
                          description:
                            balance > 0
                              ? `Deposit received. Balance of $${balance.toFixed(2)} due before arrival.`
                              : "Payment received in full.",
                        });
                        navigate("/retreats?booked=1");
                      } catch (err: any) {
                        console.error("retreat-checkout error", err, captureId);
                        toast({
                          title: "⚠️ Payment received but booking didn't save",
                          description: `PayPal Transaction ID: ${captureId ?? "(unknown)"}. Email info@mountkailashslu.com — do NOT pay again.`,
                          variant: "destructive",
                          duration: 60000,
                        });
                        setIsProcessing(false);
                      }
                    }}
                    onError={(err) => {
                      console.error("PayPal error:", err);
                      toast({ title: "Payment failed", description: "Please try again.", variant: "destructive" });
                      setIsProcessing(false);
                    }}
                    onCancel={() => {
                      toast({ title: "Payment cancelled" });
                      setIsProcessing(false);
                    }}
                  />
                )}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Lock className="w-3 h-3" /> Secure checkout — payments processed by PayPal
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}