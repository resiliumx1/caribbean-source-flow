/** First-party analytics for the /wce-2026 landing page.
 *  Reads public.wce_page_events, which is written only by the wce-track edge
 *  function and readable only by admins and organisers. No personal data. */
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie, Legend,
} from "recharts";
import { Download, FileText } from "lucide-react";
import { ACCENTS, SectionHeading, StatCard, EmptyState } from "./ui";
import { StatsSkeleton, wceToast, InfoTip } from "./kit";
import { wcePathwayLabel } from "@/lib/wce-pathway-labels";

type Ev = {
  created_at: string;
  session_id: string;
  event_type: string;
  event_target: string | null;
  path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referral_code: string | null;
  device_type: string | null;
  country: string | null;
  meta: Record<string, unknown> | null;
};

type RangeKey = "today" | "7d" | "30d" | "all";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "all", label: "All time" },
];

/** Page sections in page order — mirrors WCE_SECTIONS on the public page. */
const SECTIONS: { id: string; label: string }[] = [
  { id: "pathways", label: "Pathways" },
  { id: "speakers", label: "Speakers" },
  { id: "activities", label: "Activities" },
  { id: "itinerary", label: "Itinerary" },
  { id: "lifecraft", label: "LifeCraft" },
  { id: "retreat-detail", label: "Retreat Detail" },
  { id: "ceremony", label: "Ceremony" },
  { id: "apply", label: "Retreat Application" },
  { id: "faq", label: "FAQ" },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function rangeWindow(key: RangeKey): { start: Date | null; days: number | null } {
  if (key === "all") return { start: null, days: null };
  const d = new Date();
  if (key === "today") { d.setHours(0, 0, 0, 0); return { start: d, days: 1 }; }
  const days = key === "7d" ? 7 : 30;
  d.setDate(d.getDate() - days);
  return { start: d, days };
}

const tooltipStyle = {
  background: "#0F2A1D",
  border: "1px solid rgba(201,162,39,0.4)",
  color: "#F5EFE0",
  fontSize: 12,
} as const;

const axisTick = { fill: "rgba(245,239,224,0.6)", fontSize: 10 } as const;
const axisStroke = "rgba(201,162,39,0.3)";
const PIE_COLORS = [ACCENTS.gold.series, ACCENTS.sage.series, ACCENTS.teal.series, ACCENTS.terracotta.series, "#8B6914", "#5AAD5A"];

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="wa-panel" style={{ minWidth: 0 }}>
      <p className="wa-label" style={{ marginBottom: "0.6rem" }}>
        {title}{hint && <> <InfoTip label={title}>{hint}</InfoTip></>}
      </p>
      {children}
    </div>
  );
}

function countBy<T>(rows: T[], key: (r: T) => string | null | undefined) {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = key(r);
    if (!k) return;
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function uniqueSessions(rows: Ev[]) {
  return new Set(rows.map((r) => r.session_id)).size;
}

/** Counts unique visitors (sessions) per key, rather than raw events. */
function sessionsBy(rows: Ev[], key: (r: Ev) => string | null | undefined) {
  const map = new Map<string, Set<string>>();
  rows.forEach((r) => {
    const k = key(r);
    if (!k) return;
    const set = map.get(k) ?? new Set<string>();
    set.add(r.session_id);
    map.set(k, set);
  });
  return [...map.entries()]
    .map(([name, set]) => ({ name, value: set.size }))
    .sort((a, b) => b.value - a.value);
}

let displayNames: Intl.DisplayNames | null = null;
/** "LC" -> "Saint Lucia". Falls back to the raw code. */
function countryName(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return code;
  try {
    displayNames ??= new Intl.DisplayNames(undefined, { type: "region" });
    return displayNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Mobile", tablet: "Tablet", desktop: "Desktop",
};


const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 1000) / 10 : 0);
const pctText = (num: number, den: number) => `${pct(num, den).toFixed(1)}%`;

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

function durationText(seconds: number) {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/** Traffic source label: explicit utm_source, else referral host, else direct. */
function sourceLabel(e: Ev): string {
  if (e.utm_source) return e.utm_source.toLowerCase();
  if (e.referrer) {
    try {
      const host = new URL(e.referrer).hostname.replace(/^www\./, "");
      if (host && !host.includes("mountkailashslu")) return host;
    } catch { /* unparsable referrer */ }
  }
  return "direct";
}

function metaStr(e: Ev, key: string): string | null {
  const v = e.meta?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Trend text comparing this period with the one immediately before it. */
function trendOf(current: number, previous: number | null) {
  if (previous === null) return undefined;
  if (previous === 0) return current > 0 ? { direction: "up" as const, text: "new activity" } : undefined;
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return { direction: "flat" as const, text: "same as previous period" };
  return {
    direction: change > 0 ? ("up" as const) : ("down" as const),
    text: `${Math.abs(change)}% vs previous period`,
  };
}

/** Coarse acquisition channel, useful for SEO vs social vs paid reporting. */
const SEARCH_HOSTS = ["google", "bing", "duckduckgo", "yahoo", "ecosia", "brave", "baidu", "yandex"];
const SOCIAL_HOSTS = ["facebook", "instagram", "t.co", "twitter", "x.com", "linkedin", "tiktok", "youtube", "whatsapp", "pinterest", "reddit"];
const EMAIL_HOSTS = ["mail.", "mailchi", "outlook", "gmail"];

function channelOf(e: Ev): string {
  const medium = (e.utm_medium ?? "").toLowerCase();
  if (medium.includes("cpc") || medium.includes("paid") || medium.includes("ppc")) return "Paid";
  if (medium.includes("email")) return "Email";
  if (medium.includes("social")) return "Social";
  if (medium.includes("organic")) return "Organic search";
  const label = sourceLabel(e);
  if (label === "direct") return "Direct";
  if (SEARCH_HOSTS.some((h) => label.includes(h))) return "Organic search";
  if (SOCIAL_HOSTS.some((h) => label.includes(h))) return "Social";
  if (EMAIL_HOSTS.some((h) => label.includes(h))) return "Email";
  return "Referral";
}

/** Head data shipped on /wce-2026 — kept in step with WCE2026.tsx. */
const SEO_CHECKS: { item: string; value: string }[] = [
  { item: "Page title", value: "Caribbean Wellness Saint Lucia 2026 | 11–17 October (57 characters)" },
  { item: "Meta description", value: "11–17 October 2026 at Mount Kailash Rejuvenation Centre, Saint Lucia. Attend the symposium in person or online, or apply for the six-day retreat." },
  { item: "Canonical URL", value: "https://mountkailashslu.com/wce-2026" },
  { item: "Indexable", value: "Yes — allowed in robots.txt and listed in sitemap.xml" },
  { item: "Social preview", value: "Landscape 1200×630 and square cards, per-speaker share images" },
  { item: "Structured data", value: "Event (with sub-events and offers), FAQPage, BreadcrumbList" },
  { item: "Speaker share routes", value: "7 flyer URLs, each with its own title, description and image" },
];

function downloadCsv(rows: Ev[]) {
  const cols: (keyof Ev)[] = [
    "created_at", "session_id", "event_type", "event_target", "path", "referrer",
    "utm_source", "utm_medium", "utm_campaign", "referral_code", "device_type", "country",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(","));
  const csv = [cols.join(","), ...body].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `wce-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type Row = { name: string; value: number };

/** Builds a printable activity report and opens it in a new tab. */
function openReport(args: {
  rangeLabel: string;
  first: string | null;
  last: string | null;
  headline: { label: string; value: string }[];
  tables: { title: string; head: string[]; rows: (string | number)[][] }[];
}) {
  const esc = (v: unknown) =>
    String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const table = (t: { title: string; head: string[]; rows: (string | number)[][] }) =>
    !t.rows.length ? "" : `<h2>${esc(t.title)}</h2><table><thead><tr>${t.head
      .map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${t.rows
      .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>WCE 2026 activity report — ${esc(args.rangeLabel)}</title>
<style>
  body{font-family:'DM Sans',system-ui,sans-serif;color:#17301f;margin:0;padding:36px;max-width:900px}
  h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;margin:0 0 4px}
  h2{font-family:'Jost',system-ui,sans-serif;font-size:15px;text-transform:uppercase;letter-spacing:.08em;margin:26px 0 8px;color:#4a6b52}
  p.meta{color:#5d6b60;font-size:13px;margin:0 0 18px}
  table{border-collapse:collapse;width:100%;font-size:13px}
  th,td{border-bottom:1px solid #e2e6e0;padding:6px 8px;text-align:left}
  th{color:#4a6b52;font-weight:600}
  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:12px 0 6px}
  .kpi{border:1px solid #e2e6e0;border-radius:10px;padding:10px 12px}
  .kpi b{display:block;font-size:20px}
  .kpi span{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#5d6b60}
  button{margin-bottom:18px;padding:8px 14px;border-radius:8px;border:1px solid #17301f;background:#17301f;color:#fff;cursor:pointer}
  @media print{button{display:none}}
</style></head><body>
<button onclick="window.print()">Print or save as PDF</button>
<h1>Caribbean Wellness Experience 2026 — activity report</h1>
<p class="meta">Range: ${esc(args.rangeLabel)}${
    args.first ? ` · Activity from ${esc(args.first)} to ${esc(args.last)}` : ""
  } · Generated ${esc(new Date().toLocaleString())}</p>
<div class="kpis">${args.headline
    .map((k) => `<div class="kpi"><b>${esc(k.value)}</b><span>${esc(k.label)}</span></div>`)
    .join("")}</div>
${args.tables.map(table).join("")}
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `wce-2026-report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  w.document.write(html);
  w.document.close();
}

export default function WceAnalytics() {
  const [range, setRange] = useState<RangeKey>("all");
  // Bumped every 30 seconds so the live panel and figures stay current.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setRefreshKey((n) => n + 1), 30000);
    return () => window.clearInterval(id);
  }, []);


  const [rows, setRows] = useState<Ev[]>([]);
  const [prevRows, setPrevRows] = useState<Ev[]>([]);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const lastRange = useRef<RangeKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Background refreshes must not blank the dashboard with a skeleton.
    const silent = lastRange.current === range;
    lastRange.current = range;
    if (!silent) setLoading(true);

    (async () => {
      const { start, days } = rangeWindow(range);
      // Fetch the current window plus the equal window before it, so every
      // headline figure can be shown against the previous period.
      const fetchFrom = start && days
        ? new Date(start.getTime() - days * 86400000)
        : null;

      let q = supabase
        .from("wce_page_events")
        .select("created_at,session_id,event_type,event_target,path,referrer,utm_source,utm_medium,utm_campaign,referral_code,device_type,country,meta")
        .order("created_at", { ascending: false })
        .limit(30000);
      if (fetchFrom) q = q.gte("created_at", fetchFrom.toISOString());

      let leadQ = supabase.from("wce_leads").select("id", { count: "exact", head: true });
      if (start) leadQ = leadQ.gte("created_at", start.toISOString());

      const [{ data, error }, leadRes] = await Promise.all([q, leadQ]);
      if (cancelled) return;
      if (error) wceToast({ title: "Could not load analytics", description: error.message, tone: "error" });

      const all = (data ?? []) as Ev[];
      if (start) {
        const cut = start.toISOString();
        setRows(all.filter((r) => r.created_at >= cut));
        setPrevRows(all.filter((r) => r.created_at < cut));
      } else {
        setRows(all);
        setPrevRows([]);
      }
      setLeadCount(leadRes.error ? null : leadRes.count ?? 0);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [range, refreshKey]);

  const d = useMemo(() => {
    const of = (t: string, source: Ev[] = rows) => source.filter((r) => r.event_type === t);
    const pageViews = of("page_view");
    const sectionViews = of("section_view");
    const ctaClicks = of("cta_click");
    const formStarts = of("form_start");
    const formSubmits = of("form_submit");
    const speakerOpens = of("speaker_open");
    const shares = of("flyer_share");

    // Visitors over time, bucketed by day.
    const byDay = new Map<string, { views: number; sessions: Set<string> }>();
    pageViews.forEach((r) => {
      const day = r.created_at.slice(0, 10);
      const entry = byDay.get(day) ?? { views: 0, sessions: new Set<string>() };
      entry.views += 1;
      entry.sessions.add(r.session_id);
      byDay.set(day, entry);
    });
    const overTime = [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, v]) => ({
        label: new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        views: v.views,
        visitors: v.sessions.size,
      }));

    const visitors = uniqueSessions(rows);

    // ---- Session-level quality metrics -------------------------------------
    const sessions = new Map<string, { first: number; last: number; events: number; deepest: number }>();
    rows.forEach((r) => {
      const t = new Date(r.created_at).getTime();
      const s = sessions.get(r.session_id) ?? { first: t, last: t, events: 0, deepest: -1 };
      s.first = Math.min(s.first, t);
      s.last = Math.max(s.last, t);
      s.events += 1;
      if (r.event_type === "section_view") {
        const idx = SECTIONS.findIndex((x) => x.id === r.event_target);
        if (idx > s.deepest) s.deepest = idx;
      }
      sessions.set(r.session_id, s);
    });
    const sessionList = [...sessions.values()];
    const medianTime = Math.round(median(sessionList.map((s) => Math.round((s.last - s.first) / 1000))));
    // A "bounce" is a session with a single recorded event — arrived and left.
    const bounces = sessionList.filter((s) => s.events <= 1).length;
    const engaged = sessionList.filter((s) => s.deepest >= 0 || s.events > 2).length;

    // Scroll depth: deepest section each session reached.
    const depth = SECTIONS.map((s, i) => ({
      name: s.label,
      value: sessionList.filter((x) => x.deepest >= i).length,
    }));

    const pathwaySectionSessions = new Set(
      sectionViews.filter((r) => r.event_target === "pathways").map((r) => r.session_id),
    ).size;

    const funnel = [
      { stage: "Page views", value: pageViews.length },
      { stage: "Pathway section seen", value: pathwaySectionSessions },
      { stage: "CTA clicks", value: ctaClicks.length },
      { stage: "Form starts", value: formStarts.length },
      { stage: "Form submits", value: formSubmits.length },
    ];

    const sectionReach = SECTIONS.map((s) => ({
      name: s.label,
      value: new Set(sectionViews.filter((r) => r.event_target === s.id).map((r) => r.session_id)).size,
    }));

    // ---- Campaign performance ---------------------------------------------
    // Grouped by the exact source / medium / campaign trio, with the actions
    // taken by those visitors, so spend can be judged per campaign.
    type Camp = { sessions: Set<string>; clicks: number; starts: number; submits: number };
    const campMap = new Map<string, Camp>();
    rows.forEach((r) => {
      const key = [sourceLabel(r), r.utm_medium ?? "—", r.utm_campaign ?? "—"].join(" | ");
      const c = campMap.get(key) ?? { sessions: new Set<string>(), clicks: 0, starts: 0, submits: 0 };
      c.sessions.add(r.session_id);
      if (r.event_type === "cta_click") c.clicks += 1;
      if (r.event_type === "form_start") c.starts += 1;
      if (r.event_type === "form_submit") c.submits += 1;
      campMap.set(key, c);
    });
    const campaigns = [...campMap.entries()]
      .map(([key, c]) => {
        const [source, medium, campaign] = key.split(" | ");
        return {
          key, source, medium, campaign,
          visitors: c.sessions.size,
          clicks: c.clicks,
          submits: c.submits,
          rate: pct(c.submits, c.sessions.size),
        };
      })
      .sort((a, b) => b.visitors - a.visitors);

    // ---- Demand mix --------------------------------------------------------
    const intents = countBy(ctaClicks, (r) => {
      const i = metaStr(r, "cta_intent");
      if (!i) return null;
      return i === "reserve" ? "Reserve seat" : i === "apply" ? "Apply for retreat" : i === "online" ? "Online access" : "Explore";
    });
    const pathwayInterest = countBy(ctaClicks, (r) => {
      const k = metaStr(r, "pathway_key");
      return k ? wcePathwayLabel(k) : null;
    });
    const applicationInterest = countBy(formSubmits, (r) => {
      const k = metaStr(r, "pathway_interest");
      return k ? wcePathwayLabel(k) : null;
    });
    const ctaLocations = countBy(ctaClicks, (r) => metaStr(r, "cta_location"));
    const shareChannels = countBy(shares, (r) => metaStr(r, "channel"));
    const landingPaths = countBy(pageViews, (r) => r.path);

    // ---- Best time to reach people ----------------------------------------
    const hours = Array.from({ length: 24 }, (_, h) => ({ name: `${h}:00`, value: 0 }));
    const weekdays = DAY_LABELS.map((name) => ({ name, value: 0 }));
    pageViews.forEach((r) => {
      const dt = new Date(r.created_at);
      hours[dt.getHours()].value += 1;
      weekdays[dt.getDay()].value += 1;
    });

    // Referral codes: visits (unique sessions) and conversions (form submits).
    const codeMap = new Map<string, { sessions: Set<string>; conversions: number; clicks: number }>();
    rows.forEach((r) => {
      if (!r.referral_code) return;
      const entry = codeMap.get(r.referral_code) ?? { sessions: new Set<string>(), conversions: 0, clicks: 0 };
      entry.sessions.add(r.session_id);
      if (r.event_type === "form_submit") entry.conversions += 1;
      if (r.event_type === "cta_click") entry.clicks += 1;
      codeMap.set(r.referral_code, entry);
    });
    const referralCodes = [...codeMap.entries()]
      .map(([code, v]) => ({
        code, visits: v.sessions.size, clicks: v.clicks, conversions: v.conversions,
        rate: pct(v.conversions, v.sessions.size),
      }))
      .sort((a, b) => b.visits - a.visits);

    const speakerEngagement = [...new Set([...speakerOpens, ...shares].map((r) => r.event_target ?? "—"))]
      .map((slug) => ({
        name: slug,
        opens: speakerOpens.filter((r) => r.event_target === slug).length,
        shares: shares.filter((r) => r.event_target === slug).length,
      }))
      .sort((a, b) => b.opens + b.shares - (a.opens + a.shares));

    // ---- Who is on the page right now --------------------------------------
    const now = Date.now();
    const liveRows = rows.filter((r) => now - new Date(r.created_at).getTime() <= 5 * 60 * 1000);
    const last30Rows = rows.filter((r) => now - new Date(r.created_at).getTime() <= 30 * 60 * 1000);
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const todayRows = rows.filter((r) => new Date(r.created_at) >= startOfToday);

    // One line per active visitor: where they are, what they are on, how long ago.
    const liveMap = new Map<string, Ev[]>();
    liveRows.forEach((r) => {
      const list = liveMap.get(r.session_id) ?? [];
      list.push(r);
      liveMap.set(r.session_id, list);
    });
    const liveVisitorRows = [...liveMap.entries()]
      .map(([session, evs]) => {
        const sorted = [...evs].sort((a, b) => a.created_at.localeCompare(b.created_at));
        const latest = sorted[sorted.length - 1];
        return {
          session,
          country: latest.country ? countryName(latest.country) : "Unknown",
          device: DEVICE_LABELS[latest.device_type ?? ""] ?? latest.device_type ?? "—",
          source: sourceLabel(latest),
          path: latest.path ?? "/wce-2026",
          events: evs.length,
          minutesAgo: Math.max(0, Math.round((now - new Date(latest.created_at).getTime()) / 60000)),
        };
      })
      .sort((a, b) => a.minutesAgo - b.minutesAgo);

    // Previous-period comparisons for the headline cards.
    const prev = prevRows.length || rows.length
      ? {
          visitors: uniqueSessions(prevRows),
          views: of("page_view", prevRows).length,
          clicks: of("cta_click", prevRows).length,
          submits: of("form_submit", prevRows).length,
        }
      : null;

    const deviceVisitors = sessionsBy(rows, (r) => DEVICE_LABELS[r.device_type ?? ""] ?? r.device_type);
    const locationVisitors = sessionsBy(rows, (r) => (r.country ? countryName(r.country) : null));
    const unknownLocation = uniqueSessions(rows.filter((r) => !r.country));
    const timezones = sessionsBy(rows, (r) => metaStr(r, "tz"));
    const languages = sessionsBy(rows, (r) => {
      const l = metaStr(r, "lang");
      return l ? l.toLowerCase() : null;
    });

    return {
      pageViews, visitors, ctaClicks, formStarts, formSubmits, overTime, funnel,
      sources: countBy(pageViews, sourceLabel),
      channels: countBy(pageViews, channelOf),

      devices: countBy(rows, (r) => r.device_type),
      countries: countBy(rows, (r) => r.country),
      deviceVisitors, locationVisitors, unknownLocation, timezones, languages,
      liveVisitors: liveMap.size,
      liveVisitorRows,
      last30: uniqueSessions(last30Rows),
      todayVisitors: uniqueSessions(todayRows),
      todayViews: todayRows.filter((r) => r.event_type === "page_view").length,
      leaderboard: countBy(ctaClicks, (r) => r.event_target),
      sectionReach, referralCodes, speakerEngagement,
      faqOpens: countBy(of("faq_open"), (r) => r.event_target),
      cardExpands: countBy(of("retreat_card_expand"), (r) => r.event_target),
      campaigns, intents, pathwayInterest, applicationInterest, ctaLocations,
      shareChannels, landingPaths, hours, weekdays, depth,
      medianTime, bounces, engaged,
      clickThrough: pct(new Set(ctaClicks.map((r) => r.session_id)).size, visitors),
      startRate: pct(new Set(formStarts.map((r) => r.session_id)).size, visitors),
      completion: pct(formSubmits.length, Math.max(1, formStarts.length)),
      prev,
    };

  }, [rows, prevRows, refreshKey]);

  const maxFunnel = Math.max(1, ...d.funnel.map((f) => f.value));
  const hasData = rows.length > 0;
  const rangeLabel = RANGES.find((r) => r.key === range)?.label ?? "";
  const sessionsCount = new Set(rows.map((r) => r.session_id)).size;
  // Rows arrive newest-first, so the window bounds are the last and first entries.
  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : null);
  const firstSeen = rows.length ? fmt(rows[rows.length - 1].created_at) : null;
  const lastSeen = rows.length ? fmt(rows[0].created_at) : null;

  return (
    <div>
      <SectionHeading
        title="Analytics"
        sub="Visitor and click activity captured directly on the WCE 2026 page."
      />

      <p className="wa-muted" style={{ fontSize: "0.8rem", marginBottom: "1rem", maxWidth: "70ch" }}>
        This is first-party data collected on the Caribbean Wellness Experience page only. It is recorded by
        our own system with no personal identifiers and no IP addresses, so figures will differ slightly from
        Google Analytics — ad blockers and privacy settings affect the two differently. "All time" covers every
        visit since tracking went live on the page.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`wa-btn ${range === r.key ? "wa-btn-primary" : "wa-btn-ghost"}`}
            onClick={() => setRange(r.key)}
            aria-pressed={range === r.key}
          >
            {r.label}
          </button>
        ))}
        <button
          type="button"
          className="wa-btn wa-btn-primary"
          onClick={() => openReport({
            rangeLabel,
            first: firstSeen,
            last: lastSeen,
            headline: [
              { label: "Visitors on the page now", value: String(d.liveVisitors) },
              { label: "Visitors today", value: String(d.todayVisitors) },
              { label: "Visitors", value: String(d.visitors) },
              { label: "Page views", value: String(d.pageViews.length) },
              { label: "CTA clicks", value: String(d.ctaClicks.length) },
              { label: "Applications started", value: String(d.formStarts.length) },
              { label: "Applications submitted", value: String(d.formSubmits.length) },
              { label: "Click-through rate", value: `${d.clickThrough.toFixed(1)}%` },
              { label: "Typical time on page", value: durationText(d.medianTime) },
              { label: "Leads recorded", value: leadCount === null ? "—" : String(leadCount) },
            ],
            tables: [
              { title: "Visitors on the page in the last 5 minutes", head: ["Location", "Device", "Came from", "Page", "Last seen"], rows: d.liveVisitorRows.map((v) => [v.country, v.device, v.source, v.path, v.minutesAgo === 0 ? "just now" : `${v.minutesAgo} min ago`]) },
              { title: "Where visitors are (unique visitors)", head: ["Location", "Visitors", "Share"], rows: [...d.locationVisitors.map((s) => [s.name, s.value, pctText(s.value, Math.max(1, d.visitors))]), ...(d.unknownLocation ? [["Unknown", d.unknownLocation, pctText(d.unknownLocation, Math.max(1, d.visitors))] as (string | number)[]] : [])] },
              { title: "Devices (unique visitors)", head: ["Device", "Visitors", "Share"], rows: d.deviceVisitors.map((s) => [s.name, s.value, pctText(s.value, Math.max(1, d.visitors))]) },
              { title: "Visitor time zones", head: ["Time zone", "Visitors"], rows: d.timezones.slice(0, 15).map((s) => [s.name, s.value]) },
              { title: "Visitor languages", head: ["Language", "Visitors"], rows: d.languages.slice(0, 12).map((s) => [s.name, s.value]) },
              { title: "Journey funnel", head: ["Stage", "Count"], rows: d.funnel.map((f) => [f.stage, f.value]) },
              { title: "Acquisition channels", head: ["Channel", "Page views"], rows: d.channels.map((c) => [c.name, c.value]) },
              { title: "Traffic sources", head: ["Source", "Page views"], rows: d.sources.map((c) => [c.name, c.value]) },
              { title: "Campaign performance", head: ["Source", "Medium", "Campaign", "Visitors", "Clicks", "Applications", "Conv. rate"], rows: d.campaigns.map((c) => [c.source, c.medium, c.campaign, c.visitors, c.clicks, c.submits, `${c.rate.toFixed(1)}%`]) },
              { title: "Section reach (visitors)", head: ["Section", "Visitors"], rows: d.sectionReach.map((s) => [s.name, s.value]) },
              { title: "Most clicked calls to action", head: ["Label", "Clicks"], rows: d.leaderboard.map((s) => [s.name, s.value]) },
              { title: "Pathway interest", head: ["Pathway", "Clicks"], rows: d.pathwayInterest.map((s) => [s.name, s.value]) },
              { title: "Speaker engagement", head: ["Speaker", "Flyer opens", "Shares"], rows: d.speakerEngagement.map((s) => [s.name, s.opens, s.shares]) },
              { title: "Referral codes", head: ["Code", "Visits", "Clicks", "Applications", "Conv. rate"], rows: d.referralCodes.map((s) => [s.code, s.visits, s.clicks, s.conversions, `${s.rate.toFixed(1)}%`]) },
              { title: "Search and share readiness (SEO)", head: ["Check", "Status"], rows: SEO_CHECKS.map((s) => [s.item, s.value]) },
            ],

          })}
          disabled={!hasData}
          style={{ marginLeft: "auto" }}
        >
          <FileText className="h-4 w-4" aria-hidden /> Generate report
        </button>
        <button
          type="button"
          className="wa-btn wa-btn-ghost"
          onClick={() => downloadCsv(rows)}
          disabled={!hasData}
        >
          <Download className="h-4 w-4" aria-hidden /> Export CSV
        </button>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : !hasData ? (
        <EmptyState
          title="No activity recorded yet"
          line="Visits to the WCE 2026 page appear here within a minute of arriving. Visitors who switch on Do Not Track are never recorded."
        />

      ) : (
        <div style={{ display: "grid", gap: "0.85rem" }}>
          {/* Who is on the page right now — refreshes every 30 seconds. */}
          <div className="wa-stats" style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
            <StatCard label="On the page now" value={d.liveVisitors} accent="gold" hint="Visitors active in the last 5 minutes" />
            <StatCard label="Last 30 minutes" value={d.last30} accent="teal" hint="Visitors seen in the past half hour" />
            <StatCard label="Visitors today" value={d.todayVisitors} accent="sage" hint="Unique visitors since midnight" />
            <StatCard label="Page views today" value={d.todayViews} accent="terracotta" />
          </div>

          <Panel
            title="Live visitors · last 5 minutes"
            hint="Each row is one anonymous browsing session, with its location, device and referring source. Refreshes automatically every 30 seconds."
          >
            {d.liveVisitorRows.length ? (
              <div className="wa-table-wrap">
                <table className="wa-table">
                  <thead>
                    <tr><th>Location</th><th>Device</th><th>Came from</th><th>Page</th><th>Events</th><th>Last seen</th></tr>
                  </thead>
                  <tbody>
                    {d.liveVisitorRows.slice(0, 25).map((v) => (
                      <tr key={v.session}>
                        <td data-label="Location">{v.country}</td>
                        <td data-label="Device">{v.device}</td>
                        <td data-label="Came from">{v.source}</td>
                        <td data-label="Page">{v.path}</td>
                        <td data-label="Events">{v.events}</td>
                        <td data-label="Last seen">{v.minutesAgo === 0 ? "just now" : `${v.minutesAgo} min ago`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="wa-muted" style={{ fontSize: "0.8rem" }}>
                Nobody is on the page at this moment. This list fills in as visitors arrive.
              </p>
            )}
          </Panel>

          {/* Where visitors are, and what they browse on. */}
          <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <Panel title={`Where visitors are · ${rangeLabel}`} hint="Unique visitors by country, from the network edge or the browser time zone. No IP address is ever stored.">
              {d.locationVisitors.length || d.unknownLocation ? (
                <div className="wa-table-wrap">
                  <table className="wa-table">
                    <thead><tr><th>Location</th><th>Visitors</th><th>Share</th></tr></thead>
                    <tbody>
                      {d.locationVisitors.slice(0, 12).map((c) => (
                        <tr key={c.name}>
                          <td data-label="Location">{c.name}</td>
                          <td data-label="Visitors">{c.value}</td>
                          <td data-label="Share">{pctText(c.value, Math.max(1, d.visitors))}</td>
                        </tr>
                      ))}
                      {d.unknownLocation > 0 && (
                        <tr>
                          <td data-label="Location">Unknown</td>
                          <td data-label="Visitors">{d.unknownLocation}</td>
                          <td data-label="Share">{pctText(d.unknownLocation, Math.max(1, d.visitors))}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No location data yet.</p>
              )}
            </Panel>

            <Panel title={`Devices · ${rangeLabel}`} hint="Unique visitors by device class — mobile, tablet or desktop.">
              {d.deviceVisitors.length ? (
                <>
                  <div style={{ height: 200, width: "100%", minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={d.deviceVisitors} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                          {d.deviceVisitors.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: 11, color: "#F5EFE0" }} />
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="wa-table-wrap">
                    <table className="wa-table">
                      <thead><tr><th>Device</th><th>Visitors</th><th>Share</th></tr></thead>
                      <tbody>
                        {d.deviceVisitors.map((s) => (
                          <tr key={s.name}>
                            <td data-label="Device">{s.name}</td>
                            <td data-label="Visitors">{s.value}</td>
                            <td data-label="Share">{pctText(s.value, Math.max(1, d.visitors))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No device data yet.</p>
              )}
            </Panel>

            <Panel title="Visitor time zones" hint="Useful for scheduling posts, emails and the livestream start time.">
              {d.timezones.length ? (
                <div className="wa-table-wrap">
                  <table className="wa-table">
                    <thead><tr><th>Time zone</th><th>Visitors</th></tr></thead>
                    <tbody>
                      {d.timezones.slice(0, 10).map((s) => (
                        <tr key={s.name}>
                          <td data-label="Time zone">{s.name}</td>
                          <td data-label="Visitors">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>Time zone data appears for visits recorded from now on.</p>
              )}
            </Panel>

            <Panel title="Visitor languages" hint="Browser language, handy for ad copy and translations.">
              {d.languages.length ? (
                <div className="wa-table-wrap">
                  <table className="wa-table">
                    <thead><tr><th>Language</th><th>Visitors</th></tr></thead>
                    <tbody>
                      {d.languages.slice(0, 10).map((s) => (
                        <tr key={s.name}>
                          <td data-label="Language">{s.name}</td>
                          <td data-label="Visitors">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>Language data appears for visits recorded from now on.</p>
              )}
            </Panel>
          </div>

          <div className="wa-stats" style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>

            <StatCard
              label="Visitors" value={d.visitors} accent="sage"
              hint="Unique browsing sessions"
              trend={trendOf(d.visitors, d.prev?.visitors ?? null)}
            />
            <StatCard
              label="Page views" value={d.pageViews.length} accent="gold"
              trend={trendOf(d.pageViews.length, d.prev?.views ?? null)}
            />
            <StatCard
              label="CTA clicks" value={d.ctaClicks.length} accent="teal"
              trend={trendOf(d.ctaClicks.length, d.prev?.clicks ?? null)}
            />
            <StatCard
              label="Applications submitted" value={d.formSubmits.length} accent="terracotta"
              trend={trendOf(d.formSubmits.length, d.prev?.submits ?? null)}
            />
          </div>

          {/* Quality of the traffic, not just its size. */}
          <div className="wa-stats" style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
            <StatCard label="Click-through rate" value={`${d.clickThrough.toFixed(1)}%`} accent="gold" hint="Visitors who clicked any call to action" />
            <StatCard label="Application rate" value={`${d.startRate.toFixed(1)}%`} accent="sage" hint="Visitors who began the application" />
            <StatCard label="Form completion" value={`${d.completion.toFixed(0)}%`} accent="teal" hint="Started applications that were submitted" />
            <StatCard label="Typical time on page" value={durationText(d.medianTime)} accent="terracotta" hint="Median engaged session length" />
            <StatCard label="Engaged visitors" value={`${pct(d.engaged, Math.max(1, sessionsCount)).toFixed(0)}%`} accent="sage" hint="Scrolled into the page or interacted" />
            <StatCard label="Left immediately" value={`${pct(d.bounces, Math.max(1, sessionsCount)).toFixed(0)}%`} accent="gold" hint="Sessions with a single recorded event" />
            <StatCard
              label={`Leads recorded · ${rangeLabel}`}
              value={leadCount === null ? "—" : leadCount}
              accent="teal"
              hint="Rows saved in the Leads table"
            />
          </div>

          <Panel title={`Visitors and page views · ${rangeLabel}`}>
            {d.overTime.length ? (
              <div style={{ height: 230, width: "100%", minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={d.overTime} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                    <defs>
                      <linearGradient id="waViewFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENTS.gold.series} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={ACCENTS.gold.series} stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(245,239,224,0.08)" vertical={false} />
                    <XAxis dataKey="label" tick={axisTick} stroke={axisStroke} />
                    <YAxis allowDecimals={false} tick={axisTick} stroke={axisStroke} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#E4C766" }} />
                    <Area type="monotone" dataKey="views" name="Page views" stroke={ACCENTS.gold.series} strokeWidth={2} fill="url(#waViewFill)" />
                    <Area type="monotone" dataKey="visitors" name="Visitors" stroke={ACCENTS.sage.series} strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No page views in this range yet.</p>
            )}
          </Panel>

          {/* Funnel — horizontal so the drop-off between stages is obvious. */}
          <Panel title="Journey funnel" hint="Each stage counts the recorded events in the selected range.">
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {d.funnel.map((f, i) => {
                const prev = i > 0 ? d.funnel[i - 1].value : null;
                const drop = prev && prev > 0 ? Math.round(((prev - f.value) / prev) * 100) : null;
                return (
                  <div key={f.stage}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--wa-cream)" }}>
                      <span>{f.stage}</span>
                      <span>
                        {f.value}
                        {drop !== null && drop > 0 && (
                          <span className="wa-muted" style={{ marginLeft: "0.5rem", fontSize: "0.72rem" }}>−{drop}%</span>
                        )}
                      </span>
                    </div>
                    <div style={{ height: 12, background: "rgba(245,239,224,0.08)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.max(2, (f.value / maxFunnel) * 100)}%`,
                          height: "100%",
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Campaign performance — the table a marketer judges spend with. */}
          <Panel
            title="Campaign performance"
            hint="Grouped by campaign source, medium and name. Tag your links with utm_source, utm_medium and utm_campaign to see them split here."
          >
            <div className="wa-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Source</th><th>Medium</th><th>Campaign</th>
                    <th>Visitors</th><th>CTA clicks</th><th>Applications</th><th>Conv. rate</th>
                  </tr>
                </thead>
                <tbody>
                  {d.campaigns.slice(0, 15).map((c) => (
                    <tr key={c.key}>
                      <td data-label="Source">{c.source}</td>
                      <td data-label="Medium">{c.medium}</td>
                      <td data-label="Campaign">{c.campaign}</td>
                      <td data-label="Visitors">{c.visitors}</td>
                      <td data-label="CTA clicks">{c.clicks}</td>
                      <td data-label="Applications">{c.submits}</td>
                      <td data-label="Conv. rate">{c.rate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <Panel title="Acquisition channels" hint="Organic search, social, email, paid, referral or direct.">
              {d.channels.length ? (
                <div style={{ height: 240, width: "100%", minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.channels} layout="vertical" margin={{ left: 4, right: 12 }}>
                      <CartesianGrid stroke="rgba(245,239,224,0.08)" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={axisTick} stroke={axisStroke} />
                      <YAxis type="category" dataKey="name" width={110} tick={axisTick} stroke={axisStroke} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#E4C766" }} />
                      <Bar dataKey="value" name="Views" radius={[0, 2, 2, 0]}>
                        {d.channels.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No channel data yet.</p>
              )}
            </Panel>

            <Panel title="Search and share readiness" hint="Head data and structured markup currently published on the WCE 2026 page.">
              <div className="wa-table-wrap">
                <table className="wa-table">
                  <tbody>
                    {SEO_CHECKS.map((s) => (
                      <tr key={s.item}>
                        <th scope="row" style={{ whiteSpace: "nowrap" }}>{s.item}</th>
                        <td data-label={s.item}>{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>

            <Panel title="Traffic sources" hint="Campaign source where tagged, otherwise the referring site or direct.">
              {d.sources.length ? (
                <div style={{ height: 240, width: "100%", minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.sources.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 12 }}>
                      <CartesianGrid stroke="rgba(245,239,224,0.08)" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={axisTick} stroke={axisStroke} />
                      <YAxis type="category" dataKey="name" width={96} tick={axisTick} stroke={axisStroke} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#E4C766" }} />
                      <Bar dataKey="value" name="Views" radius={[0, 2, 2, 0]}>
                        {d.sources.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No sources recorded yet.</p>
              )}
            </Panel>


            <Panel title="Section reach" hint="How many visitors scrolled far enough to see each section.">
              <div style={{ height: 280, width: "100%", minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.sectionReach} layout="vertical" margin={{ left: 4, right: 12 }}>
                    <CartesianGrid stroke="rgba(245,239,224,0.08)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={axisTick} stroke={axisStroke} />
                    <YAxis type="category" dataKey="name" width={110} tick={axisTick} stroke={axisStroke} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#E4C766" }} />
                    <Bar dataKey="value" name="Visitors" fill={ACCENTS.teal.series} radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Scroll depth" hint="Visitors who reached at least this far down the page — where attention is lost.">
              <div style={{ height: 280, width: "100%", minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.depth} layout="vertical" margin={{ left: 4, right: 12 }}>
                    <CartesianGrid stroke="rgba(245,239,224,0.08)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={axisTick} stroke={axisStroke} />
                    <YAxis type="category" dataKey="name" width={110} tick={axisTick} stroke={axisStroke} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#E4C766" }} />
                    <Bar dataKey="value" name="Visitors reaching" fill={ACCENTS.terracotta.series} radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Demand mix" hint="What visitors clicked towards: attending in person, online access, or the retreat.">
              {d.intents.length || d.pathwayInterest.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Interest</th><th>Clicks</th><th>Share</th></tr></thead>
                    <tbody>
                      {[...d.pathwayInterest, ...d.intents].slice(0, 10).map((r) => (
                        <tr key={r.name}>
                          <td data-label="Interest">{r.name}</td>
                          <td data-label="Clicks">{r.value}</td>
                          <td data-label="Share">{pctText(r.value, Math.max(1, d.ctaClicks.length))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No pathway clicks in this range yet.</p>
              )}
            </Panel>

            <Panel title="Where CTAs are clicked" hint="The zone of the page each click came from — tells you which placements earn their space.">
              {d.ctaLocations.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Placement</th><th>Clicks</th></tr></thead>
                    <tbody>
                      {d.ctaLocations.map((c) => (
                        <tr key={c.name}>
                          <td data-label="Placement">{c.name.replace(/_/g, " ")}</td>
                          <td data-label="Clicks">{c.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No placement data in this range yet.</p>
              )}
            </Panel>

            <Panel title="Busiest hours" hint="Local time of the browser reading this page. Useful for timing posts and emails.">
              <div style={{ height: 220, width: "100%", minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.hours} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="rgba(245,239,224,0.08)" vertical={false} />
                    <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 9 }} stroke={axisStroke} interval={2} />
                    <YAxis allowDecimals={false} tick={axisTick} stroke={axisStroke} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#E4C766" }} />
                    <Bar dataKey="value" name="Page views" fill={ACCENTS.gold.series} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Busiest days of the week">
              <div style={{ height: 220, width: "100%", minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.weekdays} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="rgba(245,239,224,0.08)" vertical={false} />
                    <XAxis dataKey="name" tick={axisTick} stroke={axisStroke} />
                    <YAxis allowDecimals={false} tick={axisTick} stroke={axisStroke} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#E4C766" }} />
                    <Bar dataKey="value" name="Page views" fill={ACCENTS.sage.series} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <Panel title="Click leaderboard" hint="Every tracked call to action, ranked by clicks.">
            {d.leaderboard.length ? (
              <div className="wa-table-wrap">
                <table>
                  <thead><tr><th>Call to action</th><th>Clicks</th></tr></thead>
                  <tbody>
                    {d.leaderboard.map((c) => (
                      <tr key={c.name}><td data-label="Call to action">{c.name}</td><td data-label="Clicks">{c.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No call-to-action clicks in this range yet.</p>
            )}
          </Panel>

          <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <Panel title="Speaker engagement" hint="Flyers opened and shared, by speaker.">
              {d.speakerEngagement.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Speaker</th><th>Opens</th><th>Shares</th></tr></thead>
                    <tbody>
                      {d.speakerEngagement.map((s) => (
                        <tr key={s.name}>
                          <td data-label="Speaker">{s.name}</td>
                          <td data-label="Opens">{s.opens}</td>
                          <td data-label="Shares">{s.shares}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No speaker flyers opened in this range yet.</p>
              )}
            </Panel>

            <Panel title="Share channels" hint="Where visitors sent the flyers — your strongest word-of-mouth channel.">
              {d.shareChannels.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Channel</th><th>Shares</th></tr></thead>
                    <tbody>
                      {d.shareChannels.map((c) => (
                        <tr key={c.name}><td data-label="Channel">{c.name}</td><td data-label="Shares">{c.value}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No flyers shared in this range yet.</p>
              )}
            </Panel>

            <Panel title="Referral code performance" hint="Visits are unique sessions carrying the code; conversions are submitted applications.">
              {d.referralCodes.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Code</th><th>Visits</th><th>Clicks</th><th>Conversions</th><th>Rate</th></tr></thead>
                    <tbody>
                      {d.referralCodes.map((r) => (
                        <tr key={r.code}>
                          <td data-label="Code">{r.code}</td>
                          <td data-label="Visits">{r.visits}</td>
                          <td data-label="Clicks">{r.clicks}</td>
                          <td data-label="Conversions">{r.conversions}</td>
                          <td data-label="Rate">{r.rate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No traffic has arrived on a referral code yet.</p>
              )}
            </Panel>

            <Panel title="Applications by pathway" hint="What submitted applicants asked for.">
              {d.applicationInterest.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Pathway</th><th>Applications</th></tr></thead>
                    <tbody>
                      {d.applicationInterest.map((r) => (
                        <tr key={r.name}><td data-label="Pathway">{r.name}</td><td data-label="Applications">{r.value}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No applications submitted in this range yet.</p>
              )}
            </Panel>

            <Panel title="Landing pages" hint="Speaker flyer links and share links each land on their own path.">
              {d.landingPaths.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Path</th><th>Views</th></tr></thead>
                    <tbody>
                      {d.landingPaths.slice(0, 12).map((c) => (
                        <tr key={c.name}><td data-label="Path">{c.name}</td><td data-label="Views">{c.value}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No landing paths recorded yet.</p>
              )}
            </Panel>

            <Panel title="Most opened questions and cards">
              {d.faqOpens.length || d.cardExpands.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Item</th><th>Opens</th></tr></thead>
                    <tbody>
                      {[...d.cardExpands, ...d.faqOpens].slice(0, 12).map((c) => (
                        <tr key={c.name}><td data-label="Item">{c.name}</td><td data-label="Opens">{c.value}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No questions or retreat cards opened in this range yet.</p>
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
