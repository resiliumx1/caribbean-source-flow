/** Private retreat checkout — reachable only with an approved application token.
 *
 *  There is no public route into this page: no nav link, no button, no sitemap
 *  entry, and it is noindex. The token is verified server-side on load, so an
 *  invalid, expired or already-used link never renders a payment form.
 */
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthorizeNetCardForm } from "@/components/payments/AuthorizeNetCardForm";
import { WceThemeProvider } from "@/components/wce/WceThemeProvider";
import { DiamondRule, GoldFlourish, FlowerOfLifeField } from "@/components/wce/decor";
import { WCE_META_EVENTS, wceMetaTrack } from "@/components/wce/meta-events";
import "@/styles/wce.css";

interface Verified {
  applicant: { full_name: string; email: string; country: string | null };
  product: { name: string; price_usd: number };
  expires_at: string | null;
}

interface Paid {
  order_number: string;
  amount_usd: number;
}

export default function WceRetreatCheckout() {
  const { token = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [gateError, setGateError] = useState<string | null>(null);
  const [verified, setVerified] = useState<Verified | null>(null);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paid, setPaid] = useState<Paid | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.functions.invoke("wce-retreat-checkout", {
        body: { action: "verify", token },
      });
      if (cancelled) return;
      const payload = data as (Verified & { ok?: boolean; error?: string }) | null;
      if (error || !payload?.ok) {
        setGateError(payload?.error ?? "This payment link is not valid. Please contact us for a new one.");
      } else {
        setVerified({ applicant: payload.applicant, product: payload.product, expires_at: payload.expires_at });
        wceMetaTrack(WCE_META_EVENTS.retreatInitiateCheckout, {
          content_name: payload.product.name,
          value: payload.product.price_usd,
          currency: "USD",
          funnel: "retreat",
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  const onToken = async ({
    opaqueData,
    cardholderName,
    threeDS,
  }: {
    opaqueData: { dataDescriptor: string; dataValue: string };
    cardholderName: string;
    threeDS?: ThreeDSResult;
  }) => {
    setProcessing(true);
    setPayError(null);
    const { data, error } = await supabase.functions.invoke("wce-retreat-checkout", {
      body: { action: "pay", token, opaqueData, cardholder_name: cardholderName, threeDS },
    });
    const payload = data as { ok?: boolean; error?: string; order_number?: string; amount_usd?: number } | null;
    setProcessing(false);
    if (error || !payload?.ok) {
      setPayError(payload?.error ?? "We could not complete your payment. Please check your details and try again.");
      return;
    }
    // Purchase fires here and only here — after a confirmed charge.
    wceMetaTrack(WCE_META_EVENTS.retreatPurchase, {
      content_name: verified?.product.name,
      value: payload.amount_usd,
      currency: "USD",
      funnel: "retreat",
    });
    setPaid({ order_number: payload.order_number ?? "", amount_usd: payload.amount_usd ?? 0 });
  };

  return (
    <WceThemeProvider>
      <Helmet>
        <title>Caribbean Wellness Fortification Retreat Payment | Caribbean Wellness Saint Lucia 2026</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main
        className="wce-root wce-surface flex min-h-screen items-center justify-center px-6 py-20"
        style={{ background: "var(--wce-forest-deep)" }}
      >
        <FlowerOfLifeField className="wce-surface-bg" opacity={0.05} />
        <div
          className="relative w-full max-w-lg px-7 py-10 sm:px-10"
          style={{
            background: "var(--wce-forest)",
            border: "1px solid rgba(201,162,39,0.5)",
            borderRadius: "2px",
          }}
        >
          <GoldFlourish className="mx-auto" size={48} />
          <p className="wce-eyebrow mt-6 text-center" style={{ color: "var(--wce-gold-light)" }}>
            Caribbean Wellness Saint Lucia 2026
          </p>
          <h1
            className="mt-3 text-center text-[clamp(1.5rem,4vw,2.1rem)]"
            style={{ fontFamily: "var(--wce-display)", color: "var(--wce-cream)" }}
          >
            Caribbean Wellness Fortification Retreat
          </h1>
          <DiamondRule className="mx-auto mt-5 max-w-[9rem]" />

          {loading && (
            <p className="mt-8 flex items-center justify-center gap-2 text-[0.9375rem]" style={{ color: "rgba(245,239,224,0.85)" }}>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Checking your invitation…
            </p>
          )}

          {!loading && gateError && (
            <div className="mt-8 text-center">
              <p className="text-[1rem] leading-relaxed" style={{ color: "#F2D98A" }}>{gateError}</p>
              <a href="/wce-2026#apply" className="wce-btn wce-btn-outline mt-7 inline-flex">Back to the event</a>
            </div>
          )}

          {!loading && verified && !paid && (
            <>
              <dl className="mt-8 space-y-3 text-[0.9375rem]" style={{ color: "rgba(245,239,224,0.9)" }}>
                <div className="flex justify-between gap-4">
                  <dt>Applicant</dt><dd style={{ color: "var(--wce-cream)" }}>{verified.applicant.full_name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Email</dt><dd style={{ color: "var(--wce-cream)" }}>{verified.applicant.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Dates</dt><dd style={{ color: "var(--wce-cream)" }}>12–17 October 2026</dd>
                </div>
                <div
                  className="flex justify-between gap-4 pt-3"
                  style={{ borderTop: "1px solid rgba(201,162,39,0.4)" }}
                >
                  <dt style={{ color: "var(--wce-gold-light)" }}>Total due</dt>
                  <dd style={{ color: "var(--wce-gold-light)", fontWeight: 600 }}>
                    US${verified.product.price_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 flex items-start gap-2 text-[0.875rem] leading-relaxed" style={{ color: "rgba(245,239,224,0.75)" }}>
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                This link was issued to you personally after your application was reviewed. It can be used once.
              </p>

              <div className="mt-8">
                <AuthorizeNetCardForm
                  amountUsd={verified.product.price_usd}
                  buttonLabel="Complete Retreat Payment"
                  defaultCardholderName={verified.applicant.full_name}
                  processing={processing}
                  onToken={onToken}
                />
              </div>

              {payError && (
                <p className="mt-4 text-[0.9375rem]" role="alert" style={{ color: "#F2D98A" }}>{payError}</p>
              )}

              <p className="mt-6 flex items-center justify-center gap-2 text-[0.8125rem]" style={{ color: "rgba(245,239,224,0.6)" }}>
                <Lock className="h-3.5 w-3.5" aria-hidden /> Card details are encrypted and never stored on our servers.
              </p>
            </>
          )}

          {paid && (
            <div className="mt-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10" style={{ color: "var(--wce-gold-light)" }} aria-hidden />
              <h2 className="mt-4 text-[1.3rem]" style={{ fontFamily: "var(--wce-display)", color: "var(--wce-cream)" }}>
                Your place is confirmed
              </h2>
              <p className="mx-auto mt-4 max-w-[42ch] text-[0.9375rem] leading-relaxed" style={{ color: "rgba(245,239,224,0.9)" }}>
                Thank you. We have received US${paid.amount_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })} and
                your booking reference is <strong style={{ color: "var(--wce-gold-light)" }}>{paid.order_number}</strong>.
                A confirmation is on its way to your email, and our team will follow up with your arrival details.
              </p>
              <a href="/wce-2026" className="wce-btn wce-btn-gold mt-8 inline-flex">Back to the event</a>
            </div>
          )}
        </div>
      </main>
    </WceThemeProvider>
  );
}
