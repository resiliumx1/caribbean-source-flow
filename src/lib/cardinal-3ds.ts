/**
 * Cardinal Cruise (EMV 3-D Secure / SCA) browser authentication.
 *
 * European cards require Strong Customer Authentication. Authorize.net does
 * not perform 3DS itself — it accepts the authentication result produced by
 * CardinalCommerce. This module runs the Songbird challenge flow and returns
 * the ECI / CAVV values that the charge edge functions forward to
 * Authorize.net as `cardholderAuthentication`.
 *
 * If Cardinal credentials are not configured on the backend, the JWT endpoint
 * reports `enabled: false` and we return `{ status: "disabled" }` so payments
 * continue to work exactly as before.
 */

import { supabase } from "@/integrations/supabase/client";

const SONGBIRD_URLS = {
  sandbox: "https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js",
  production: "https://songbird.cardinalcommerce.com/edge/v1/songbird.js",
} as const;

type CardinalEnv = keyof typeof SONGBIRD_URLS;

interface CardinalGlobal {
  configure(config: Record<string, unknown>): void;
  setup(stage: string, options: Record<string, unknown>): void;
  on(event: string, cb: (...args: any[]) => void): void;
  off(event: string): void;
  trigger(event: string, data?: unknown): void;
  start(name: string, order: Record<string, unknown>): void;
  continue(name: string, payload: unknown, order?: unknown): void;
}

declare global {
  interface Window {
    Cardinal?: CardinalGlobal;
  }
}

export interface ThreeDSResult {
  eci?: string;
  cavv?: string;
  dsTransactionId?: string;
  version?: string;
  actionCode?: string;
}

export type ThreeDSOutcome =
  | { status: "disabled" }
  | { status: "ok"; result: ThreeDSResult }
  | { status: "failed"; message: string };

let scriptPromise: Promise<void> | null = null;
function loadSongbird(env: CardinalEnv): Promise<void> {
  if (window.Cardinal) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SONGBIRD_URLS[env];
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load the 3-D Secure security check."));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

interface JwtResponse {
  enabled?: boolean;
  jwt?: string;
  orgUnitId?: string;
  environment?: CardinalEnv;
  referenceId?: string;
  error?: string;
}

async function fetchJwt(amount: number, referenceId?: string): Promise<JwtResponse> {
  const { data, error } = await supabase.functions.invoke("cardinal-jwt", {
    body: { amount, currency: "USD", referenceId },
  });
  if (error) throw new Error(error.message || "3-D Secure setup failed.");
  return (data ?? {}) as JwtResponse;
}

/** Wait for Songbird setup to complete (or time out). */
function waitForSetup(timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    const cardinal = window.Cardinal!;
    const timer = window.setTimeout(() => {
      reject(new Error("3-D Secure timed out. Please try again."));
    }, timeoutMs);
    cardinal.on("payments.setupComplete", () => {
      window.clearTimeout(timer);
      cardinal.off("payments.setupComplete");
      resolve();
    });
  });
}

export interface AuthenticateArgs {
  amountUsd: number;
  cardNumber: string;   // digits only
  month: string;        // MM
  year: string;         // YY
  cvv: string;
  cardholderName?: string;
  email?: string;
  billingZip?: string;
  referenceId?: string;
}

/**
 * Run the 3DS authentication. Resolves with the ECI/CAVV values on success,
 * `disabled` when Cardinal is not configured, or `failed` with a customer
 * message when the issuer rejects the authentication.
 */
export async function authenticateCard(args: AuthenticateArgs): Promise<ThreeDSOutcome> {
  let cfg: JwtResponse;
  try {
    cfg = await fetchJwt(args.amountUsd, args.referenceId);
  } catch {
    // The JWT endpoint always answers (with `enabled:false` when Cardinal is
    // not configured), so a hard error means we cannot prove authentication
    // happened. SCA is mandatory in Europe, so fail closed.
    return {
      status: "failed",
      message: "We couldn't run the bank security check right now. Please try again in a moment.",
    };
  }
  if (!cfg.enabled || !cfg.jwt) return { status: "disabled" };

  const env: CardinalEnv = cfg.environment === "production" ? "production" : "sandbox";
  try {
    await loadSongbird(env);
  } catch {
    return {
      status: "failed",
      message: "The bank security check (3-D Secure) could not be loaded. Please try again.",
    };
  }
  const cardinal = window.Cardinal;
  if (!cardinal) {
    return {
      status: "failed",
      message: "The bank security check (3-D Secure) is unavailable. Please try again.",
    };
  }

  cardinal.configure({ logging: { level: "off" } });

  try {
    const setup = waitForSetup();
    cardinal.setup("init", { jwt: cfg.jwt });
    await setup;
  } catch (e: any) {
    return {
      status: "failed",
      message: e?.message || "The bank security check timed out. Please try again.",
    };
  }

  // Give Cardinal the BIN so it can pre-warm the correct directory server.
  try {
    cardinal.trigger("bin.process", args.cardNumber.slice(0, 6));
  } catch { /* non-fatal */ }

  return await new Promise<ThreeDSOutcome>((resolve) => {
    const timer = window.setTimeout(() => {
      cardinal.off("payments.validated");
      resolve({ status: "failed", message: "The 3-D Secure check timed out. Please try again." });
    }, 5 * 60 * 1000);

    cardinal.on("payments.validated", (data: any) => {
      window.clearTimeout(timer);
      cardinal.off("payments.validated");
      const action = String(data?.ActionCode ?? "");
      const ext = data?.Payment?.ExtendedData ?? {};
      if (action === "SUCCESS" || action === "NOACTION") {
        resolve({
          status: "ok",
          result: {
            eci: ext?.ECIFlag ? String(ext.ECIFlag) : undefined,
            cavv: ext?.CAVV ? String(ext.CAVV) : undefined,
            dsTransactionId: ext?.DSTransactionId ? String(ext.DSTransactionId) : undefined,
            version: ext?.ThreeDSVersion ? String(ext.ThreeDSVersion) : undefined,
            actionCode: action,
          },
        });
        return;
      }
      resolve({
        status: "failed",
        message:
          action === "FAILURE"
            ? "Your bank could not verify this card (3-D Secure). Please try another card or contact your bank."
            : "The 3-D Secure verification could not be completed. Please try again.",
      });
    });

    cardinal.start("cmpi_lookup", {
      OrderDetails: {
        Amount: Math.round(args.amountUsd * 100),
        CurrencyCode: "USD",
        OrderNumber: cfg.referenceId,
      },
      Consumer: {
        Email1: args.email,
        BillingAddress: args.billingZip ? { PostalCode: args.billingZip } : undefined,
        Account: {
          AccountNumber: args.cardNumber,
          ExpirationMonth: args.month,
          ExpirationYear: args.year.length === 2 ? `20${args.year}` : args.year,
          CardCode: args.cvv,
          NameOnAccount: args.cardholderName,
        },
      },
    });
  });
}
