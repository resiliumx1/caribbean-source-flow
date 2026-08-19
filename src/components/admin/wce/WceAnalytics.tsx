/** First-party analytics for the /wce-2026 landing page.
 *  Reads public.wce_page_events, which is written only by the wce-track edge
 *  function and readable only by admins and organisers. No personal data. */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie, Legend,
} from "recharts";
import { ACCENTS, SectionHeading, StatCard, EmptyState } from "./ui";
import { StatsSkeleton, wceToast, InfoTip } from "./kit";

type Ev = {
  created_at: string;
  session_id: string;
  event_type: string;
  event_target: string | null;
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

function rangeStart(key: RangeKey): string | null {
  if (key === "all") return null;
  const d = new Date();
  if (key === "today") d.setHours(0, 0, 0, 0);
  if (key === "7d") d.setDate(d.getDate() - 7);
  if (key === "30d") d.setDate(d.getDate() - 30);
  return d.toISOString();
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

export default function WceAnalytics() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [rows, setRows] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const start = rangeStart(range);
      let q = supabase
        .from("wce_page_events")
        .select("created_at,session_id,event_type,event_target,referrer,utm_source,utm_medium,utm_campaign,referral_code,device_type,country,meta")
        .order("created_at", { ascending: false })
        .limit(20000);
      if (start) q = q.gte("created_at", start);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) wceToast({ title: "Could not load analytics", description: error.message, tone: "error" });
      setRows((data ?? []) as Ev[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [range]);

  const d = useMemo(() => {
    const of = (t: string) => rows.filter((r) => r.event_type === t);
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

    // Referral codes: visits (unique sessions) and conversions (form submits).
    const codeMap = new Map<string, { sessions: Set<string>; conversions: number }>();
    rows.forEach((r) => {
      if (!r.referral_code) return;
      const entry = codeMap.get(r.referral_code) ?? { sessions: new Set<string>(), conversions: 0 };
      entry.sessions.add(r.session_id);
      if (r.event_type === "form_submit") entry.conversions += 1;
      codeMap.set(r.referral_code, entry);
    });
    const referralCodes = [...codeMap.entries()]
      .map(([code, v]) => ({ code, visits: v.sessions.size, conversions: v.conversions }))
      .sort((a, b) => b.visits - a.visits);

    const speakerEngagement = SECTIONS.length
      ? [...new Set([...speakerOpens, ...shares].map((r) => r.event_target ?? "—"))].map((slug) => ({
          name: slug,
          opens: speakerOpens.filter((r) => r.event_target === slug).length,
          shares: shares.filter((r) => r.event_target === slug).length,
        })).sort((a, b) => b.opens + b.shares - (a.opens + a.shares))
      : [];

    return {
      pageViews,
      visitors: uniqueSessions(rows),
      ctaClicks,
      formSubmits,
      overTime,
      funnel,
      sources: countBy(pageViews, sourceLabel),
      devices: countBy(rows, (r) => r.device_type),
      countries: countBy(rows, (r) => r.country),
      leaderboard: countBy(ctaClicks, (r) => r.event_target),
      sectionReach,
      referralCodes,
      speakerEngagement,
      faqOpens: countBy(of("faq_open"), (r) => r.event_target),
      cardExpands: countBy(of("retreat_card_expand"), (r) => r.event_target),
    };
  }, [rows]);

  const maxFunnel = Math.max(1, ...d.funnel.map((f) => f.value));
  const hasData = rows.length > 0;

  return (
    <div>
      <SectionHeading
        title="Analytics"
        sub="Visitor and click activity captured directly on the WCE 2026 page."
      />

      <p className="wa-muted" style={{ fontSize: "0.8rem", marginBottom: "1rem", maxWidth: "70ch" }}>
        This is first-party data collected on the Caribbean Wellness Experience page only. It is recorded by
        our own system with no personal identifiers and no IP addresses, so figures will differ slightly from
        Google Analytics — ad blockers and privacy settings affect the two differently.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
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
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : !hasData ? (
        <EmptyState
          title="No activity recorded yet"
          line="Visits to the WCE 2026 page will appear here within a minute of arriving. Visitors who decline cookies or use Do Not Track are never recorded."
        />
      ) : (
        <div style={{ display: "grid", gap: "0.85rem" }}>
          <div className="wa-stats" style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
            <StatCard label="Visitors" value={d.visitors} accent="sage" hint="Unique browsing sessions" />
            <StatCard label="Page views" value={d.pageViews.length} accent="gold" />
            <StatCard label="CTA clicks" value={d.ctaClicks.length} accent="teal" />
            <StatCard label="Applications submitted" value={d.formSubmits.length} accent="terracotta" />
          </div>

          <Panel title={`Visitors and page views · ${RANGES.find((r) => r.key === range)?.label}`}>
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

            <Panel title="Device split">
              {d.devices.length ? (
                <div style={{ height: 240, width: "100%", minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={d.devices} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                        {d.devices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 11, color: "#F5EFE0" }} />
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No device data recorded yet.</p>
              )}
            </Panel>

            <Panel title="Countries" hint="Derived from the network edge, never from an IP address we store.">
              {d.countries.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Country</th><th>Events</th></tr></thead>
                    <tbody>
                      {d.countries.slice(0, 12).map((c) => (
                        <tr key={c.name}><td data-label="Country">{c.name}</td><td data-label="Events">{c.value}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>Country is not being reported for this traffic.</p>
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

            <Panel title="Referral code performance" hint="Visits are unique sessions carrying the code; conversions are submitted applications.">
              {d.referralCodes.length ? (
                <div className="wa-table-wrap">
                  <table>
                    <thead><tr><th>Code</th><th>Visits</th><th>Conversions</th></tr></thead>
                    <tbody>
                      {d.referralCodes.map((r) => (
                        <tr key={r.code}>
                          <td data-label="Code">{r.code}</td>
                          <td data-label="Visits">{r.visits}</td>
                          <td data-label="Conversions">{r.conversions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="wa-muted" style={{ fontSize: "0.8rem" }}>No traffic has arrived on a referral code yet.</p>
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