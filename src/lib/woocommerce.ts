import { supabase } from "@/integrations/supabase/client";

export interface WooCartItem {
  product_id: string;
  quantity: number;
}

export interface WooBilling {
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface WooOrderResult {
  success: boolean;
  order_id: number;
  order_number: string;
  order_key: string;
  total: string;
  currency: string;
  payment_url: string;
  status: string;
}

/**
 * Safe client wrapper around the `woo-order` edge function.
 *
 * WooCommerce admin credentials never touch the browser — the edge function
 * holds them server-side and signs the REST request there.
 */
export async function createWooCommerceOrder(opts: {
  items: WooCartItem[];
  billing: WooBilling;
  customer_note?: string;
  return_url?: string;
  /** UTM / referral values written to the Woo order's meta_data. */
  attribution?: Record<string, string | null>;
  /** Referral or promo code; applied as a Woo coupon when one matches. */
  coupon_code?: string;
  /** WCE pathway the purchase came from. */
  pathway_key?: string;
}): Promise<WooOrderResult> {
  if (!opts.items?.length) {
    throw new Error("Your cart is empty.");
  }
  if (!opts.billing?.email) {
    throw new Error("An email address is required to place the order.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const authToken = token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/woo-order`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(opts),
    }
  );

  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(result?.error || "Unable to process checkout. Please try again or contact us.");
  }
  return result as WooOrderResult;
}

/**
 * Build the hosted WooCommerce pay-for-order URL for a freshly created order.
 * The edge function already returns a `payment_url`; prefer that. This helper
 * is exposed for parity with the requested API.
 */
export function getCheckoutRedirectUrl(orderId: number | string, orderKey: string): string {
  const base = (import.meta.env.VITE_WC_SITE_URL as string | undefined)?.replace(/\/+$/, "");
  if (!base) {
    throw new Error("Storefront URL is not configured.");
  }
  return `${base}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${orderKey}`;
}