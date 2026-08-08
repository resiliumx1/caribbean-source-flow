/** Gated online symposium livestream.
 *
 *  Access is verified server-side against a purchase entitlement; the embed is
 *  never present in the page bundle. Purchasers unlock with the email address
 *  they bought with, and the unlock is remembered on this device.
 */
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Lock, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WceThemeProvider } from "@/components/wce/WceThemeProvider";
import { DiamondRule, GoldFlourish, FlowerOfLifeField } from "@/components/wce/decor";
import "@/styles/wce.css";

const STORE_KEY = "wce2026_live_token";

interface Access {
  ready: boolean;
  embed_url: string | null;
  embed_code: string | null;
  fallback_copy: string;
  email: string;
}

export default function WceLive() {
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [access, setAccess] = useState<Access | null>(null);

  const request = async (body: { email?: string; access_token?: string }) => {
    const { data, error } = await supabase.functions.invoke("wce-livestream-access", { body });
    const payload = data as
      | (Access & { entitled?: boolean; access_token?: string; message?: string; error?: string })
      | null;
    if (error || payload?.error) {
      setMessage(payload?.error ?? "We could not check your access just now. Please try again in a moment.");
      return false;
    }
    if (!payload?.entitled) {
      window.localStorage.removeItem(STORE_KEY);
      setMessage(payload?.message ?? "We could not find online access for that email address.");
      return false;
    }
    if (payload.access_token) window.localStorage.setItem(STORE_KEY, payload.access_token);
    setMessage(null);
    setAccess({
      ready: payload.ready,
      embed_url: payload.embed_url,
      embed_code: payload.embed_code,
      fallback_copy: payload.fallback_copy,
      email: payload.email,
    });
    return true;
  };

  // Silent re-entry for anyone who has already unlocked on this device.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORE_KEY);
    if (!saved) { setChecking(false); return; }
    (async () => {
      await request({ access_token: saved });
      setChecking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await request({ email: email.trim() });
    setSubmitting(false);
  };

  return (
    <WceThemeProvider>
      <Helmet>
        <title>Online Symposium Livestream | Caribbean Wellness Saint Lucia 2026</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main
        className="wce-root wce-surface flex min-h-screen items-center justify-center px-6 py-20"
        style={{ background: "var(--wce-forest-deep)" }}
      >
        <FlowerOfLifeField className="wce-surface-bg" opacity={0.05} />
        <div className={access ? "relative w-full max-w-4xl" : "relative w-full max-w-lg"}>
          <div
            className="px-7 py-10 sm:px-10"
            style={{ background: "var(--wce-forest)", border: "1px solid rgba(201,162,39,0.5)", borderRadius: "2px" }}
          >
            <GoldFlourish className="mx-auto" size={48} />
            <p className="wce-eyebrow mt-6 text-center" style={{ color: "var(--wce-gold-light)" }}>
              Caribbean Wellness Saint Lucia 2026
            </p>
            <h1
              className="mt-3 text-center text-[clamp(1.5rem,4vw,2.1rem)]"
              style={{ fontFamily: "var(--wce-display)", color: "var(--wce-cream)" }}
            >
              Online Symposium
            </h1>
            <DiamondRule className="mx-auto mt-5 max-w-[9rem]" />

            {checking && (
              <p className="mt-8 flex items-center justify-center gap-2 text-[0.9375rem]" style={{ color: "rgba(245,239,224,0.85)" }}>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Checking your access…
              </p>
            )}

            {!checking && !access && (
              <form onSubmit={onSubmit} className="mt-8">
                <p className="mx-auto max-w-[46ch] text-center text-[0.9375rem] leading-relaxed" style={{ color: "rgba(245,239,224,0.9)" }}>
                  Enter the email address you used to purchase online access and the stream will open here.
                </p>
                <label htmlFor="wce-live-email" className="wce-label mt-7 block" style={{ color: "var(--wce-gold-light)" }}>
                  Email address
                </label>
                <input
                  id="wce-live-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="wce-input mt-2 w-full"
                  placeholder="you@example.com"
                />
                <button type="submit" className="wce-btn wce-btn-gold mt-6 w-full" disabled={submitting}>
                  {submitting ? "Checking…" : "Unlock the Livestream"}
                </button>
                {message && (
                  <p className="mt-4 text-[0.9375rem] leading-relaxed" role="alert" style={{ color: "#F2D98A" }}>
                    {message}
                  </p>
                )}
                <p className="mt-7 flex items-center justify-center gap-2 text-[0.8125rem]" style={{ color: "rgba(245,239,224,0.6)" }}>
                  <Lock className="h-3.5 w-3.5" aria-hidden /> Access is reserved for online symposium purchasers.
                </p>
                <p className="mt-5 text-center text-[0.9375rem]">
                  <a href="/wce-2026#pathways" style={{ color: "var(--wce-gold-light)" }}>
                    Have not purchased yet? Get online access
                  </a>
                </p>
              </form>
            )}

            {access && (
              <div className="mt-8">
                <p className="text-center text-[0.875rem]" style={{ color: "rgba(245,239,224,0.7)" }}>
                  Access confirmed for {access.email}
                </p>
                {access.ready && access.embed_url ? (
                  <div
                    className="mt-6 overflow-hidden"
                    style={{ aspectRatio: "16 / 9", border: "1px solid rgba(201,162,39,0.45)", borderRadius: "2px" }}
                  >
                    <iframe
                      src={access.embed_url}
                      title="Caribbean Wellness Saint Lucia 2026 livestream"
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : access.ready && access.embed_code ? (
                  <div
                    className="mt-6"
                    // Embed markup is authored by organisers in the console and
                    // returned only to entitled viewers.
                    dangerouslySetInnerHTML={{ __html: access.embed_code }}
                  />
                ) : (
                  <div className="mt-8 text-center">
                    <PlayCircle className="mx-auto h-10 w-10" style={{ color: "var(--wce-gold-light)" }} aria-hidden />
                    <p className="mx-auto mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed" style={{ color: "rgba(245,239,224,0.9)" }}>
                      {access.fallback_copy}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </WceThemeProvider>
  );
}
