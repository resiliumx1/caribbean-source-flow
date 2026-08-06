// .ics generation for consultation bookings.
// Stable UID per booking with an incrementing SEQUENCE so a reschedule updates
// the existing calendar entry instead of creating a duplicate.
import { DateTime } from "npm:luxon@3.5.0";

const SITE_URL = "https://mountkailashslu.com";

function stamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function fold(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length) {
    parts.push(" " + rest.slice(0, 72));
    rest = rest.slice(72);
  }
  return parts.join("\r\n");
}

/**
 * Build a VTIMEZONE block for a fixed-offset zone (Saint Lucia has no DST).
 * Zones that shift during the year fall back to plain UTC instants, which every
 * calendar client resolves unambiguously.
 */
function vtimezone(zone: string, referenceIso: string): string[] | null {
  const winter = DateTime.fromISO(referenceIso, { zone }).set({ month: 1, day: 15 });
  const summer = DateTime.fromISO(referenceIso, { zone }).set({ month: 7, day: 15 });
  if (!winter.isValid || !summer.isValid) return null;
  if (winter.offset !== summer.offset) return null;

  const sign = winter.offset < 0 ? "-" : "+";
  const abs = Math.abs(winter.offset);
  const offset = `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}${String(abs % 60).padStart(2, "0")}`;
  return [
    "BEGIN:VTIMEZONE",
    `TZID:${zone}`,
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    `TZOFFSETFROM:${offset}`,
    `TZOFFSETTO:${offset}`,
    `TZNAME:${winter.toFormat("ZZZZ")}`,
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
}

export function buildConsultationIcs(params: {
  bookingId: string;
  reference: string;
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  practitionerTimezone: string;
  sequence: number;
  location: string;
  organizerEmail: string;
  attendeeEmail: string;
  attendeeName: string;
  cancelled?: boolean;
}): string {
  const uid = `consultation-${params.bookingId}@mountkailashslu.com`;
  const tz = vtimezone(params.practitionerTimezone, params.startIso);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mount Kailash Rejuvenation Centre//Consultations//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${params.cancelled ? "CANCEL" : "REQUEST"}`,
    ...(tz ?? []),
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SEQUENCE:${Math.max(0, params.sequence)}`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(params.startIso)}`,
    `DTEND:${stamp(params.endIso)}`,
    `SUMMARY:${escape(params.summary)}`,
    `DESCRIPTION:${escape(params.description)}`,
    `LOCATION:${escape(params.location)}`,
    `URL:${SITE_URL}/consultations`,
    `ORGANIZER;CN=Mount Kailash Rejuvenation Centre:mailto:${params.organizerEmail}`,
    `ATTENDEE;CN=${escape(params.attendeeName)};RSVP=FALSE:mailto:${params.attendeeEmail}`,
    `STATUS:${params.cancelled ? "CANCELLED" : "CONFIRMED"}`,
    `X-MKRC-REFERENCE:${params.reference}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Consultation with Rt. Hon. Priest Kailash in one hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(fold).join("\r\n") + "\r\n";
}
