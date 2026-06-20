// Single source of truth for delivery windows. Used by order-tracking-lookup
// and concierge-chat. Keep in sync with the concierge SYSTEM_PROMPT.

export const HANDLING_DAYS = { min: 1, max: 3 } as const;

export interface RegionWindow {
  key: string;
  label: string;
  min: number;
  max: number;
  countries?: string[];
}

export const DELIVERY_WINDOWS: Record<string, RegionWindow> = {
  LC: { key: "LC", label: "Saint Lucia", min: 1, max: 2, countries: ["LC"] },
  CARIBBEAN: {
    key: "CARIBBEAN",
    label: "Caribbean / CARICOM",
    min: 3,
    max: 7,
    countries: ["BB", "TT", "JM", "GD", "VC", "DM", "AG", "KN", "GY", "SR", "BS", "BZ", "HT", "DO", "CU", "PR"],
  },
  USA: { key: "USA", label: "USA", min: 3, max: 7, countries: ["US", "USA"] },
  CANADA: { key: "CANADA", label: "Canada", min: 7, max: 14, countries: ["CA", "CAN"] },
  UK_EU: {
    key: "UK_EU",
    label: "UK / EU",
    min: 7,
    max: 14,
    countries: ["GB", "UK", "IE", "FR", "DE", "ES", "IT", "NL", "BE", "SE", "NO", "DK", "FI", "PT", "AT", "CH", "PL", "CZ", "GR", "HU", "RO"],
  },
  ROW: { key: "ROW", label: "Rest of world", min: 10, max: 21 },
};

export function resolveRegion(country?: string | null): RegionWindow {
  if (!country) return DELIVERY_WINDOWS.ROW;
  const c = country.trim().toUpperCase();
  for (const r of Object.values(DELIVERY_WINDOWS)) {
    if (r.countries?.includes(c)) return r;
  }
  // Try full name fallback
  const lower = country.trim().toLowerCase();
  if (lower.includes("saint lucia") || lower === "st lucia" || lower === "st. lucia") return DELIVERY_WINDOWS.LC;
  if (lower.includes("united states") || lower === "america") return DELIVERY_WINDOWS.USA;
  if (lower.includes("canada")) return DELIVERY_WINDOWS.CANADA;
  if (lower.includes("united kingdom") || lower.includes("britain") || lower.includes("england")) return DELIVERY_WINDOWS.UK_EU;
  return DELIVERY_WINDOWS.ROW;
}

export interface EtaWindow {
  earliest: string; // ISO date (yyyy-mm-dd)
  latest: string;
  earliestLabel: string;
  latestLabel: string;
  fromDispatch: boolean; // false → measured from order creation + handling
}

function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function pretty(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function computeEta(
  dispatchedAt: Date | null,
  createdAt: Date,
  region: RegionWindow,
): EtaWindow {
  if (dispatchedAt) {
    const earliest = addBusinessDays(dispatchedAt, region.min);
    const latest = addBusinessDays(dispatchedAt, region.max);
    return { earliest: fmt(earliest), latest: fmt(latest), earliestLabel: pretty(earliest), latestLabel: pretty(latest), fromDispatch: true };
  }
  // Not yet shipped — add handling buffer first
  const shipBy = addBusinessDays(createdAt, HANDLING_DAYS.max);
  const earliest = addBusinessDays(shipBy, region.min);
  const latest = addBusinessDays(shipBy, region.max);
  return { earliest: fmt(earliest), latest: fmt(latest), earliestLabel: pretty(earliest), latestLabel: pretty(latest), fromDispatch: false };
}

export function carrierTrackingUrl(carrier?: string | null, tracking?: string | null): string | null {
  if (!tracking) return null;
  const t = encodeURIComponent(tracking);
  const c = (carrier || "").toLowerCase();
  if (c.includes("dhl")) return `https://www.dhl.com/en/express/tracking.html?AWB=${t}`;
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${t}`;
  if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${t}`;
  if (c.includes("royal")) return `https://www3.royalmail.com/track-your-item#/tracking-results/${t}`;
  if (c.includes("dpd")) return `https://track.dpd.co.uk/parcels/${t}`;
  // Generic fallback
  return `https://www.google.com/search?q=${t}+tracking`;
}