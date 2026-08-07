// Scheduled reminder dispatch (pg_cron). Idempotent: the sent-at columns are
// stamped before sending so a reminder can never go out twice.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendConsultationEmail } from "../_shared/consultation-email.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SELECT =
  "*, consultation_services!service_id(*), consultation_practitioners!practitioner_id(*)";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = Date.now();
    const results = { reminder_24h: 0, reminder_1h: 0, failed: 0 };

    const windows = [
      {
        type: "reminder_24h" as const,
        column: "reminder_24h_sent_at",
        fromMs: now + 23 * 3_600_000,
        toMs: now + 25 * 3_600_000,
      },
      {
        type: "reminder_1h" as const,
        column: "reminder_1h_sent_at",
        fromMs: now + 30 * 60_000,
        toMs: now + 90 * 60_000,
      },
    ];

    for (const w of windows) {
      const { data: due, error } = await supabase
        .from("consultation_bookings")
        .select(SELECT)
        .eq("status", "confirmed")
        .is(w.column, null)
        .gte("starts_at", new Date(w.fromMs).toISOString())
        .lte("starts_at", new Date(w.toMs).toISOString())
        .limit(50);
      if (error) throw error;

      for (const booking of due ?? []) {
        // Stamp first so a retry cannot double-send.
        const { error: stampErr } = await supabase
          .from("consultation_bookings")
          .update({ [w.column]: new Date().toISOString() })
          .eq("id", (booking as any).id)
          .is(w.column, null);
        if (stampErr) continue;

        const result = await sendConsultationEmail(w.type, {
          booking,
          service: (booking as any).consultation_services,
          practitioner: (booking as any).consultation_practitioners,
        }).catch((e) => ({ sent: false, error: String(e) }));

        if (result.sent) results[w.type]++;
        else {
          results.failed++;
          console.error(`${w.type} failed for ${(booking as any).booking_reference}:`, result.error);
          // Clear the stamp so the next run can retry.
          await supabase.from("consultation_bookings")
            .update({ [w.column]: null }).eq("id", (booking as any).id);
        }
      }
    }

    return json({ success: true, ...results });
  } catch (err: any) {
    console.error("consultation-reminders error:", err?.message || err);
    return json({ error: "Reminder dispatch failed." }, 500);
  }
});
