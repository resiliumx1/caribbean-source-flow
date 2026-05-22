import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/woo-order`;

// Real product with a synced woo_product_id (Prosperity, qty 1).
const TEST_PRODUCT_ID = "6f647372-fa1d-41e0-90eb-b287d193e42c";

// Expected WooCommerce production host (order-pay must point here).
const EXPECTED_HOST = "mountkailashslu.com";

function buildPayload() {
  return {
    items: [{ product_id: TEST_PRODUCT_ID, quantity: 1 }],
    billing: {
      first_name: "Checkout",
      last_name: "Test",
      email: `checkout-test+${Date.now()}@mountkailashslu.com`,
      phone: "+17580000000",
      address_1: "Marc",
      city: "Castries",
      country: "LC",
    },
    customer_note: "Automated test order — woo-order payment_url verification",
    return_url: "https://mountkailashslu.com/order-success",
  };
}

Deno.test("woo-order returns a WooCommerce production order-pay URL", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(buildPayload()),
  });

  const data = await res.json();
  assertEquals(res.status, 200, `woo-order failed: ${JSON.stringify(data)}`);
  assertEquals(data.success, true);

  // Validate payload shape
  assert(typeof data.order_id === "number", "order_id should be a number");
  assert(typeof data.order_key === "string" && data.order_key.startsWith("wc_order_"), "order_key should look like wc_order_*");
  assert(typeof data.payment_url === "string", "payment_url should be a string");

  const url = new URL(data.payment_url);

  // Must hit the production WooCommerce host over HTTPS.
  assertEquals(url.protocol, "https:", "payment_url must be https");
  assertEquals(url.hostname, EXPECTED_HOST, `payment_url must point to ${EXPECTED_HOST}`);

  // Must use the canonical order-pay path with the real order id.
  assertMatch(
    url.pathname,
    new RegExp(`^/checkout/order-pay/${data.order_id}/?$`),
    "payment_url path must be /checkout/order-pay/<order_id>/",
  );

  // Must carry pay_for_order=true and the correct order_key.
  assertEquals(url.searchParams.get("pay_for_order"), "true");
  assertEquals(url.searchParams.get("key"), data.order_key);

  // Must round-trip the return_url we passed in.
  assertEquals(url.searchParams.get("return_url"), "https://mountkailashslu.com/order-success");
});

Deno.test("woo-order rejects empty cart", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ items: [], billing: { email: "x@example.com" } }),
  });
  const data = await res.json();
  assertEquals(res.status, 400);
  assertEquals(data.error, "items is required");
});

Deno.test("woo-order rejects missing billing email", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      items: [{ product_id: TEST_PRODUCT_ID, quantity: 1 }],
      billing: {},
    }),
  });
  const data = await res.json();
  assertEquals(res.status, 400);
  assertEquals(data.error, "billing.email is required");
});