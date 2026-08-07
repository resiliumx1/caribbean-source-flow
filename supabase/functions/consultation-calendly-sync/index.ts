// Imports scheduled sessions from the connected Calendly account as read-only
// rows in consultation_calendly_events. Full admins only.
// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { requireAdmin, serviceClient } from "../_shared/admin-auth.ts";
import { sendCalendlyConfirmationEmail } from "../_shared/consultation-email.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/calendly";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function gatewayHeaders() {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const calendlyKey = Deno.env.get("CALENDLY_API_KEY");
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!calendlyKey) throw new Error("CALENDLY_API_KEY is not configured — link the Calendly connection");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": calendlyKey,
  };
}

async function calendly(path: string, params?: Record<string, string>) {
  const url = new URL(`${GATEWAY_URL}${path}`);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: gatewayHeaders() });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Calendly request failed [${res.status}] ${path}: ${text}`);
    throw Object.assign(new Error(`Calendly request failed (${res.status})`), {
      status: res.status,
      details: text,
    });
  }
  return await res.json();
}

const uuidOf = (uri: string) => uri.split("/").filter(Boolean).pop() ?? "";

/**
 * Send our branded confirmation for one imported Calendly session and stamp it,
 * so a resync never emails the same person twice.
 */
async function confirmOne(supabase: any, ev: any): Promise<boolean> {
  const result = await sendCalendlyConfirmationEmail(ev)
    .catch((e: any) => ({ sent: false, error: String(e?.message || e) }));
  if (!result.sent) {
    console.error("Calendly confirmation email failed:", ev.calendly_event_uri, result.error);
    return false;
  }
  await supabase
    .from("consultation_calendly_events")
    .update({ sent_confirmation_at: new Date().toISOString() })
    .eq("calendly_event_uri", ev.calendly_event_uri);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    await requireAdmin(req);
  } catch (e: any) {
    return json({ error: e?.message || "Not authorised." }, 401);
  }

  try {
    // Manual per-row resend from the admin table — no Calendly call needed.
    const raw = await req.text();
    const payload = raw ? JSON.parse(raw) : {};
    if (payload?.action === "send_confirmation") {
      const uri = String(payload.calendly_event_uri ?? "");
      if (!uri) return json({ error: "A session is required." }, 400);
      const supabase = serviceClient();
      const { data: ev } = await supabase
        .from("consultation_calendly_events")
        .select("*").eq("calendly_event_uri", uri).maybeSingle();
      if (!ev) return json({ error: "That session could not be found." }, 404);
      if (!ev.invitee_email) return json({ error: "That session has no client email on record." }, 400);
      const ok = await confirmOne(supabase, ev);
      return ok
        ? json({ ok: true, sent_to: ev.invitee_email })
        : json({ error: "The confirmation could not be sent. Please try again." }, 502);
    }

    const me = await calendly("/users/me");
    const userUri: string = me?.resource?.uri;
    if (!userUri) return json({ error: "Could not resolve the Calendly account." }, 502);

    // Pull scheduled events (both upcoming and past) for the connected user.
    const events: any[] = [];
    let pageToken: string | undefined;
    let guard = 0;
    do {
      const params: Record<string, string> = {
        user: userUri,
        count: "100",
        sort: "start_time:desc",
      };
      if (pageToken) params.page_token = pageToken;
      const page = await calendly("/scheduled_events", params);
      events.push(...(page?.collection ?? []));
      const next: string | null = page?.pagination?.next_page_token ?? null;
      pageToken = next ?? undefined;
      guard += 1;
    } while (pageToken && guard < 20);

    const supabase = serviceClient();
    const { data: existing } = await supabase
      .from("consultation_calendly_events")
      .select("calendly_event_uri, sent_confirmation_at");
    const known = new Set((existing ?? []).map((r: any) => r.calendly_event_uri));
    const alreadyEmailed = new Set(
      (existing ?? []).filter((r: any) => r.sent_confirmation_at).map((r: any) => r.calendly_event_uri),
    );

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let emailed = 0;
    const toConfirm: any[] = [];

    for (const ev of events) {
      const uri: string = ev?.uri;
      if (!uri || !ev?.start_time || !ev?.end_time) {
        skipped += 1;
        continue;
      }

      let invitee: any = null;
      try {
        const inv = await calendly(`/scheduled_events/${uuidOf(uri)}/invitees`, { count: "1" });
        invitee = inv?.collection?.[0] ?? null;
      } catch (_e) {
        // Invitee details are optional — keep the session row regardless.
      }

      const host = (ev?.event_memberships ?? [])[0] ?? {};
      const row = {
        calendly_event_uri: uri,
        calendly_invitee_uri: invitee?.uri ?? null,
        organizer_name: host?.user_name ?? me?.resource?.name ?? null,
        organizer_email: host?.user_email ?? me?.resource?.email ?? null,
        event_name: ev?.name ?? null,
        starts_at: ev.start_time,
        ends_at: ev.end_time,
        invitee_name: invitee?.name ?? null,
        invitee_email: invitee?.email ?? null,
        invitee_timezone: invitee?.timezone ?? null,
        status: ev?.status ?? "active",
        location_type: ev?.location?.type ?? null,
        join_url: ev?.location?.join_url ?? ev?.location?.location ?? null,
        raw: ev,
        synced_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("consultation_calendly_events")
        .upsert(row, { onConflict: "calendly_event_uri" });

      if (error) {
        console.error("Upsert failed:", error.message);
        skipped += 1;
      } else {
        if (known.has(uri)) updated += 1;
        else added += 1;

        // Confirm only future, active sessions that have never been emailed by us.
        const isFuture = new Date(ev.start_time).getTime() > Date.now();
        if (
          isFuture && row.status === "active" && row.invitee_email &&
          !alreadyEmailed.has(uri)
        ) {
          toConfirm.push(row);
        }
      }
    }

    for (const ev of toConfirm) {
      if (await confirmOne(supabase, ev)) emailed += 1;
    }

    return json({
      ok: true,
      fetched: events.length,
      added,
      updated,
      skipped,
      emailed,
      synced_at: new Date().toISOString(),
    });
  } catch (e: any) {
    const status = typeof e?.status === "number" ? e.status : 500;
    return json({ error: e?.message || "Sync failed", details: e?.details }, status);
  }
});