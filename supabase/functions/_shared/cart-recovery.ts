// Shared helpers for abandoned-cart recovery: settings, templates, CRM webhook.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export const SITE_ORIGIN = "https://www.mountkailashslu.com";

export interface ReminderStep {
  hours: number;
  subject: string;
  body: string;
}

export interface RecoverySettings {
  enabled: boolean;
  webhook_url: string;
  from_email: string;
  reminders: ReminderStep[];
}

export const DEFAULT_RECOVERY_SETTINGS: RecoverySettings = {
  enabled: true,
  webhook_url: "",
  from_email: "Mount Kailash <orders@mountkailashslu.com>",
  reminders: [
    {
      hours: 2,
      subject: "{{first_name}}, your Mount Kailash bag is saved",
      body:
        "Hi {{first_name}},\n\nWe kept your bag safe: {{items}} — total {{total}}.\n\nFinish whenever you're ready: {{recovery_link}}\n\nIf anything held you up — shipping, payment or choosing the right blend — just reply and we'll help.\n\nMount Kailash Rejuvenation Centre",
    },
    {
      hours: 24,
      subject: "Still thinking it over, {{first_name}}?",
      body:
        "Hi {{first_name}},\n\nYour selection ({{items}}, {{total}}) is still waiting. Our blends are made in small batches from mineral rich soil, so stock moves quickly.\n\nPick up where you left off: {{recovery_link}}\n\nMount Kailash Rejuvenation Centre",
    },
    {
      hours: 72,
      subject: "Last reminder about your saved bag",
      body:
        "Hi {{first_name}},\n\nThis is the last note about your saved bag ({{items}}, {{total}}). After this we'll release it.\n\nCheckout here: {{recovery_link}}\n\nQuestions about which blend suits you? Reply and our team will guide you.\n\nMount Kailash Rejuvenation Centre",
    },
  ],
};

export const recoveryLink = (cartId: string) => `${SITE_ORIGIN}/cart?recover=${cartId}`;

export async function getRecoverySettings(supabase: SupabaseClient): Promise<RecoverySettings> {
  const { data } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "abandoned_cart_recovery")
    .maybeSingle();
  const value = (data?.value ?? {}) as Partial<RecoverySettings>;
  return {
    ...DEFAULT_RECOVERY_SETTINGS,
    ...value,
    reminders: Array.isArray(value.reminders) && value.reminders.length
      ? value.reminders
      : DEFAULT_RECOVERY_SETTINGS.reminders,
  };
}

interface CartLike {
  id: string;
  email?: string | null;
  customer_name?: string | null;
  items?: Array<{ name?: string; quantity?: number }> | null;
  subtotal_usd?: number | string | null;
}

export function renderTemplate(text: string, cart: CartLike): string {
  const name = (cart.customer_name || "").trim();
  const items = (cart.items || [])
    .map((i) => `${i?.name ?? "item"} x${i?.quantity ?? 1}`)
    .join(", ");
  const map: Record<string, string> = {
    "{{first_name}}": name.split(" ")[0] || "there",
    "{{name}}": name || "there",
    "{{email}}": cart.email ?? "",
    "{{items}}": items || "your selection",
    "{{total}}": `$${Number(cart.subtotal_usd || 0).toFixed(2)}`,
    "{{recovery_link}}": recoveryLink(cart.id),
  };
  return Object.entries(map).reduce(
    (out, [token, val]) => out.split(token).join(val),
    text,
  );
}

export async function logCartEvent(
  supabase: SupabaseClient,
  cartId: string | null,
  eventType: string,
  opts: { channel?: string; detail?: string; valueUsd?: number } = {},
) {
  try {
    await supabase.from("abandoned_cart_events").insert({
      cart_id: cartId,
      event_type: eventType,
      channel: opts.channel ?? null,
      detail: opts.detail ?? null,
      value_usd: Number(opts.valueUsd ?? 0),
    });
  } catch (e) {
    console.error("logCartEvent failed:", e);
  }
}

/** Push a cart status change to the external CRM. Never throws. */
export async function syncCartToCrm(
  supabase: SupabaseClient,
  event: string,
  cart: Record<string, unknown> & { id: string },
  settings?: RecoverySettings,
): Promise<string> {
  const cfg = settings ?? (await getRecoverySettings(supabase));
  const url = Deno.env.get("CRM_WEBHOOK_URL") || cfg.webhook_url || "";
  if (!url) return "not_configured";

  const payload = {
    event,
    sent_at: new Date().toISOString(),
    cart: {
      id: cart.id,
      email: cart.email ?? null,
      customer_name: cart.customer_name ?? null,
      phone: cart.phone ?? null,
      items: cart.items ?? [],
      subtotal_usd: Number(cart.subtotal_usd ?? 0),
      recovered: Boolean(cart.recovered),
      recovered_order_id: cart.recovered_order_id ?? null,
      reminder_stage: cart.reminder_stage ?? 0,
      recovery_sent_count: cart.recovery_sent_count ?? 0,
      last_seen_at: cart.last_seen_at ?? null,
      recovery_link: recoveryLink(cart.id),
    },
  };

  let status = "failed";
  try {
    const secret = Deno.env.get("CRM_WEBHOOK_SECRET");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Webhook-Secret": secret } : {}),
      },
      body: JSON.stringify(payload),
    });
    status = res.ok ? `ok_${res.status}` : `error_${res.status}`;
    if (!res.ok) console.error("CRM webhook error", res.status, await res.text());
  } catch (e) {
    status = `error_${(e as Error).message}`.slice(0, 120);
    console.error("CRM webhook threw:", e);
  }

  try {
    await supabase
      .from("abandoned_carts")
      .update({ webhook_synced_at: new Date().toISOString(), webhook_last_status: status })
      .eq("id", cart.id);
  } catch (e) {
    console.error("webhook status write failed:", e);
  }
  await logCartEvent(supabase, cart.id, "synced", { channel: "webhook", detail: `${event}:${status}` });
  return status;
}