// PowerTranz STAGING sale — admin-only certification tool.
// Never logs or stores full PAN or CVV.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { requireAdmin, serviceClient } from "../_shared/admin-auth.ts";

const STAGING_HOST = "staging.ptranz.com";

const CURRENCY_NUMERIC: Record<string, string> = { USD: "840", XCD: "951", TTD: "780", JMD: "388", BBD: "052" };

const Body = z.object({
  amount: z.number().positive().max(1000),
  currency: z.string().length(3).default("USD"),
  orderId: z.string().min(1).max(60).regex(/^[A-Za-z0-9\-_]+$/),
  cardNumber: z.string().regex(/^[0-9]{12,19}$/),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
  expiryYear: z.string().regex(/^[0-9]{2}$/),
  cvv: z.string().regex(/^[0-9]{3,4}$/),
  cardholderName: z.string().min(1).max(60),
  billing: z.object({
    firstName: z.string().max(60).optional(),
    lastName: z.string().max(60).optional(),
    line1: z.string().max(100).optional(),
    city: z.string().max(60).optional(),
    state: z.string().max(60).optional(),
    postalCode: z.string().max(20).optional(),
    countryCode: z.string().max(3).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(30).optional(),
  }).default({}),
});

function brand(pan: string) {
  if (/^4/.test(pan)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(pan)) return "Mastercard";
  if (/^3[47]/.test(pan)) return "Amex";
  return "Other";
}

// Diagnostic payloads must never carry card data: mask long digit runs and
// drop any key that looks like a PAN / CVV / credential.
function sanitize(v: unknown): unknown {
  if (typeof v === "string") return v.replace(/\d[\d\s-]{9,24}\d/g, "****");
  if (typeof v === "number") return v;
  if (Array.isArray(v)) return v.map(sanitize);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (/pan|cvv|cvc|cvv2|password|securitycode|track/i.test(k)) { o[k] = "****"; continue; }
      o[k] = sanitize(val);
    }
    return o;
  }
  return v;
}

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let admin;
  try { admin = await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, 401); }

  // Trimmed: values pasted from a secure message often carry a stray space or
  // newline, which PowerTranz reports as "Invalid merchant".
  const id = (Deno.env.get("POWERTRANZ_ID") ?? "").trim();
  const pw = (Deno.env.get("POWERTRANZ_PASSWORD") ?? "").trim();
  const base = (Deno.env.get("POWERTRANZ_BASE_URL") ?? "").trim();
  const gw = (Deno.env.get("POWERTRANZ_GATEWAY_KEY") ?? "").trim();
  if (!id || !pw || !base) return json({ error: "PowerTranz secrets are not configured." }, 500);
  let host = "";
  try { const u = new URL(base); host = u.hostname; if (u.protocol !== "https:") host = ""; } catch { /* */ }
  if (host !== STAGING_HOST) return json({ error: "Refusing to run: POWERTRANZ_BASE_URL must point at the staging host." }, 400);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid input", fields: Object.keys(parsed.error.flatten().fieldErrors) }, 400);
  const d = parsed.data;
  const currency = CURRENCY_NUMERIC[d.currency.toUpperCase()];
  if (!currency) return json({ error: "Unsupported currency" }, 400);

  const txnId = crypto.randomUUID();
  const payload = {
    TransactionIdentifier: txnId,
    TotalAmount: Math.round(d.amount * 100) / 100,
    CurrencyCode: currency,
    ThreeDSecure: false,
    Source: {
      CardPan: d.cardNumber,
      CardCvv: d.cvv,
      CardExpiration: `${d.expiryYear}${d.expiryMonth}`, // YYMM
      CardholderName: d.cardholderName,
    },
    OrderIdentifier: d.orderId,
    BillingAddress: {
      FirstName: d.billing.firstName, LastName: d.billing.lastName, Line1: d.billing.line1,
      City: d.billing.city, State: d.billing.state, PostalCode: d.billing.postalCode,
      CountryCode: d.billing.countryCode, EmailAddress: d.billing.email, PhoneNumber: d.billing.phone,
    },
    AddressMatch: false,
  };

  const cardBrand = brand(d.cardNumber);
  const last4 = d.cardNumber.slice(-4);
  let result: Record<string, unknown> = {};
  let raw: unknown = null;
  let httpStatus = 0;
  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/Api/Sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "PowerTranz-PowerTranzId": id,
        "PowerTranz-PowerTranzPassword": pw,
        // Only sent when PowerTranz has actually issued one.
        ...(gw ? { "PowerTranz-GatewayKey": gw } : {}),
      },
      body: JSON.stringify(payload),
    });
    httpStatus = res.status;
    const text = await res.text();
    try { result = JSON.parse(text) as Record<string, unknown>; } catch { result = {}; }
    raw = sanitize(result && Object.keys(result).length ? result : text);
  } catch (_e) {
    return json({ error: "Could not reach PowerTranz staging." }, 502);
  }

  const errs = Array.isArray(result.Errors) ? (result.Errors as { Message?: string }[]).map((e) => e.Message).join("; ") : "";
  const out = {
    orderId: d.orderId,
    cardBrand,
    last4,
    approved: result.Approved === true,
    isoResponseCode: (result.IsoResponseCode as string) ?? null,
    responseMessage: (result.ResponseMessage as string) || errs || (httpStatus >= 400 ? `HTTP ${httpStatus}` : null),
    transactionIdentifier: (result.TransactionIdentifier as string) ?? txnId,
    authorizationCode: (result.AuthorizationCode as string) ?? null,
    rrn: (result.RRN as string) ?? null,
    httpStatus,
    // Fingerprint only — lets you confirm the saved values match what PowerTranz
    // issued without exposing the password.
    merchantIdMasked: id.length > 5 ? `${id.slice(0, 3)}${"*".repeat(id.length - 5)}${id.slice(-2)}` : "****",
    merchantIdLength: id.length,
    passwordLength: pw.length,
    gatewayKeySent: Boolean(gw),
    endpoint: `${base.replace(/\/+$/, "")}/Api/Sale`,
    raw,
  };

  console.log("powertranz-sale", { orderId: out.orderId, brand: cardBrand, last4, approved: out.approved, iso: out.isoResponseCode });

  await serviceClient().from("powertranz_test_log").insert({
    order_id: out.orderId, card_brand: cardBrand, card_last4: last4, approved: out.approved,
    iso_response_code: out.isoResponseCode, response_message: out.responseMessage,
    transaction_identifier: out.transactionIdentifier, amount: payload.TotalAmount,
    currency: d.currency.toUpperCase(), created_by: admin.id,
  });

  return json(out);
});
