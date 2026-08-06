import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthorizeNetCardForm, type OpaqueData } from "@/components/payments/AuthorizeNetCardForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { dataLayerPush, pixelTrack } from "@/lib/tracking";
import { Loader2, Calendar, Clock, Video, ShieldCheck } from "lucide-react";

export interface ConsultationSettings {
  fee_usd: number;
  calendly_username: string;
  calendly_event_slug: string;
  duration_minutes: number;
  notice_hours: number;
  title: string;
}

interface ConsultationBookingFormProps {
  settings: ConsultationSettings | null;
  compact?: boolean;
  onBeginCheckout?: () => void;
}

function getAttribution() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
    referral_code: params.get("ref") || undefined,
    landing_path: window.location.pathname + window.location.search,
  };
}

export function ConsultationBookingForm({
  settings,
  compact = false,
  onBeginCheckout,
}: ConsultationBookingFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const fee = settings?.fee_usd ?? 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const canProceed = form.name.trim().length > 1 && isEmailValid && fee > 0;

  useEffect(() => {
    if (showCard) {
      dataLayerPush("begin_checkout", {
        value: fee,
        currency: "USD",
        item_name: settings?.title || "Private Healing Consultation",
      });
      pixelTrack("InitiateCheckout", {
        value: fee,
        currency: "USD",
        content_name: settings?.title || "Private Healing Consultation",
      });
      onBeginCheckout?.();
    }
  }, [showCard, fee, settings?.title, onBeginCheckout]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleToken = async ({
    opaqueData,
    cardholderName,
  }: {
    opaqueData: OpaqueData;
    cardholderName: string;
  }) => {
    if (!settings) return;
    setIsProcessing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendly-consultation`,
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
            name: cardholderName || form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            opaqueData,
            attribution: getAttribution(),
          }),
        }
      );

      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result?.calendly_url) {
        throw new Error(result?.error || "Booking could not be completed.");
      }

      dataLayerPush("purchase", {
        value: fee,
        currency: "USD",
        transaction_id: result.booking_id,
        item_name: settings.title,
      });
      pixelTrack("Purchase", {
        value: fee,
        currency: "USD",
        content_name: settings.title,
        content_ids: [result.booking_id],
      });

      toast({
        title: "Payment received",
        description: "Redirecting to Calendly to choose your time...",
      });

      window.location.href = result.calendly_url;
    } catch (err: any) {
      toast({
        title: "Payment failed",
        description: err?.message || "Please try again or use a different card.",
        variant: "destructive",
        duration: 20000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!showCard ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="consultation-name">Full Name</Label>
              <Input
                id="consultation-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="consultation-email">Email Address</Label>
              <Input
                id="consultation-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="consultation-phone">Phone (optional)</Label>
            <Input
              id="consultation-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
              maxLength={30}
            />
          </div>

          {!compact && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" style={{ color: "var(--site-gold, #9A6B3F)" }} />
                {settings.duration_minutes} minutes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" style={{ color: "var(--site-gold, #9A6B3F)" }} />
                {settings.notice_hours}-hour advance booking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Video className="w-4 h-4" style={{ color: "var(--site-gold, #9A6B3F)" }} />
                Zoom meeting
              </span>
            </div>
          )}

          <button
            onClick={() => {
              if (!canProceed) {
                toast({
                  title: "Please complete the form",
                  description: "Enter your full name and a valid email to continue.",
                  variant: "destructive",
                });
                return;
              }
              dataLayerPush("cta_click", {
                cta_intent: "book",
                cta_location: "consultation_form",
                cta_label: "Continue to Payment",
              });
              setShowCard(true);
            }}
            disabled={!canProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:brightness-110 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: "var(--site-gold, #BC8A5F)",
              color: "#0F281E",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "16px",
              minHeight: "56px",
            }}
          >
            Continue to Payment — ${fee.toFixed(2)} USD
          </button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure payment via Authorize.net. Card details never touch our servers.
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Payment details</p>
              <p className="text-sm text-muted-foreground">
                {form.name} · {form.email}
              </p>
            </div>
            <button
              onClick={() => setShowCard(false)}
              className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
            >
              Edit details
            </button>
          </div>

          <AuthorizeNetCardForm
            amountUsd={fee}
            buttonLabel={`Pay $${fee.toFixed(2)} & Schedule on Calendly`}
            disabled={isProcessing}
            processing={isProcessing}
            defaultCardholderName={form.name}
            onToken={handleToken}
          />
        </div>
      )}
    </div>
  );
}
