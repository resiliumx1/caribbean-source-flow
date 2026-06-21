// Server-side PayPal capture verification.
// Fetches the order from PayPal's REST API using the project's PAYPAL_CLIENT_SECRET
// and confirms that the capture actually completed for the expected USD amount.
// Never trust a client-supplied paypal_capture_id without calling this.

const PAYPAL_BASE = "https://api-m.paypal.com";
const PAYPAL_CLIENT_ID =
  "ARA5I0pb-Sr8CDj3wiliKf-qILV9wMuX0YRNaBFbBsVld88v2CWs2ILHegOPuLfizo2G-czuNEyHje0L";

export interface VerifyArgs {
  paypal_order_id: string;
  paypal_capture_id: string;
  expected_usd: number;
  tolerance?: number;
}

export async function verifyPaypalCapture(args: VerifyArgs): Promise<void> {
  const tol = args.tolerance ?? 0.05;
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!secret) throw new Error("PAYPAL_CLIENT_SECRET is not configured.");
  if (!args.paypal_order_id) throw new Error("paypal_order_id is required.");
  if (!args.paypal_capture_id) throw new Error("paypal_capture_id is required.");

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${secret}`);
  const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!tokenRes.ok) {
    throw new Error(`PayPal auth failed (${tokenRes.status}).`);
  }
  const { access_token } = await tokenRes.json();

  const orderRes = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${args.paypal_order_id}`,
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  if (!orderRes.ok) {
    throw new Error(`PayPal order lookup failed (${orderRes.status}).`);
  }
  const order = await orderRes.json();

  if (order?.status !== "COMPLETED") {
    throw new Error(`PayPal order status is ${order?.status ?? "unknown"}, expected COMPLETED.`);
  }

  const captures = (order?.purchase_units ?? [])
    .flatMap((pu: any) => pu?.payments?.captures ?? []);
  const match = captures.find((c: any) => c?.id === args.paypal_capture_id);
  if (!match) {
    throw new Error("PayPal capture id not found on this order.");
  }
  if (match.status !== "COMPLETED") {
    throw new Error(`PayPal capture status is ${match.status}, expected COMPLETED.`);
  }
  if ((match.amount?.currency_code ?? "USD") !== "USD") {
    throw new Error(`Unexpected capture currency ${match.amount?.currency_code}.`);
  }
  const capturedUsd = Number(match.amount?.value ?? 0);
  if (!Number.isFinite(capturedUsd) || Math.abs(capturedUsd - args.expected_usd) > tol) {
    throw new Error(
      `PayPal capture amount mismatch (got ${capturedUsd}, expected ${args.expected_usd}).`,
    );
  }
}