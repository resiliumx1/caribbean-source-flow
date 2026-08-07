// Imports scheduled sessions from the connected Calendly account as read-only
// rows in consultation_calendly_events. Full admins only.
// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { requireAdmin, serviceClient } from "../_shared/admin-auth.ts";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    await requireAdmin(req);
  } catch (e: any) {
    return json({ error: e?.message || "Not authorised." }, 401);
  }

  try {
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
      .select("calendly_event_uri");
    const known = new Set((existing ?? []).map((r: any) => r.calendly_event_uri));

    let added = 0;
    let updated = 0;
    let skipped = 0;

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
      } else if (known.has(uri)) {
        updated += 1;
      } else {
        added += 1;
      }
    }

    return json({ ok: true, fetched: events.length, added, updated, skipped, synced_at: new Date().toISOString() });
  } catch (e: any) {
    const status = typeof e?.status === "number" ? e.status : 500;
    return json({ error: e?.message || "Sync failed", details: e?.details }, status);
  }
});