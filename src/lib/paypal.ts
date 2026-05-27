/**
 * PayPal configuration.
 *
 * The Client ID is a publishable identifier — it is safe to ship in client code
 * (the PayPal JS SDK exposes it in the browser anyway). The secret/private key
 * stays server-side in the edge function.
 *
 * To switch to live: replace PAYPAL_CLIENT_ID with the live Client ID and set
 * PAYPAL_ENVIRONMENT to "production".
 */
export const PAYPAL_CLIENT_ID =
  "ASJHID7rCZ0VGaeETGq5AfImd2J8j4--KdXNfpk5glkADGI2Be_SXfiWhFdqF-HhzYe0b1cCvvLQQUbx";

export const PAYPAL_ENVIRONMENT: "sandbox" | "production" = "sandbox";

export const PAYPAL_CURRENCY = "USD";