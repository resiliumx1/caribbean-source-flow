import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";
import { inputCls } from "./shared";
import { StatCard, StatusPill, EmptyState, SectionHeading, ACCENTS } from "./ui";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

const STATUSES = ["new", "contacted", "qualified", "accepted", "declined"] as const;
type Status = (typeof STATUSES)[number];

type Lead = {
  id: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  country: string | null;
  pathway_interest: string | null;
  reason: string | null;
  preferred_contact: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referral_code: string | null;
  landing_path: string | null;
  referrer: string | null;
  consent_marketing: boolean;
  status: string;
  notes: string | null;
};

function csv(v: unknown) {
  if (v === null || v === undefined) return "";
  return `"${String(v).replace(/"/g, '""')}"`;
}

export default function WceLeads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [pathwayFilter, setPathwayFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wce_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load leads", description: error.message, variant: "destructive" });
    setLeads((data ?? []) as Lead[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sources = useMemo(
    () => Array.from(new Set(leads.map((l) => l.utm_source || "direct"))).sort(),
    [leads]
  );
  const pathways = useMemo(
    () => Array.from(new Set(leads.map((l) => l.pathway_interest).filter(Boolean) as string[])).sort(),
    [leads]
  );

  const filtered = leads.filter(
    (l) =>
      (statusFilter === "all" || l.status === statusFilter) &&
      (sourceFilter === "all" || (l.utm_source || "direct") === sourceFilter) &&
      (pathwayFilter === "all" || l.pathway_interest === pathwayFilter)
  );

  const bySource = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of leads) {
      const k = l.utm_source || "direct";
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  /** Leads per day for the last 30 days. */
  const overTime = useMemo(() => {
    const days: { date: string; label: string; leads: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        leads: 0,
      });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    for (const l of leads) {
      const key = new Date(l.created_at).toISOString().slice(0, 10);
      const i = idx.get(key);
      if (i !== undefined) days[i].leads += 1;
    }
    return days;
  }, [leads]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const last7 = overTime.slice(-7).reduce((s, d) => s + d.leads, 0);
  const prev7 = overTime.slice(-14, -7).reduce((s, d) => s + d.leads, 0);
  const trendDir = last7 > prev7 ? "up" : last7 < prev7 ? "down" : "flat";
  const qualified = (counts.qualified ?? 0) + (counts.accepted ?? 0);
  const conversion = leads.length ? Math.round((qualified / leads.length) * 100) : 0;
  const sourceSeries = [ACCENTS.gold.series, ACCENTS.sage.series, ACCENTS.teal.series, ACCENTS.terracotta.series];

  const patch = async (id: string, values: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...values } : l)));
    const { error } = await supabase.from("wce_leads").update(values).eq("id", id);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
  };

  const exportCsv = () => {
    const cols: (keyof Lead)[] = [
      "created_at", "full_name", "email", "whatsapp", "country", "pathway_interest",
      "preferred_contact", "reason", "status", "notes", "referral_code",
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "landing_path", "referrer", "consent_marketing",
    ];
    const rows = [cols.join(","), ...filtered.map((l) => cols.map((c) => csv(l[c])).join(","))];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `wce-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--wa-gold)" }} />;

  return (
    <div className="space-y-5">
      <SectionHeading title="Leads" sub="Applications from the /wce-2026 landing page, with campaign attribution." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total leads" value={leads.length} accent="sage"
          trend={{ direction: trendDir as any, text: `${last7} in the last 7 days` }} />
        <StatCard label="Qualified & accepted" value={qualified} accent="gold" hint="Ready for the team" />
        <StatCard label="Conversion" value={`${conversion}%`} accent="teal" hint="Of all leads received" />
        <StatCard label="Needs attention" value={counts.new ?? 0} accent="terracotta" hint="Still marked new" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="wa-panel">
          <p className="wa-label" style={{ marginBottom: "0.6rem" }}>Leads over time · 30 days</p>
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overTime} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="waLeadFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENTS.sage.series} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={ACCENTS.sage.series} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(245,239,224,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "rgba(245,239,224,0.6)", fontSize: 10 }}
                  interval={4} stroke="rgba(201,162,39,0.3)" />
                <YAxis allowDecimals={false} tick={{ fill: "rgba(245,239,224,0.6)", fontSize: 10 }}
                  stroke="rgba(201,162,39,0.3)" />
                <Tooltip
                  contentStyle={{ background: "#0F2A1D", border: "1px solid rgba(201,162,39,0.4)", color: "#F5EFE0", fontSize: 12 }}
                  labelStyle={{ color: "#E4C766" }}
                />
                <Area type="monotone" dataKey="leads" stroke={ACCENTS.sage.series} strokeWidth={2}
                  fill="url(#waLeadFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="wa-panel">
          <p className="wa-label" style={{ marginBottom: "0.6rem" }}>Leads by UTM source</p>
          {bySource.length === 0 ? (
            <EmptyState title="No attribution yet" line="Campaign sources appear here once leads arrive." />
          ) : (
            <div style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bySource.slice(0, 6).map(([source, leads]) => ({ source, leads }))}
                  layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
                  <CartesianGrid stroke="rgba(245,239,224,0.08)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false}
                    tick={{ fill: "rgba(245,239,224,0.6)", fontSize: 10 }} stroke="rgba(201,162,39,0.3)" />
                  <YAxis type="category" dataKey="source" width={78}
                    tick={{ fill: "rgba(245,239,224,0.75)", fontSize: 10 }} stroke="rgba(201,162,39,0.3)" />
                  <Tooltip
                    contentStyle={{ background: "#0F2A1D", border: "1px solid rgba(201,162,39,0.4)", color: "#F5EFE0", fontSize: 12 }}
                    labelStyle={{ color: "#E4C766" }}
                  />
                  <Bar dataKey="leads" radius={[0, 3, 3, 0]}>
                    {bySource.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={sourceSeries[i % sourceSeries.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className={inputCls + " max-w-[170px]"} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={inputCls + " max-w-[170px]"} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="all">All sources</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={inputCls + " max-w-[200px]"} value={pathwayFilter} onChange={(e) => setPathwayFilter(e.target.value)}>
          <option value="all">All pathways</option>
          {pathways.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button type="button" className="wa-btn wa-btn-primary" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="wa-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Country</th>
              <th>Pathway</th>
              <th>Source</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <EmptyState title="No leads to show" line="Adjust the filters, or share the landing page to start gathering applications." />
                </td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id}>
                <td data-label="Date" className="whitespace-nowrap text-xs">
                  {new Date(l.created_at).toLocaleDateString()}
                </td>
                <td data-label="Name" className="wa-strong">{l.full_name || "—"}</td>
                <td data-label="Contact" className="text-xs">
                  <div>{l.email || "—"}</div>
                  <div>{l.whatsapp || ""}</div>
                </td>
                <td data-label="Country" className="text-xs">{l.country || "—"}</td>
                <td data-label="Pathway" className="text-xs">{l.pathway_interest || "—"}</td>
                <td data-label="Source" className="text-xs">{l.utm_source || "direct"}</td>
                <td data-label="Status">
                  <div style={{ marginBottom: "0.35rem" }}><StatusPill status={l.status} /></div>
                  <select
                    aria-label="Change lead status"
                    className="min-w-[130px]"
                    value={l.status}
                    onChange={(e) => patch(l.id, { status: e.target.value })}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td data-label="Notes">
                  <textarea
                    aria-label="Lead notes"
                    className="min-w-[200px]"
                    rows={2}
                    defaultValue={l.notes ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (l.notes ?? "")) patch(l.id, { notes: e.target.value });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}