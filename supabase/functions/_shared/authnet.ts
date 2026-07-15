// Shared Authorize.net (Accept.js) charge helper.
// Uses production endpoint. Never trust client-supplied amount — callers must
// pass the server-computed amount.

const AUTHNET_ENDPOINT = "https://api.authorize.net/xml/v1/request.api";

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
      transactionRequest: {
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
        billTo: args.billTo,
        customer: args.customerEmail ? { email: args.customerEmail.slice(0, 255) } : undefined,
      },
    },
  };

  const res = await fetch(AUTHNET_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Authorize.net returns a UTF-8 BOM before JSON — strip it before parsing.
  const raw = (await res.text()).replace(/^\uFEFF/, "").trim();
  let json: any;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`Authorize.net returned invalid response (${res.status}).`);
  }

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