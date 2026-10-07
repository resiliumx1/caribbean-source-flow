// TEMP DIAGNOSTIC — reports the real settlement status of recent Authorize.net
// transactions. Admin-only. Delete after diagnosis.
import { requireAdmin } from "../_shared/admin-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AUTHNET_ENDPOINT = "https://api.authorize.net/xml/v1/request.api";

async function authnet(body: unknown): Promise<unknown> {
  const apiLoginId = Deno.env.get("AUTHORIZENET_API_LOGIN_ID");
  const transactionKey = Deno.env.get("AUTHORIZENET_TRANSACTION_KEY");
  if (!apiLoginId || !transactionKey) throw new Error("Authorize.net credentials not configured.");
  const res = await fetch(AUTHNET_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = (await res.text()).replace(/^\uFEFF/, "").trim();
  try {
    return JSON.parse(raw);
  } catch {
    return { httpStatus: res.status, raw: raw.slice(0, 2000) };
  }
}

function auth(apiLoginId: string, transactionKey: string) {
  return { merchantAuthentication: { name: apiLoginId, transactionKey } };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    await requireAdmin(req);
    const apiLoginId = Deno.env.get("AUTHORIZENET_API_LOGIN_ID")!;
    const transactionKey = Deno.env.get("AUTHORIZENET_TRANSACTION_KEY")!;
    const base = auth(apiLoginId, transactionKey);

    // Specific transactions to inspect (recent orders passed in body, or defaults).
    let transIds: string[] = [];
    try {
      const body = await req.json();
      transIds = Array.isArray(body?.transIds) ? body.transIds.map(String) : [];
    } catch { /* no body */ }
    if (transIds.length === 0) {
      transIds = [
        "81839494774", "81828748611", "81817266358", "81812866114",
        "81810806325", "81808898250", "81803938339", "81798008794",
      ];
    }

    // 1. Merchant/account details (test mode, processor, etc.)
    const merchantDetails = await authnet({
      ...base,
      refId: "diag",
      getMerchantDetailsRequest: { refId: "diag" },
    });

    // 2. Unsettled transactions (pending capture / pending settlement)
    const unsettled = await authnet({
      ...base,
      refId: "diag",
      getUnsettledTransactionListRequest: {
        refId: "diag",
        paging: { limit: "100", offset: "1" },
        sorting: { orderBy: "submitTimeLocal", orderDescending: "true" },
      },
    });

    // 3. Settled batches for the last 30 days
    const from = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10) + "T00:00:00Z";
    const to = new Date().toISOString().slice(0, 10) + "T23:59:59Z";
    const batches = await authnet({
      ...base,
      refId: "diag",
      getSettledBatchListRequest: {
        refId: "diag",
        includeStatistics: "true",
        firstSettlementDate: from,
        lastSettlementDate: to,
      },
    });

    // 4. Per-transaction detail for the requested IDs
    const details = [];
    for (const id of transIds) {
      const d = await authnet({
        ...base,
        refId: id,
        getTransactionDetailsRequest: { refId: id, transId: id },
      });
      const tr = (d as any)?.transaction;
      details.push({
        transId: id,
        status: tr?.transactionStatus ?? null,
        responseCode: tr?.responseCode ?? null,
        amount: tr?.authAmount ?? null,
        settleAmount: tr?.settleAmount ?? null,
        submitted: tr?.submitTimeLocal ?? null,
        settleTime: tr?.settleTime ?? null,
        batchId: tr?.batch?.batchId ?? null,
        error: (d as any)?.messages?.message?.[0]?.text ?? null,
      });
    }

    const u = unsettled as any;
    const unsettledRows = Array.isArray(u?.transactions?.transaction)
      ? u.transactions.transaction.map((t: any) => ({
          transId: t.transId,
          status: t.transactionStatus,
          amount: t.authAmount,
          submitted: t.submitTimeLocal,
        }))
      : [];

    return new Response(JSON.stringify({
      messages: (merchantDetails as any)?.messages ?? null,
      merchant: {
        testMode: (merchantDetails as any)?.merchant?.isTestMode ?? null,
        processor: (merchantDetails as any)?.merchant?.processor ?? null,
        merchantId: (merchantDetails as any)?.merchant?.merchantId ?? null,
        accountStatus: (merchantDetails as any)?.merchant?.accountStatus ?? null,
        merchantRaw: (merchantDetails as any)?.merchant ?? null,
      },
      unsettledMessages: u?.messages ?? null,
      unsettledCount: unsettledRows.length,
      unsettled: unsettledRows,
      batches: batches,
      transactionDetails: details,
    }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = (err as Error).message || "Diag failed.";
    return new Response(JSON.stringify({ error: message }), {
      status: /authenticated|Admin access/i.test(message) ? 401 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
