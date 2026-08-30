import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Authorize.net Accept.js card form.
 *
 * Tokenizes the card in the browser (PCI SAQ-A) and hands the resulting
 * opaqueData ({ dataDescriptor, dataValue }) to the parent, which submits it
 * to the appropriate charge edge function. Card details never touch our
 * servers.
 */

const ACCEPT_JS_URL = "https://js.authorize.net/v1/Accept.js";

declare global {
  interface Window {
    Accept?: {
      dispatchData(
        secureData: {
          authData: { clientKey: string; apiLoginID: string };
          cardData: {
            cardNumber: string;
            month: string;
            year: string;
            cardCode: string;
            zip?: string;
            fullName?: string;
          };
        },
        cb: (response: {
          messages: {
            resultCode: "Ok" | "Error";
            message: Array<{ code: string; text: string }>;
          };
          opaqueData?: { dataDescriptor: string; dataValue: string };
        }) => void,
      ): void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadAcceptJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Accept) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${ACCEPT_JS_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Accept.js failed to load.")));
      if (window.Accept) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = ACCEPT_JS_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Accept.js failed to load."));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

let configPromise: Promise<{ apiLoginId: string; clientKey: string }> | null = null;
function loadConfig() {
  if (configPromise) return configPromise;
  configPromise = (async () => {
    const { data, error } = await supabase.functions.invoke("authnet-config");
    if (error || !data?.apiLoginId || !data?.clientKey) {
      configPromise = null;
      throw new Error(data?.error || error?.message || "Payment config unavailable.");
    }
    return { apiLoginId: data.apiLoginId as string, clientKey: data.clientKey as string };
  })();
  return configPromise;
}

export interface OpaqueData {
  dataDescriptor: string;
  dataValue: string;
}

export interface AuthorizeNetCardFormProps {
  amountUsd: number;
  buttonLabel?: string;
  disabled?: boolean;
  defaultCardholderName?: string;
  defaultZip?: string;
  processing?: boolean;
  onToken: (data: { opaqueData: OpaqueData; cardholderName: string }) => Promise<void> | void;
}

function digitsOnly(v: string) {
  return v.replace(/\D+/g, "");
}

function formatCardNumber(v: string) {
  const d = digitsOnly(v).slice(0, 19);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function luhnValid(num: string): boolean {
  if (num.length < 13 || num.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = num.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function expiryValid(mm: string, yy: string): boolean {
  if (!/^\d{2}$/.test(mm) || !/^\d{2}$/.test(yy)) return false;
  const m = Number(mm);
  if (m < 1 || m > 12) return false;
  const now = new Date();
  const curYY = now.getFullYear() % 100;
  const curMM = now.getMonth() + 1;
  const y = Number(yy);
  return y > curYY || (y === curYY && m >= curMM);
}

export function AuthorizeNetCardForm({
  amountUsd,
  buttonLabel,
  disabled,
  defaultCardholderName,
  defaultZip,
  processing,
  onToken,
}: AuthorizeNetCardFormProps) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tokenizing, setTokenizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardholder, setCardholder] = useState(defaultCardholderName ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState(""); // MM/YY
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState(defaultZip ?? "");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const blur = (field: string) => () => setTouched((p) => ({ ...p, [field]: true }));

  // Derived per-field validity
  const cn = digitsOnly(cardNumber);
  const cvvClean = digitsOnly(cvv);
  const [mmRaw, yyRaw] = exp.split("/").map((s) => s?.trim() ?? "");
  const mm = digitsOnly(mmRaw).padStart(2, "0").slice(0, 2);
  const yy = digitsOnly(yyRaw).slice(-2);

  const fieldErrors = {
    cardholder: cardholder.trim() ? null : "Cardholder name is required.",
    cardNumber: luhnValid(cn) ? null : "Enter a valid card number.",
    exp: expiryValid(mm, yy)
      ? null
      : /^\d{2}$/.test(mm) && /^\d{2}$/.test(yy)
        ? "This card is expired."
        : "Enter expiry as MM/YY.",
    cvv: cvvClean.length >= 3 && cvvClean.length <= 4 ? null : "Enter the 3–4 digit CVV / CVC.",
    zip: zip.trim() ? null : "Zip / postal code is required.",
  };
  const formValid = !Object.values(fieldErrors).some(Boolean);

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([loadAcceptJs(), loadConfig()]);
        if (!cancelled) setReady(true);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || "Could not load secure payment form.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (defaultCardholderName && !cardholder) setCardholder(defaultCardholderName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCardholderName]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTouched({ cardholder: true, cardNumber: true, exp: true, cvv: true, zip: true });

    if (!formValid) {
      return setError("Please correct the highlighted fields.");
    }

    if (!window.Accept) return setError("Secure payment form isn't ready yet.");
    let cfg;
    try {
      cfg = await loadConfig();
    } catch (e: any) {
      return setError(e?.message || "Payment config unavailable.");
    }

    setTokenizing(true);
    window.Accept.dispatchData(
      {
        authData: { clientKey: cfg.clientKey, apiLoginID: cfg.apiLoginId },
        cardData: {
          cardNumber: cn,
          month: mm,
          year: yy,
          cardCode: cvvClean,
          zip: zip || undefined,
          fullName: cardholder.trim().slice(0, 64),
        },
      },
      async (response) => {
        try {
          if (response.messages.resultCode !== "Ok" || !response.opaqueData) {
            const msg = response.messages.message?.[0]?.text || "Card details were rejected.";
            if (mountedRef.current) setError(msg);
            return;
          }
          await onToken({
            opaqueData: response.opaqueData,
            cardholderName: cardholder.trim(),
          });
        } catch (e: any) {
          if (mountedRef.current) setError(e?.message || "Payment failed. Please try again.");
        } finally {
          if (mountedRef.current) setTokenizing(false);
        }
      },
    );
  };

  const busy = tokenizing || !!processing;
  const canSubmit = ready && !disabled && !busy;

  if (loadError) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
        {loadError} Please refresh and try again, or email info@mountkailashslu.com.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <Label htmlFor="an_cardholder">Cardholder Name</Label>
        <Input
          id="an_cardholder"
          autoComplete="cc-name"
          value={cardholder}
          onChange={(e) => setCardholder(e.target.value)}
          maxLength={64}
          disabled={busy}
        />
      </div>
      <div>
        <Label htmlFor="an_number">Card Number</Label>
        <Input
          id="an_number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          disabled={busy}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="an_exp">Expiry</Label>
          <Input
            id="an_exp"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={exp}
            onChange={(e) => {
              const d = digitsOnly(e.target.value).slice(0, 4);
              setExp(d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
            }}
            disabled={busy}
          />
        </div>
        <div>
          <Label htmlFor="an_cvv">CVV</Label>
          <Input
            id="an_cvv"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(digitsOnly(e.target.value).slice(0, 4))}
            maxLength={4}
            disabled={busy}
          />
        </div>
        <div>
          <Label htmlFor="an_zip">Zip / Postal</Label>
          <Input
            id="an_zip"
            autoComplete="postal-code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            maxLength={20}
            disabled={busy}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {busy ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
        ) : (
          <>{buttonLabel ?? `Pay $${amountUsd.toFixed(2)} USD`}</>
        )}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
        <Lock className="w-3 h-3" /> Secure card processing by Authorize.net
      </div>
    </form>
  );
}

export default AuthorizeNetCardForm;