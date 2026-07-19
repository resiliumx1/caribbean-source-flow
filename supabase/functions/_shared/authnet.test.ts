// Deno tests for USD charge amount formatting and rounding across all three
// checkout flows (shop, retreat, payment plan). Global fetch is stubbed so no
// real Authorize.net request is made — we only inspect the amount string that
// would go on the wire.

import {
  assert,
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { chargeCard, type OpaqueData } from "./authnet.ts";

Deno.env.set("AUTHORIZENET_API_LOGIN_ID", "test-login");
Deno.env.set("AUTHORIZENET_TRANSACTION_KEY", "test-key");

const OPAQUE: OpaqueData = {
  dataDescriptor: "COMMON.ACCEPT.INAPP.PAYMENT",
  dataValue: "test-token",
};

interface CapturedRequest {
  amount: string;
  currencyCode: string;
  body: any;
}

function stubFetch(): { captured: CapturedRequest[]; restore: () => void } {
  const captured: CapturedRequest[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}"));
    const tr = body?.createTransactionRequest?.transactionRequest ?? {};
    captured.push({
      amount: String(tr.amount),
      currencyCode: String(tr.currencyCode),
      body,
    });
    return new Response(
      JSON.stringify({
        messages: { resultCode: "Ok", message: [{ code: "I00001", text: "Successful." }] },
        transactionResponse: {
          responseCode: "1",
          transId: "TEST-TRANS-1",
          authCode: "ABC123",
          accountNumber: "XXXX1111",
          accountType: "Visa",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  return { captured, restore: () => { globalThis.fetch = original; } };
}

async function chargeAndCapture(amount: number): Promise<CapturedRequest> {
  const { captured, restore } = stubFetch();
  try {
    await chargeCard({ amount, opaqueData: OPAQUE });
  } finally {
    restore();
  }
  assertEquals(captured.length, 1);
  return captured[0];
}

// ---------- Shared: chargeCard amount formatting ----------

Deno.test("chargeCard sends amount as USD string with exactly 2 decimals", async () => {
  const cases: Array<[number, string]> = [
    [1, "1.00"],
    [12.5, "12.50"],
    [25, "25.00"],
    [0.1 + 0.2, "0.30"],
    [4500, "4500.00"],
    [5680.005, "5680.01"],
    [33.333, "33.33"],
    [33.336, "33.34"],
    [99.999, "100.00"],
  ];
  for (const [input, expected] of cases) {
    const req = await chargeAndCapture(input);
    assertEquals(req.amount, expected, `amount for ${input} should be "${expected}"`);
    assertEquals(req.currencyCode, "USD");
  }
});

Deno.test("chargeCard rejects non-finite or non-positive amounts", async () => {
  for (const bad of [0, -1, NaN, Infinity]) {
    await assertRejects(
      () => chargeCard({ amount: bad, opaqueData: OPAQUE }),
      Error,
      "Invalid charge amount",
    );
  }
});

// ---------- Flow 1: Shop checkout (authnet-charge) ----------

const EXCHANGE = 2.7;
function shopTotalUsd(
  lines: Array<{ price_usd: number; quantity: number }>,
  hasPhysical: boolean,
  deliveryType: "local" | "international" | "pickup",
): number {
  const subtotal = lines.reduce((s, l) => s + l.price_usd * l.quantity, 0);
  let shipping = 0;
  if (hasPhysical) {
    if (deliveryType === "local") shipping = +(30 / EXCHANGE).toFixed(2);
    else if (deliveryType === "international") shipping = 30;
  }
  return +(subtotal + shipping).toFixed(2);
}

Deno.test("shop checkout: local shipping USD conversion rounds to 11.11", () => {
  assertEquals(+(30 / EXCHANGE).toFixed(2), 11.11);
  assertEquals(shopTotalUsd([{ price_usd: 25, quantity: 1 }], true, "local"), 36.11);
});

Deno.test("shop checkout: totals with awkward decimals round to 2dp before charge", async () => {
  const total = shopTotalUsd([{ price_usd: 12.5, quantity: 3 }], true, "local");
  assertEquals(total, 48.61);
  const req = await chargeAndCapture(total);
  assertEquals(req.amount, "48.61");
});

Deno.test("shop checkout: digital-only and pickup carts skip shipping", async () => {
  const digital = shopTotalUsd([{ price_usd: 25, quantity: 2 }], false, "international");
  assertEquals(digital, 50);
  const pickup = shopTotalUsd([{ price_usd: 12.5, quantity: 1 }], true, "pickup");
  assertEquals(pickup, 12.5);
  const req = await chargeAndCapture(pickup);
  assertEquals(req.amount, "12.50");
});

Deno.test("shop checkout: international shipping is a flat $30 USD", async () => {
  const total = shopTotalUsd([{ price_usd: 44.99, quantity: 1 }], true, "international");
  assertEquals(total, 74.99);
  const req = await chargeAndCapture(total);
  assertEquals(req.amount, "74.99");
});

// ---------- Flow 2: Retreat checkout (authnet-retreat-charge) ----------

function retreatCharge(total_usd: number, option: "full" | "deposit") {
  const amount_paid = option === "deposit"
    ? +(total_usd / 2).toFixed(2)
    : +total_usd.toFixed(2);
  const balance_due = +(total_usd - amount_paid).toFixed(2);
  return { amount_paid, balance_due };
}

Deno.test("retreat: full payment charges the exact total", async () => {
  const { amount_paid, balance_due } = retreatCharge(4500, "full");
  assertEquals(amount_paid, 4500);
  assertEquals(balance_due, 0);
  const req = await chargeAndCapture(amount_paid);
  assertEquals(req.amount, "4500.00");
});

Deno.test("retreat: 50% deposit on odd totals rounds half-up to cents", async () => {
  const a = retreatCharge(5500, "deposit");
  assertEquals(a.amount_paid, 2750);
  assertEquals(a.balance_due, 2750);

  const b = retreatCharge(4501, "deposit");
  assertEquals(b.amount_paid, 2250.5);
  assertEquals(b.balance_due, 2250.5);
  const reqB = await chargeAndCapture(b.amount_paid);
  assertEquals(reqB.amount, "2250.50");

  const c = retreatCharge(4501.01, "deposit");
  assertEquals(c.amount_paid, 2250.51);
  assertEquals(c.balance_due, 2250.5);
  const reqC = await chargeAndCapture(c.amount_paid);
  assertEquals(reqC.amount, "2250.51");
});

Deno.test("retreat: per-person totals with fractional nightly rates round cleanly", async () => {
  const total = +(333.33 * 3 * 2).toFixed(2);
  assertEquals(total, 1999.98);
  const { amount_paid } = retreatCharge(total, "full");
  const req = await chargeAndCapture(amount_paid);
  assertEquals(req.amount, "1999.98");
});

// ---------- Flow 3: Payment plan (authnet-plan-charge) ----------

function planAmount(requested: number, remaining: number): number {
  return +Math.min(requested, remaining).toFixed(2);
}

Deno.test("payment plan: charged amount is capped at remaining balance", async () => {
  const amt = planAmount(500, 42.5);
  assertEquals(amt, 42.5);
  const req = await chargeAndCapture(amt);
  assertEquals(req.amount, "42.50");
});

Deno.test("payment plan: fractional requested amounts round to 2dp", async () => {
  const amt = planAmount(80.005, 5680);
  assertEquals(amt, 80.01);
  const req = await chargeAndCapture(amt);
  assertEquals(req.amount, "80.01");
});

Deno.test("payment plan: paying off exact remainder charges to the penny", async () => {
  const first = planAmount(80, 5680);
  assertEquals(first, 80);
  const reqA = await chargeAndCapture(first);
  assertEquals(reqA.amount, "80.00");

  const payoff = planAmount(5520, 5520);
  assertEquals(payoff, 5520);
  const reqB = await chargeAndCapture(payoff);
  assertEquals(reqB.amount, "5520.00");
});

Deno.test("payment plan: floating-point sums like 0.1+0.2 normalize to 0.30", async () => {
  const amt = planAmount(0.1 + 0.2, 100);
  const req = await chargeAndCapture(amt);
  assertEquals(req.amount, "0.30");
  assert(Math.abs(amt - 0.3) < 0.01);
});
