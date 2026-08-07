// Consultation transactional email, sent from the Mount Kailash identity via
// Resend — the same sender the store's order emails already use.
// deno-lint-ignore-file no-explicit-any
import { formatInZone } from "./consultation.ts";
import { buildConsultationIcs } from "./consultation-ics.ts";

const BRAND_DARK = "#1a3a2e";
const BRAND_GOLD = "#b8893d";
const BRAND_CREAM = "#faf6ef";
const BRAND_TEXT = "#2b2b2b";
const BRAND_MUTED = "#6b6b6b";
const SITE_URL = "https://mountkailashslu.com";
const SUPPORT_EMAIL = "info@mountkailashslu.com";
const SUPPORT_PHONE = "+1 (758) 285-5195";

const FROM_CUSTOMER = "Mount Kailash <orders@mountkailashslu.com>";
const ADMIN_TO = "info@mountkailashslu.com";
const ADMIN_CC = "blessedlove@mountkailashslu.com";

export type ConsultationEmailType =
  | "confirmation"
  | "reschedule"
  | "cancellation"
  | "reminder_24h"
  | "reminder_1h"
  | "join_link";

async function sendResend(payload: Record<string, unknown>) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("Resend API error:", res.status, text);
    throw new Error(`Resend ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

function shell(heading: string, intro: string, bodyHtml: string, ctaHtml = ""): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${BRAND_CREAM};font-family:Helvetica,Arial,sans-serif;color:${BRAND_TEXT};">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:${BRAND_DARK};padding:28px 24px;text-align:center;">
      <div style="color:${BRAND_CREAM};font-size:13px;letter-spacing:.22em;text-transform:uppercase;">Mount Kailash Rejuvenation Centre</div>
      <div style="color:${BRAND_GOLD};font-size:12px;letter-spacing:.16em;text-transform:uppercase;margin-top:8px;">Saint Lucia</div>
    </div>
    <div style="padding:32px 28px;">
      <h1 style="margin:0 0 14px;font-size:23px;line-height:1.3;color:${BRAND_DARK};font-weight:600;">${heading}</h1>
      <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:${BRAND_TEXT};">${intro}</p>
      ${bodyHtml}
      ${ctaHtml}
      <p style="margin:26px 0 0;font-size:14px;line-height:1.7;color:${BRAND_MUTED};">
        Questions? Reply to this email, write to
        <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_GOLD};">${SUPPORT_EMAIL}</a>
        or call ${SUPPORT_PHONE}.
      </p>
    </div>
    <div style="background:${BRAND_DARK};padding:20px 24px;text-align:center;color:${BRAND_CREAM};font-size:12px;line-height:1.7;">
      <a href="${SITE_URL}" style="color:${BRAND_GOLD};text-decoration:none;">mountkailashslu.com</a><br/>
      Mount Kailash Rejuvenation Centre, Saint Lucia
    </div>
  </div></body></html>`;
}

function detailRows(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e0d2;border-radius:10px;overflow:hidden;margin:0 0 22px;">
    ${rows.map(([k, v], i) => `<tr style="background:${i % 2 ? "#ffffff" : BRAND_CREAM};">
      <td style="padding:12px 16px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:${BRAND_MUTED};width:38%;">${k}</td>
      <td style="padding:12px 16px;font-size:15px;color:${BRAND_TEXT};font-weight:500;">${v}</td>
    </tr>`).join("")}
  </table>`;
}

function button(href: string, label: string): string {
  return `<div style="margin:0 0 8px;"><a href="${href}" style="display:inline-block;background:${BRAND_DARK};color:${BRAND_CREAM};text-decoration:none;padding:14px 26px;border-radius:8px;font-size:15px;font-weight:600;">${label}</a></div>`;
}

function goldButton(href: string, label: string): string {
  return `<div style="margin:0 0 10px;"><a href="${href}" style="display:inline-block;background:${BRAND_GOLD};color:#ffffff;text-decoration:none;padding:15px 28px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:.02em;">${label}</a></div>`;
}

function textLink(href: string, label: string): string {
  return `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:${BRAND_MUTED};">${label} <a href="${href}" style="color:${BRAND_GOLD};word-break:break-all;">${href}</a></p>`;
}

/** Session length wording — sessions run 30–45 minutes in practice. */
export function durationLabel(minutes?: number | null): string {
  const m = Number(minutes) || 45;
  return m === 45 ? "45 minutes (typically 30–45)" : `${m} minutes`;
}

/** Non-refundable and consultative-scope notice, shown on every client email. */
function disclaimerBlock(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;border:1px solid #e8e0d2;border-left:4px solid ${BRAND_GOLD};border-radius:8px;background:${BRAND_CREAM};">
    <tr><td style="padding:16px 18px;">
      <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${BRAND_DARK};font-weight:700;margin:0 0 8px;">Please note</div>
      <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:${BRAND_TEXT};">
        Consultation fees are <strong>non-refundable</strong>. Sessions may be rescheduled once with at least 24 hours' notice.
      </p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:${BRAND_MUTED};">
        This consultation is educational and consultative in nature. It does not constitute medical diagnosis,
        treatment, or a doctor–patient relationship, and it is not a substitute for care from your licensed physician.
        Do not stop or change prescribed medication based on this session. In an emergency, contact your local
        emergency services.
      </p>
    </td></tr>
  </table>`;
}

const PREPARE_NOTE =
  `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND_TEXT};">
    <strong>To prepare:</strong> bring your questions, your current concerns, and any history — including
    medications or supplements — that you would like discussed.
  </p>`;

export interface EmailContext {
  booking: any;
  service: any;
  practitioner: any;
}

/**
 * Branded confirmation for a session that was booked through Calendly. Carries
 * the meeting link Calendly issued plus the same disclaimer as native bookings.
 */
export async function sendCalendlyConfirmationEmail(
  ev: any,
): Promise<{ sent: boolean; error?: string }> {
  if (!ev?.invitee_email) return { sent: false, error: "No invitee email on that session." };
  const inviteeZone = ev.invitee_timezone || "America/St_Lucia";
  const name = ev.invitee_name || "there";
  const minutes = Math.max(
    1,
    Math.round((new Date(ev.ends_at).getTime() - new Date(ev.starts_at).getTime()) / 60000),
  );

  const rows: [string, string][] = [
    ["Session", ev.event_name || "Private Consultation"],
    ["Your time", formatInZone(ev.starts_at, inviteeZone)],
    ["Saint Lucia time", formatInZone(ev.starts_at, "America/St_Lucia")],
    ["Duration", durationLabel(minutes)],
    ["Format", ev.join_url ? "Online via Zoom" : "Online — link to follow"],
  ];
  if (ev.join_url) {
    rows.push(["Meeting link", `<a href="${ev.join_url}" style="color:${BRAND_GOLD};">Join the session</a>`]);
  }

  const cta = ev.join_url
    ? goldButton(ev.join_url, "Join your session on Zoom") +
      textLink(ev.join_url, "Or paste this link into your browser:")
    : button(`${SITE_URL}/consultations`, "View consultations");

  const html = shell(
    "Your consultation is confirmed",
    `${name}, your time with Rt. Hon. Priest Kailash is reserved. The details and your meeting link are below.`,
    PREPARE_NOTE + detailRows(rows),
    cta + disclaimerBlock(),
  );

  try {
    await sendResend({
      from: FROM_CUSTOMER,
      to: [ev.invitee_email],
      reply_to: SUPPORT_EMAIL,
      subject: `Your consultation is confirmed — ${formatInZone(ev.starts_at, inviteeZone)} | Mount Kailash`,
      html,
    });
  } catch (e: any) {
    return { sent: false, error: e?.message || String(e) };
  }
  return { sent: true };
}

/**
 * Send the customer-facing consultation email plus, for new and changed
 * bookings, the internal notification. Attaches an .ics for calendar entries.
 */
export async function sendConsultationEmail(
  type: ConsultationEmailType,
  ctx: EmailContext,
): Promise<{ sent: boolean; error?: string }> {
  const { booking, service, practitioner } = ctx;
  const customerZone = booking.customer_timezone || "UTC";
  const practitionerZone = practitioner?.timezone || "America/St_Lucia";
  const manageUrl = `${SITE_URL}/consultations/manage/${booking.manage_token}`;
  const isOnline = booking.mode === "online";
  const location = isOnline
    ? (booking.zoom_join_url ? "Online via Zoom" : "Online — link to follow")
    : "Mount Kailash Rejuvenation Centre, Saint Lucia";

  const rows: [string, string][] = [
    ["Reference", booking.booking_reference],
    ["Session", service?.name ?? "Private Consultation"],
    ["Your time", formatInZone(booking.starts_at, customerZone)],
    ["Saint Lucia time", formatInZone(booking.starts_at, practitionerZone)],
    ["Duration", durationLabel(service?.duration_minutes)],
    ["Format", location],
  ];
  if (booking.zoom_join_url && isOnline) {
    rows.push(["Zoom link", `<a href="${booking.zoom_join_url}" style="color:${BRAND_GOLD};">Join the session</a>`]);
  }
  if (type !== "cancellation") {
    rows.push(["Amount paid", `$${Number(booking.amount).toFixed(2)} ${booking.currency}`]);
  }

  let subject: string;
  let heading: string;
  let intro: string;
  let cta = button(manageUrl, "View or change this booking");
  let attachIcs = true;
  let cancelled = false;
  let extraHtml = "";
  const joinable = isOnline && Boolean(booking.zoom_join_url);

  switch (type) {
    case "confirmation":
      subject = `Your consultation is confirmed — ${booking.booking_reference} | Mount Kailash`;
      heading = "Your consultation is confirmed";
      intro = `${booking.customer_name}, your time with Rt. Hon. Priest Kailash is reserved. The details are below, and a calendar invitation is attached.`;
      extraHtml = PREPARE_NOTE;
      if (joinable) {
        cta = goldButton(booking.zoom_join_url, "Join your session on Zoom") +
          textLink(booking.zoom_join_url, "Or paste this link into your browser:") +
          button(manageUrl, "View or change this booking");
      }
      break;
    case "reschedule":
      subject = `Your consultation has been moved — ${booking.booking_reference} | Mount Kailash`;
      heading = "Your consultation has been moved";
      intro = `${booking.customer_name}, your session has been rescheduled. The new time is below and the attached invitation will update your calendar.`;
      if (joinable) {
        cta = goldButton(booking.zoom_join_url, "Join your session on Zoom") +
          textLink(booking.zoom_join_url, "Or paste this link into your browser:") +
          button(manageUrl, "View or change this booking");
      }
      break;
    case "cancellation":
      subject = `Your consultation has been cancelled — ${booking.booking_reference} | Mount Kailash`;
      heading = "Your consultation has been cancelled";
      intro = `${booking.customer_name}, the session below has been cancelled${booking.cancellation_reason ? `: ${booking.cancellation_reason}` : "."}. If this was not intended, reply to this email and we will put it right.`;
      cta = button(`${SITE_URL}/consultations`, "Book another time");
      cancelled = true;
      break;
    case "reminder_24h":
      subject = `Tomorrow: your consultation with Priest Kailash — ${booking.booking_reference}`;
      heading = "Your consultation is tomorrow";
      intro = `${booking.customer_name}, a reminder that your session with Rt. Hon. Priest Kailash is tomorrow. Come with your questions and any history you would like to discuss.`;
      attachIcs = false;
      if (joinable) {
        cta = goldButton(booking.zoom_join_url, "Join your session on Zoom") +
          textLink(booking.zoom_join_url, "Your link, ready for tomorrow:") +
          button(manageUrl, "View or change this booking");
      }
      break;
    case "reminder_1h":
      subject = `In one hour: your consultation with Priest Kailash — ${booking.booking_reference}`;
      heading = "Your consultation begins in one hour";
      intro = `${booking.customer_name}, your session begins in one hour.${joinable ? " Use the link below to join a few minutes early." : ""}`;
      cta = joinable
        ? goldButton(booking.zoom_join_url, "Join your session on Zoom") +
          textLink(booking.zoom_join_url, "Or paste this link into your browser:")
        : cta;
      attachIcs = false;
      break;
  }

  const html = shell(
    heading,
    intro,
    extraHtml + detailRows(rows),
    cta + (cancelled ? "" : disclaimerBlock()),
  );

  let attachments: unknown[] | undefined;
  if (attachIcs) {
    const ics = buildConsultationIcs({
      bookingId: booking.id,
      reference: booking.booking_reference,
      summary: `${service?.name ?? "Consultation"} with Rt. Hon. Priest Kailash`,
      description: [
        `Reference: ${booking.booking_reference}`,
        booking.zoom_join_url ? `Zoom: ${booking.zoom_join_url}` : "",
        `Manage this booking: ${manageUrl}`,
      ].filter(Boolean).join("\n"),
      startIso: booking.starts_at,
      endIso: booking.ends_at,
      practitionerTimezone: practitionerZone,
      sequence: booking.ics_sequence ?? 0,
      location,
      organizerEmail: SUPPORT_EMAIL,
      attendeeEmail: booking.customer_email,
      attendeeName: booking.customer_name,
      cancelled,
    });
    attachments = [{
      filename: `consultation-${booking.booking_reference}.ics`,
      content: btoa(unescape(encodeURIComponent(ics))),
      content_type: "text/calendar; method=REQUEST; charset=UTF-8",
    }];
  }

  try {
    await sendResend({
      from: FROM_CUSTOMER,
      to: [booking.customer_email],
      reply_to: SUPPORT_EMAIL,
      subject,
      html,
      ...(attachments ? { attachments } : {}),
    });
  } catch (e: any) {
    return { sent: false, error: e?.message || String(e) };
  }

  // Internal notification for the practitioner and admin — never fatal.
  if (type === "confirmation" || type === "reschedule" || type === "cancellation") {
    const label = type === "confirmation"
      ? "New consultation booked"
      : type === "reschedule" ? "Consultation rescheduled" : "Consultation cancelled";
    const internalRows: [string, string][] = [
      ["Client", `${booking.customer_name} — ${booking.customer_email}${booking.customer_phone ? ` — ${booking.customer_phone}` : ""}`],
      ...rows,
    ];
    if (booking.notes) internalRows.push(["Notes", String(booking.notes)]);
    const answers = booking.intake_answers && typeof booking.intake_answers === "object"
      ? Object.entries(booking.intake_answers as Record<string, unknown>)
      : [];
    for (const [q, a] of answers) internalRows.push([q.slice(0, 60), String(a)]);
    if (booking.zoom_start_url && type !== "cancellation") {
      internalRows.push(["Host start link", `<a href="${booking.zoom_start_url}" style="color:${BRAND_GOLD};">Start the meeting</a>`]);
    }
    try {
      await sendResend({
        from: FROM_CUSTOMER,
        to: [ADMIN_TO],
        cc: [ADMIN_CC],
        reply_to: booking.customer_email,
        subject: `${label} — ${booking.booking_reference} — ${booking.customer_name}`,
        html: shell(
          label,
          `${booking.customer_name} — ${formatInZone(booking.starts_at, practitionerZone)} Saint Lucia time.`,
          detailRows(internalRows),
          button(`${SITE_URL}/admin/consultations`, "Open in admin"),
        ),
      });
    } catch (e) {
      console.error("consultation internal notification failed:", e);
    }
  }

  return { sent: true };
}
