// Server-side cart pricing shared by the PayPal functions.
// Mirrors authnet-charge: authoritative prices from the DB, shipping rules,
// and coupon re-validation. Never trust client-supplied prices.

export interface CartLine {
  product_id: string;
  quantity: number;
}

export type DeliveryType = "local" | "international" | "pickup";

export const EXCHANGE = 2.7;

export async function priceCart(
  supabase: any,
  items: CartLine[],
  deliveryType: DeliveryType,
  couponCode?: string,
) {
  if (!items?.length) throw new Error("Cart is empty.");

  const productIds = [...new Set(items.map((i) => i.product_id))];
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, price_usd, price_xcd, is_digital, category_id, track_inventory, stock_quantity, is_active")
    .in("id", productIds);
  if (prodErr) throw prodErr;
  if (!products || products.length !== productIds.length) {
    throw new Error("One or more cart items are no longer available.");
  }
  const withdrawn = products.find((p: any) => p.is_active === false);
  if (withdrawn) throw new Error(`${withdrawn.name} is no longer available for purchase.`);

  const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));

  let subtotal_usd = 0;
  let subtotal_xcd = 0;
  let hasPhysical = false;
  const itemRows = items.map((line) => {
    const p = productMap.get(line.product_id);
    if (!p) throw new Error(`Product not found: ${line.product_id}`);
    const qty = Math.max(1, Math.floor(line.quantity));
    if (p.track_inventory && Number(p.stock_quantity) < qty) {
      throw new Error(
        `${p.name} only has ${Math.max(0, Number(p.stock_quantity))} left in stock. Please adjust your cart.`,
      );
    }
    subtotal_usd += Number(p.price_usd) * qty;
    subtotal_xcd += Number(p.price_xcd) * qty;
    if (!p.is_digital) hasPhysical = true;
    return {
      product_id: p.id as string,
      product_name: p.name as string,
      quantity: qty,
      price_usd: Number(p.price_usd),
      price_xcd: Number(p.price_xcd),
    };
  });

  let shipping_usd = 0;
  let shipping_xcd = 0;
  if (hasPhysical) {
    if (deliveryType === "local") {
      shipping_xcd = 30;
      shipping_usd = +(30 / EXCHANGE).toFixed(2);
    } else if (deliveryType === "international") {
      shipping_usd = 30;
      shipping_xcd = +(30 * EXCHANGE).toFixed(2);
    }
  }

  let discount_usd = 0;
  let appliedCoupon: any = null;
  const code = (couponCode || "").trim().toUpperCase();
  if (code) {
    const { data: coupon } = await supabase
      .from("coupons").select("*").ilike("code", code).maybeSingle();
    const now = Date.now();
    const valid =
      coupon &&
      coupon.is_active &&
      (!coupon.starts_at || new Date(coupon.starts_at).getTime() <= now) &&
      (!coupon.expires_at || new Date(coupon.expires_at).getTime() >= now) &&
      (!coupon.max_uses || Number(coupon.used_count) < Number(coupon.max_uses)) &&
      subtotal_usd >= Number(coupon.min_order_usd ?? 0);
    if (!valid) throw new Error("That discount code is not valid for this order.");

    const scoped: string[] = (coupon.product_ids ?? []).length || (coupon.category_ids ?? []).length
      ? itemRows
          .filter((r) => {
            const p = productMap.get(r.product_id);
            return (coupon.product_ids ?? []).includes(p.id) ||
              (coupon.category_ids ?? []).includes(p.category_id);
          })
          .map((r) => r.product_id)
      : itemRows.map((r) => r.product_id);

    const eligibleSubtotal = itemRows
      .filter((r) => scoped.includes(r.product_id))
      .reduce((s, r) => s + r.price_usd * r.quantity, 0);
    if (eligibleSubtotal <= 0) throw new Error("That discount code doesn't apply to the items in your cart.");

    discount_usd = coupon.discount_type === "percent"
      ? +(eligibleSubtotal * (Number(coupon.discount_value) / 100)).toFixed(2)
      : Math.min(Number(coupon.discount_value), eligibleSubtotal);
    discount_usd = Math.min(discount_usd, subtotal_usd);
    appliedCoupon = coupon;
  }

  const total_usd = +(subtotal_usd - discount_usd + shipping_usd).toFixed(2);
  const total_xcd = +((subtotal_xcd - discount_usd * EXCHANGE) + shipping_xcd).toFixed(2);
  if (total_usd <= 0) throw new Error("Order total must be greater than zero.");

  return {
    productMap,
    itemRows,
    hasPhysical,
    subtotal_usd,
    subtotal_xcd,
    shipping_usd,
    shipping_xcd,
    discount_usd,
    appliedCoupon,
    total_usd,
    total_xcd,
  };
}
