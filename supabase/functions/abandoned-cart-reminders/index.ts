import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getRecoverySettings,
  logCartEvent,
  renderTemplate,
  syncCartToCrm,
} from "../_shared/cart-recovery.ts";
import { cronUnauthorized, isAuthorizedCronCaller } from "../_shared/cron-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const hoursSince = (iso: string | null) =>
  iso ? (Date.now() - new Date(iso).getTime()) / 36e5 : Infinity;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Scheduler-only: this dispatches real customer email.
  if (!isAuthorizedCronCaller(req)) return cronUnauthorized(corsHeaders);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const dryRun = Boolean((body as { dryRun?: boolean }).dryRun);
    const settings = await getRecoverySettings(supabase);
    if (!settings.enabled) return json({ skipped: "reminders disabled" });

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY is not configured" }, 500);

    const { data: carts, error } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("recovered", false)
      .not("email", "is", null)
      .order("last_seen_at", { ascending: true })
      .limit(200);
    if (error) throw error;

    const results: Array<{ id: string; stage: number; status: string }> = [];

    for (const cart of carts ?? []) {
      const stage = Number(cart.reminder_stage ?? 0);
      const step = settings.reminders[stage];
      if (!step) continue;

      const since = cart.last_reminder_at ?? cart.last_seen_at;
      if (hoursSince(since) < Number(step.hours ?? 0)) continue;

      if (dryRun) {
        results.push({ id: cart.id, stage, status: "due" });
        continue;
      }

      const subject = renderTemplate(step.subject ?? "", cart);
      const text = renderTemplate(step.body ?? "", cart);
      const html = `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#2b2b2b">${
        text
          .split("\n")
          .map((line) => (line.trim() ? `<p>${line}</p>` : ""))
          .join("")
      }</div>`;

      let status = "sent";
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: settings.from_email,
            to: [cart.email],
            subject,
            text,
            html,
          }),
        });
        if (!res.ok) {
          status = `failed_${res.status}`;
          console.error("reminder send failed", res.status, await res.text());
        }
      } catch (e) {
        status = "failed";
        console.error("reminder send threw:", e);
      }

      if (status === "sent") {
        const updates = {
          reminder_stage: stage + 1,
          last_reminder_at: new Date().toISOString(),
          recovery_sent_at: new Date().toISOString(),
          recovery_sent_count: Number(cart.recovery_sent_count ?? 0) + 1,
        };
        await supabase.from("abandoned_carts").update(updates).eq("id", cart.id);
        await logCartEvent(supabase, cart.id, "reminder_sent", {
          channel: "email",
          detail: `stage ${stage + 1}`,
          valueUsd: Number(cart.subtotal_usd ?? 0),
        });
        await syncCartToCrm(
          supabase,
          "cart_reminder_sent",
          { ...cart, ...updates },
          settings,
        );
      }

      results.push({ id: cart.id, stage, status });
    }

    return json({ processed: results.length, results });
  } catch (e) {
    console.error("abandoned-cart-reminders error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});