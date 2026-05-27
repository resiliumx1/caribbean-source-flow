/**
 * PayPal configuration.
 *
 * The Client ID must be supplied via the VITE_PAYPAL_CLIENT_ID environment
 * variable. We intentionally do NOT ship a hardcoded sandbox fallback — that
 * would risk routing real customer payments to a sandbox account.
 */
const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;

if (!clientId) {
  throw new Error(
    "Missing VITE_PAYPAL_CLIENT_ID environment variable. Set it to your PayPal Client ID (sandbox or live) before running the app."
  );
}

export const PAYPAL_CLIENT_ID: string = clientId;

export const PAYPAL_CURRENCY = "USD";