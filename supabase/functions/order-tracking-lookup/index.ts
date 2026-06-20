import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { lookupOrder } from "../_shared/order-lookup.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limit: 20 lookups per IP per hour
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 20;
const rateStore = new Map<string, { count: number; start: number }>();

function checkRate(key: string): boolean {
  const now = Date.now();
  const e = rateStore.get(key);
  if (!e || now - e.start > RATE_WINDOW_MS) {
    rateStore.set(key, { count: 1, start: now });
    return true;
  }
  if (e.count >= RATE_MAX) return false;
  e.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRate(ip)) {
      return new Response(
        JSON.stringify({ found: false, message: "Too many lookups — please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => null);
    const query = body?.query;
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ found: false, message: "Missing query." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = await lookupOrder(query);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("order-tracking-lookup error:", err);
    return new Response(
      JSON.stringify({ found: false, message: "Something went wrong looking up that order." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});