// Resolves the business-side notification address for consultation email.
// Reads consultation_settings key='consultation_notifications' -> value.notify_email,
// with a hard-coded fallback if the row is missing or malformed. Cached per
// invocation so repeated calls within one edge-function run don't re-query.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";

const FALLBACK_NOTIFY_EMAIL = "Mountkailashherbalschool@gmail.com";

let cached: { email: string } | null = null;

/** Business-side recipient for consultation notifications (new bookings,
 *  reschedules, cancellations, no-shows, admin alerts). Customer-facing email
 *  is unaffected — this only governs who on the business side is told. */
export async function getConsultationNotifyEmail(
  supabase?: ReturnType<typeof createClient>,
): Promise<string> {
  if (cached) return cached.email;

  const svc = supabase ?? createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    const { data, error } = await svc
      .from("consultation_settings")
      .select("value")
      .eq("key", "consultation_notifications")
      .maybeSingle();
    if (error) throw error;
    const email = (data?.value as any)?.notify_email;
    if (typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      cached = { email };
      return email;
    }
  } catch (e) {
    console.error("getConsultationNotifyEmail: falling back —", e instanceof Error ? e.message : e);
  }

  cached = { email: FALLBACK_NOTIFY_EMAIL };
  return FALLBACK_NOTIFY_EMAIL;
}
