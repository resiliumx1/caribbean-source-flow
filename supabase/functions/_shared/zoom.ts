// Zoom Server-to-Server OAuth helper.
// A Zoom failure must never lose a paid consultation: every function here
// returns a result object instead of throwing at the call site.
// deno-lint-ignore-file no-explicit-any

export interface ZoomMeeting {
  meetingId: string;
  joinUrl: string;
  startUrl: string;
}

export function zoomConfigured(): boolean {
  return !!(
    Deno.env.get("ZOOM_ACCOUNT_ID") &&
    Deno.env.get("ZOOM_CLIENT_ID") &&
    Deno.env.get("ZOOM_CLIENT_SECRET")
  );
}

async function zoomToken(): Promise<string> {
  const accountId = Deno.env.get("ZOOM_ACCOUNT_ID");
  const clientId = Deno.env.get("ZOOM_CLIENT_ID");
  const clientSecret = Deno.env.get("ZOOM_CLIENT_SECRET");
  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom credentials are not configured");
  }

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`Zoom OAuth ${res.status}: ${text}`);
  const json = JSON.parse(text);
  if (!json.access_token) throw new Error("Zoom OAuth returned no access token");
  return json.access_token as string;
}

async function zoomFetch(path: string, init: RequestInit): Promise<any> {
  const token = await zoomToken();
  const res = await fetch(`https://api.zoom.us/v2${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Zoom ${init.method ?? "GET"} ${path} ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

export async function createZoomMeeting(params: {
  hostEmail: string;
  topic: string;
  agenda?: string;
  startAtIso: string;
  durationMinutes: number;
  timezone: string;
}): Promise<ZoomMeeting> {
  const body = {
    topic: params.topic.slice(0, 200),
    type: 2, // scheduled
    start_time: new Date(params.startAtIso).toISOString().replace(/\.\d{3}Z$/, "Z"),
    duration: params.durationMinutes,
    timezone: params.timezone,
    agenda: (params.agenda ?? "").slice(0, 2000),
    settings: {
      waiting_room: true,
      join_before_host: false,
      host_video: true,
      participant_video: false,
      mute_upon_entry: true,
      approval_type: 2,
      auto_recording: "none",
    },
  };
  const json = await zoomFetch(`/users/${encodeURIComponent(params.hostEmail)}/meetings`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return {
    meetingId: String(json.id),
    joinUrl: json.join_url,
    startUrl: json.start_url,
  };
}

export async function updateZoomMeeting(params: {
  meetingId: string;
  startAtIso: string;
  durationMinutes: number;
  timezone: string;
  topic?: string;
}): Promise<void> {
  await zoomFetch(`/meetings/${encodeURIComponent(params.meetingId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      start_time: new Date(params.startAtIso).toISOString().replace(/\.\d{3}Z$/, "Z"),
      duration: params.durationMinutes,
      timezone: params.timezone,
      ...(params.topic ? { topic: params.topic.slice(0, 200) } : {}),
    }),
  });
}

export async function deleteZoomMeeting(meetingId: string): Promise<void> {
  await zoomFetch(`/meetings/${encodeURIComponent(meetingId)}`, { method: "DELETE" });
}
