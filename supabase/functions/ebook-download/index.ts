import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Paid ebook downloads. The order id (unguessable UUID) is the access key; it is
// only ever shown on the buyer's confirmation page and in their receipt email.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// product_id -> file in the private "ebooks" bucket
const EBOOKS: Record<string, { file: string; title: string }> = {
  "d70d72e7-9542-45b7-b15c-16d68f1b5bac": {
    file: "the-new-herbal-manual.pdf",
    title: "The NEW Herbal Manual",
  },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(msg: string, status: number) {
  return new Response(
    `<!doctype html><html><body style="font-family:Georgia,serif;max-width:520px;margin:80px auto;padding:0 20px;color:#1f3a2b;text-align:center"><h2>Mount Kailash Rejuvenation Centre</h2><p>${msg}</p><p>Need help? Email <a href="mailto:info@mountkailashslu.com">info@mountkailashslu.com</a>.</p></body></html>`,
    { status, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const orderId = url.searchParams.get("order") ?? "";
  const check = url.searchParams.get("check") === "1";
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (!UUID.test(orderId)) return check ? json({ ebooks: [] }, 400) : page("This download link is not valid.", 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: order } = await supabase
    .from("orders").select("id, payment_status").eq("id", orderId).maybeSingle();
  if (!order) return check ? json({ ebooks: [] }, 404) : page("We couldn't find this order.", 404);
  if (order.payment_status !== "paid") {
    return check ? json({ ebooks: [] }) : page("Your download will be available once payment is confirmed.", 403);
  }

  const { data: items } = await supabase
    .from("order_items").select("product_id").eq("order_id", orderId);
  const owned = [...new Set((items ?? []).map((i: any) => i.product_id))].filter((id) => EBOOKS[id]);
  if (!owned.length) return check ? json({ ebooks: [] }) : page("This order doesn't include an ebook.", 404);

  if (check) return json({ ebooks: owned.map((id) => ({ product_id: id, title: EBOOKS[id].title })) });

  const wanted = url.searchParams.get("product");
  const pid = wanted && owned.includes(wanted) ? wanted : owned[0];
  const { data: signed, error } = await supabase.storage
    .from("ebooks").createSignedUrl(EBOOKS[pid].file, 60 * 60, { download: `${EBOOKS[pid].title}.pdf` });
  if (error || !signed?.signedUrl) {
    console.error("ebook sign failed", error);
    return page("The download is temporarily unavailable. Please try again shortly.", 500);
  }
  return new Response(null, { status: 302, headers: { ...corsHeaders, Location: signed.signedUrl } });
});
