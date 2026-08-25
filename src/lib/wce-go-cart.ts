/** Cart write used by the WCE direct campaign links.
 *
 *  It merges into the existing cart — an ad click never clears what a shopper
 *  already had. The same storage shape as `useCart` is used (localStorage key
 *  "cart" for guests, `cart_items` rows for signed-in shoppers) so the existing
 *  cart and checkout pick the item up with no extra plumbing.
 */
import { supabase } from "@/integrations/supabase/client";

type LocalCartItem = { productId: string; quantity: number };

export async function addProductToExistingCart(productId: string, quantity = 1) {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  if (!userId) {
    let cart: LocalCartItem[] = [];
    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) cart = parsed as LocalCartItem[];
    } catch { /* corrupt cart — start clean rather than throw */ }

    const existing = cart.find((i) => i.productId === productId);
    const next = existing
      ? cart.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i))
      : [...cart, { productId, quantity }];
    try { localStorage.setItem("cart", JSON.stringify(next)); } catch { /* ignore */ }
    return;
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({ user_id: userId, product_id: productId, quantity });
  }
}
