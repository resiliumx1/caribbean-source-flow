// Shared Authorize.net (Accept.js) charge helper.
// Uses production endpoint. Never trust client-supplied amount — callers must
// pass the server-computed amount.

const AUTHNET_ENDPOINT = "https://api.authorize.net/xml/v1/request.api";

// Authorize.net XSD element ordering (subset we use). Anything sent to the API
// MUST follow this exact sequence or the request is rejected with an
// "invalid child element" error.
const TX_REQUEST_ORDER = [
  "transactionType",
  "amount",
  "currencyCode",
  "payment",
  "profile",
  "solution",
  "callId",
  "terminalNumber",
  "authCode",
  "refTransId",
  "splitTenderId",
  "order",
  "lineItems",
  "tax",
  "duty",
  "shipping",
  "taxExempt",
  "poNumber",
  "customer",
  "billTo",
  "shipTo",
  "customerIP",
  "cardholderAuthentication",
  "retail",
  "employeeId",
  "transactionSettings",
  "userFields",
  "surcharge",
  "merchantDescriptor",
  "subMerchant",
  "tip",
  "processingOptions",
  "subsequentAuthInformation",
  "otherTax",
  "shipFrom",
  "authorizationIndicatorType",
] as const;

const BILL_TO_ORDER = [
  "firstName", "lastName", "company",
  "address", "city", "state", "zip", "country",
  "phoneNumber", "faxNumber",
] as const;

/**
 * Validate that keys in `obj` appear in the same order the XSD expects.
 * Throws with a descriptive message before we ever hit the wire.
 */
export function validateOrder(
  obj: Record<string, unknown>,
  order: readonly string[],
  path: string,
): void {
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined);
  let cursor = -1;
  for (const k of keys) {
    const idx = order.indexOf(k);
    if (idx === -1) {
      throw new Error(`[authnet payload] Unknown field '${k}' in ${path}`);
    }
    if (idx <= cursor) {
      const prev = order[cursor];
      throw new Error(
        `[authnet payload] Field '${k}' in ${path} must appear before '${prev}' per Authorize.net XSD`,
      );
    }
    cursor = idx;
  }
}

/** Reorder object keys to match the canonical XSD sequence. */
function orderedObject<T extends Record<string, unknown>>(
  obj: T,
  order: readonly string[],
): T {
  const out: Record<string, unknown> = {};
  for (const k of order) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out as T;
}

/** Sleep with jitter. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** True for network / 5xx / transient Authorize.net error codes worth retrying. */
function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}
function isRetryableAuthnetError(json: any): boolean {
  // E00001 = generic system error, I00003 = successful (not retry).
  const codes: string[] = [];
  const msgs = json?.messages?.message;
  if (Array.isArray(msgs)) for (const m of msgs) codes.push(String(m?.code ?? ""));
  const errs = json?.transactionResponse?.errors;
  if (Array.isArray(errs)) for (const e of errs) codes.push(String(e?.errorCode ?? ""));
  // Transient: system error, temporarily unable to process, gateway timeout.
  return codes.some((c) => ["E00001", "E00104", "E00108"].includes(c));
}

/**
 * POST to Authorize.net with exponential backoff (up to 3 attempts).
 * Retries network failures, 5xx/429 responses, and transient Authorize.net
 * system errors. Declines and validation errors are NOT retried.
 */
async function postWithRetry(body: string, maxAttempts = 3): Promise<any> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(AUTHNET_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const raw = (await res.text()).replace(/^\uFEFF/, "").trim();

      if (!res.ok) {
        if (isRetryableStatus(res.status) && attempt < maxAttempts) {
          await sleep(250 * 2 ** (attempt - 1) + Math.random() * 150);
          continue;
        }
        throw new Error(`Authorize.net HTTP ${res.status}`);
      }

      let json: any;
      try { json = JSON.parse(raw); } catch {
        throw new Error(`Authorize.net returned invalid response (${res.status}).`);
      }

      if (isRetryableAuthnetError(json) && attempt < maxAttempts) {
        await sleep(250 * 2 ** (attempt - 1) + Math.random() * 150);
        continue;
      }
      return json;
    } catch (err) {
      lastErr = err;
      // Only retry on network-level failures (TypeError from fetch).
      if (attempt < maxAttempts && err instanceof TypeError) {
        await sleep(250 * 2 ** (attempt - 1) + Math.random() * 150);
        continue;
      }
      throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Authorize.net request failed");
}

export interface OpaqueData {
  dataDescriptor: string;
  dataValue: string;
}

export interface BillTo {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phoneNumber?: string;
}

export interface ChargeArgs {
  amount: number;                 // USD
  opaqueData: OpaqueData;
  invoiceNumber?: string;         // <=20 chars
  description?: string;           // <=255 chars
  billTo?: BillTo;
  customerEmail?: string;
  refId?: string;
}

export interface ChargeResult {
  transId: string;
  authCode: string;
  accountNumber: string;          // masked, e.g. XXXX1111
  accountType: string;            // Visa/Mastercard/…
}

export async function chargeCard(args: ChargeArgs): Promise<ChargeResult> {
  const apiLoginId = Deno.env.get("AUTHORIZENET_API_LOGIN_ID");
  const transactionKey = Deno.env.get("AUTHORIZENET_TRANSACTION_KEY");
  if (!apiLoginId || !transactionKey) {
    throw new Error("Authorize.net credentials are not configured.");
  }
  if (!args.opaqueData?.dataDescriptor || !args.opaqueData?.dataValue) {
    throw new Error("Missing payment token (opaqueData).");
  }
  const amount = Number(args.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid charge amount.");
  }

  const body = {
    createTransactionRequest: {
      merchantAuthentication: { name: apiLoginId, transactionKey },
      refId: args.refId?.slice(0, 20),
      transactionRequest: buildTransactionRequest(args, amount),
    },
  };

  const json = await postWithRetry(JSON.stringify(body));

  const tr = json?.transactionResponse;
  const topOk = json?.messages?.resultCode === "Ok";
  const approved = tr?.responseCode === "1";

  if (!approved) {
    const errMsg =
      tr?.errors?.[0]?.errorText ||
      json?.messages?.message?.[0]?.text ||
      "Payment was declined.";
    throw new Error(errMsg);
  }
  if (!topOk && !tr?.transId) {
    throw new Error("Payment did not complete.");
  }

  return {
    transId: String(tr.transId),
    authCode: String(tr.authCode ?? ""),
    accountNumber: String(tr.accountNumber ?? ""),
    accountType: String(tr.accountType ?? ""),
  };
}

/**
 * Build the transactionRequest object with XSD-correct key ordering, then
 * validate the resulting shape. Throws early if anything is out of place.
 */
function buildTransactionRequest(args: ChargeArgs, amount: number) {
  const billToRaw = args.billTo
    ? orderedObject({ ...args.billTo } as Record<string, unknown>, BILL_TO_ORDER)
    : undefined;
  if (billToRaw) validateOrder(billToRaw, BILL_TO_ORDER, "billTo");

  const tr = orderedObject({
    transactionType: "authCaptureTransaction",
    amount: amount.toFixed(2),
    currencyCode: "USD",
    payment: { opaqueData: args.opaqueData },
    order: args.invoiceNumber || args.description
      ? {
          invoiceNumber: args.invoiceNumber?.slice(0, 20),
          description: args.description?.slice(0, 255),
        }
      : undefined,
    customer: args.customerEmail
      ? { email: args.customerEmail.slice(0, 255) }
      : undefined,
    billTo: billToRaw,
  } as Record<string, unknown>, TX_REQUEST_ORDER);

  validateOrder(tr, TX_REQUEST_ORDER, "transactionRequest");
  return tr;
}

/** Split a full name into firstName / lastName for Authorize.net billTo. */
export function splitName(full: string | undefined | null): { firstName: string; lastName: string } {
  const s = (full ?? "").trim();
  if (!s) return { firstName: "Customer", lastName: "" };
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0].slice(0, 50), lastName: "" };
  return {
    firstName: parts[0].slice(0, 50),
    lastName: parts.slice(1).join(" ").slice(0, 50),
  };
}