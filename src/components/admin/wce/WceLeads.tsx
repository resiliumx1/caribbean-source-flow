import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Download, ListChecks, Loader2, RefreshCw } from "lucide-react";
import { inputCls } from "./shared";
import { StatCard, StatusPill, EmptyState, SectionHeading, ACCENTS, whenText } from "./ui";
import {
  wceToast, useSaveState, SaveBadge, TableSkeleton, StatsSkeleton, InfoTip, TipLabel,
  useConfirm, FilterBar, GuidedEmpty, useLastVisit,
} from "./kit";
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
  participation_notes: string | null;
  dietary_notes: string | null;
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
  /** Retreat application pipeline. Payment is only possible once approved. */
  application_status: string | null;
  approved_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
  checkout_sent_at: string | null;
  checkout_token_expires_at: string | null;
  paid_at: string | null;
  /** Mailchimp marketing-list sync state. */
  mailchimp_status: string | null;
  mailchimp_error: string | null;
  mailchimp_synced_at: string | null;
};

function csv(v: unknown) {
  if (v === null || v === undefined) return "";
  return `"${String(v).replace(/"/g, '""')}"`;
}

const MC_TONE: Record<string, string> = {
  synced: "accepted",
  synced_partial: "qualified",
  failed: "declined",
  skipped_no_consent: "new",
  skipped_not_configured: "new",
};

const MC_LABEL: Record<string, string> = {
  synced: "Synced",
  synced_partial: "Synced · fields missing",
  failed: "Failed",
  skipped_no_consent: "Not sent · no consent",
  skipped_not_configured: "Not configured",
};

/** Mailchimp sync state, with the error text visible on the row and a retry. */
function MailchimpCell({ lead, onChanged }: { lead: Lead; onChanged: (values: Partial<Lead>) => void }) {
  const [busy, setBusy] = useState(false);

  if (!lead.consent_marketing) {
    return <span className="wa-muted text-xs">Not sent · no consent</span>;
  }

  const status = lead.mailchimp_status ?? "pending";

  const retry = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("mailchimp-sync", {
      body: { action: "retry", lead_id: lead.id },
    });
    setBusy(false);
    const res = data as { ok?: boolean; status?: string; rejected?: string[]; error?: string | null } | null;
    if (error || !res?.ok) {
      wceToast({ title: "Mailchimp retry failed", description: res?.error ?? error?.message, tone: "error" });
    } else {
      wceToast({
        title: res.status === "synced" ? "Synced to Mailchimp" : `Mailchimp: ${res.status}`,
        description: res.rejected?.length ? `Fields missing in the audience: ${res.rejected.join(", ")}` : undefined,
        tone: res.status === "synced" ? "ok" : "error",
      });
    }
    onChanged({
      mailchimp_status: res?.status ?? "failed",
      mailchimp_error: res?.error ?? null,
      mailchimp_synced_at: res?.status?.startsWith("synced") ? new Date().toISOString() : null,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", minWidth: 150 }}>
      {status === "pending" ? (
        <span className="wa-muted text-xs">Pending</span>
      ) : (
        <span className="wa-pill" data-tone={MC_TONE[status] ?? "new"}>{MC_LABEL[status] ?? status}</span>
      )}
      {lead.mailchimp_synced_at && <span className="wa-muted text-xs">{whenText(lead.mailchimp_synced_at)}</span>}
      {lead.mailchimp_error && (
        <span className="text-xs" style={{ color: "#F2D98A", wordBreak: "break-word" }}>{lead.mailchimp_error}</span>
      )}
      <button type="button" className="wa-btn wa-btn-ghost wa-btn-sm" disabled={busy} onClick={retry}>
        {busy ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <RefreshCw className="h-3 w-3" aria-hidden />}{" "}
        Retry Mailchimp sync
      </button>
    </div>
  );
}

function LeadStatusCell({ lead, onChanged }: { lead: Lead; onChanged: (values: Partial<Lead>) => void }) {
  const { state, run } = useSaveState();
  const confirm = useConfirm();

  const change = async (next: string) => {
    if (next === "declined") {
      const ok = await confirm({
        title: "Decline this lead?",
        item: lead.full_name || lead.email || "this lead",
        confirmLabel: "Decline",
      });
      if (!ok) return;
    }
    const prev = lead.status;
    await run({
      label: "Status",
      optimistic: () => onChanged({ status: next }),
      write: async () => await supabase.from("wce_leads").update({ status: next }).eq("id", lead.id),
      rollback: () => onChanged({ status: prev }),
    });
  };

  return (
    <>
      <div style={{ marginBottom: "0.35rem" }}><StatusPill status={lead.status} /></div>
      <select
        aria-label="Change lead status"
        className="min-w-[130px]"
        value={lead.status}
        onChange={(e) => change(e.target.value)}
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div style={{ marginTop: "0.3rem" }}><SaveBadge state={state} /></div>
    </>
  );
}


/** Retreat application review. Approving is what mints the private, single-use
 *  payment link — nobody can pay before a human has approved them. */
function RetreatReviewCell({ lead, onChanged }: { lead: Lead; onChanged: (values: Partial<Lead>) => void }) {
  const confirm = useConfirm();
  const [busy, setBusy] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const status = lead.paid_at ? "paid" : lead.application_status || "new";

  const call = async (action: "reviewing" | "approve" | "decline" | "resend_link") => {
    if (action === "decline") {
      const ok = await confirm({
        title: "Decline this retreat application?",
        item: lead.full_name || lead.email || "this applicant",
        confirmLabel: "Decline",
      });
      if (!ok) return;
    }
    setBusy(action);
    const { data, error } = await supabase.functions.invoke("wce-retreat-approve", {
      body: { lead_id: lead.id, action },
    });
    setBusy(null);
    const res = data as { ok?: boolean; error?: string; application_status?: string; checkout_link?: string; email_sent?: boolean; email_error?: string | null } | null;
    if (error || !res?.ok) {
      wceToast({ title: "Could not update the application", description: res?.error ?? error?.message, tone: "error" });
      return;
    }
    onChanged({
      application_status: res.application_status ?? null,
      approved_at: res.application_status === "approved" ? new Date().toISOString() : lead.approved_at,
      declined_at: res.application_status === "declined" ? new Date().toISOString() : null,
    });
    if (res.checkout_link) setLink(res.checkout_link);
    wceToast({
      title:
        action === "decline" ? "Application declined"
        : action === "reviewing" ? "Marked as under review"
        : "Approved — payment link issued",
      description: res.email_sent
        ? "The applicant has been emailed."
        : res.email_error ?? "Email was not sent; share the link manually.",
      tone: res.email_sent || action === "reviewing" ? "ok" : "error",
    });
  };

  const Btn = ({ action, label }: { action: "reviewing" | "approve" | "decline" | "resend_link"; label: string }) => (
    <button type="button" className="wa-btn wa-btn-ghost wa-btn-sm" disabled={!!busy} onClick={() => call(action)}>
      {busy === action ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null} {label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 190 }}>
      <StatusPill status={status} />
      {status === "paid" ? (
        <span className="wa-muted text-xs">Paid {whenText(lead.paid_at!)}</span>
      ) : (
        <>
          {status !== "approved" && status !== "declined" && <Btn action="reviewing" label="Mark reviewing" />}
          {status !== "approved" && <Btn action="approve" label="Approve & send link" />}
          {status === "approved" && <Btn action="resend_link" label="Resend payment link" />}
          {status !== "declined" && <Btn action="decline" label="Decline" />}
        </>
      )}
      {lead.checkout_sent_at && status === "approved" && (
        <span className="wa-muted text-xs">
          Link sent {whenText(lead.checkout_sent_at)}
          {lead.checkout_token_expires_at ? ` · expires ${whenText(lead.checkout_token_expires_at)}` : ""}
        </span>
      )}
      {link && (
        <button
          type="button"
          className="wa-btn wa-btn-ghost wa-btn-sm"
          onClick={() => {
            void navigator.clipboard.writeText(link);
            wceToast({ title: "Payment link copied" });
          }}
        >
          <Copy className="h-3 w-3" aria-hidden /> Copy link
        </button>
      )}
    </div>
  );
}

export default function WceLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [pathwayFilter, setPathwayFilter] = useState("all");
  const lastVisit = useLastVisit("wce_leads");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wce_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) wceToast({ title: "Failed to load leads", description: error.message, tone: "error" });
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

  const patchLead = (id: string, values: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...values } : l)));
  };

  const patchNotes = async (id: string, notes: string) => {
    const prev = leads.find((l) => l.id === id)?.notes ?? "";
    patchLead(id, { notes });
    const { error } = await supabase.from("wce_leads").update({ notes }).eq("id", id);
    if (error) {
      patchLead(id, { notes: prev });
      wceToast({ title: "Notes could not be saved", description: error.message, tone: "error" });
    } else {
      wceToast({ title: "Notes saved" });
    }
  };

  const exportCsv = () => {
    const cols: (keyof Lead)[] = [
      "created_at", "full_name", "email", "whatsapp", "country", "pathway_interest",
      "preferred_contact", "reason", "status", "notes", "referral_code",
      "dietary_notes", "participation_notes",
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "landing_path", "referrer", "consent_marketing",
      "application_status", "approved_at", "declined_at", "checkout_sent_at", "paid_at",
      "mailchimp_status", "mailchimp_synced_at", "mailchimp_error",
    ];
    const rows = [cols.join(","), ...filtered.map((l) => cols.map((c) => csv(l[c])).join(","))];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `wce-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFilters = [statusFilter, sourceFilter, pathwayFilter].filter((f) => f !== "all").length;
  const failedCount = leads.filter(
    (l) => l.consent_marketing && (l.mailchimp_status === "failed" || l.mailchimp_status === "synced_partial"),
  ).length;
  const [bulkBusy, setBulkBusy] = useState(false);
  const [fieldsBusy, setFieldsBusy] = useState(false);

  const retryAllFailed = async () => {
    setBulkBusy(true);
    const { data, error } = await supabase.functions.invoke("mailchimp-sync", { body: { action: "retry_failed" } });
    setBulkBusy(false);
    const res = data as { ok?: boolean; retried?: number; error?: string } | null;
    if (error || !res?.ok) {
      wceToast({ title: "Bulk retry failed", description: res?.error ?? error?.message, tone: "error" });
      return;
    }
    wceToast({ title: `Retried ${res.retried ?? 0} lead${res.retried === 1 ? "" : "s"}` });
    load();
  };

  /* Creates any Mailchimp merge fields the audience is missing (idempotent). */
  const ensureMergeFields = async () => {
    setFieldsBusy(true);
    const { data, error } = await supabase.functions.invoke("mailchimp-sync", { body: { action: "ensure_merge_fields" } });
    setFieldsBusy(false);
    const res = data as { ok?: boolean; created?: string[]; error?: string } | null;
    if (error || !res?.ok) {
      wceToast({ title: "Could not update Mailchimp fields", description: res?.error ?? error?.message, tone: "error" });
      return;
    }
    wceToast({
      title: res.created?.length ? `Created ${res.created.length} Mailchimp field${res.created.length === 1 ? "" : "s"}` : "Mailchimp fields already complete",
      description: res.created?.length ? res.created.join(", ") : undefined,
    });
  };

  return (
    <div className="space-y-5">
      <SectionHeading title="Leads" sub="Applications from the /wce-2026 landing page, with campaign attribution." />

      {loading ? (
        <StatsSkeleton count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total leads" value={leads.length} accent="sage"
            trend={{ direction: trendDir as any, text: `${last7} in the last 7 days` }} />
          <StatCard label="Qualified & accepted" value={qualified} accent="gold" hint="Ready for the team" />
          <StatCard label="Conversion" value={`${conversion}%`} accent="teal" hint="Of all leads received" />
          <StatCard label="Needs attention" value={counts.new ?? 0} accent="terracotta" hint="Still marked new" />
        </div>
      )}

      {!loading && (
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <div className="wa-panel">
            <p className="wa-label" style={{ marginBottom: "0.6rem" }}>Leads over time · 30 days</p>
            <div style={{ height: 210, width: "100%", minWidth: 0 }}>
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
              <div style={{ height: 210, width: "100%", minWidth: 0 }}>
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
      )}

      <FilterBar
        activeCount={activeFilters}
        actions={
          <>
            {failedCount > 0 && (
              <button type="button" className="wa-btn wa-btn-ghost" disabled={bulkBusy} onClick={retryAllFailed}>
                {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}{" "}
                Retry {failedCount} failed Mailchimp sync{failedCount === 1 ? "" : "s"}
              </button>
            )}
          <button type="button" className="wa-btn wa-btn-ghost" disabled={fieldsBusy} onClick={ensureMergeFields}>
            {fieldsBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ListChecks className="h-4 w-4" aria-hidden />}{" "}
            Check Mailchimp fields
          </button>
          <button type="button" className="wa-btn wa-btn-primary" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
          </>
        }
      >
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
      </FilterBar>

      {loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : filtered.length === 0 ? (
        <GuidedEmpty
          title="No leads to show"
          line="Adjust the filters, or share the landing page to start gathering applications."
        />
      ) : (
        <div className="wa-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Country</th>
                <th>Pathway</th>
                <th>
                  Source{" "}
                  <InfoTip label="UTM source / medium / campaign">
                    The tracking tags on the link the visitor clicked (e.g. source = instagram, medium = social,
                    campaign = early-bird). Shows where the lead came from.
                  </InfoTip>
                </th>
                <th>
                  Referral{" "}
                  <InfoTip label="Referral code">
                    A code shared by another attendee or partner that the visitor entered — used to credit whoever
                    referred them.
                  </InfoTip>
                </th>
                <th>
                  Marketing OK?{" "}
                  <InfoTip label="consent_marketing">
                    Whether the lead ticked the marketing-consent box. Do not email leads who did not consent.
                  </InfoTip>
                </th>
                <th>Status</th>
                <th>
                  Mailchimp{" "}
                  <InfoTip label="Marketing list sync">
                    Whether this person reached the Mailchimp audience. People who did not tick marketing consent are
                    never sent, by design. Application and order emails are sent by our own system either way.
                  </InfoTip>
                </th>
                <th>
                  Retreat review{" "}
                  <InfoTip label="Retreat application pipeline">
                    Retreat places are application-only. Approving an applicant emails them a private, single-use
                    payment link that expires — there is no public way to pay for the retreat.
                  </InfoTip>
                </th>
                <th>
                  Applicant needs{" "}
                  <InfoTip label="Dietary and participation notes">
                    What the applicant told us about food and mobility. Confirm what can be accommodated before you
                    approve them and request payment.
                  </InfoTip>
                </th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const fresh = lastVisit.isNew(l.created_at);
                return (
                  <tr key={l.id} data-fresh={fresh ? "true" : undefined}>
                    <td data-label="Date" className="whitespace-nowrap text-xs">
                      {whenText(l.created_at)}
                    </td>
                    <td data-label="Name" className="wa-strong">
                      {l.full_name || "—"}
                      {fresh && <span className="wa-fresh">New</span>}
                    </td>
                    <td data-label="Contact" className="text-xs">
                      <div>{l.email || "—"}</div>
                      <div>{l.whatsapp || ""}</div>
                    </td>
                    <td data-label="Country" className="text-xs">{l.country || "—"}</td>
                    <td data-label="Pathway" className="text-xs">{wcePathwayLabel(l.pathway_interest)}</td>
                    <td data-label="Source" className="text-xs">
                      {l.utm_source || "direct"}
                      {(l.utm_medium || l.utm_campaign) && (
                        <div className="wa-muted">{[l.utm_medium, l.utm_campaign].filter(Boolean).join(" / ")}</div>
                      )}
                    </td>
                    <td data-label="Referral" className="text-xs font-mono">{l.referral_code || "—"}</td>
                    <td data-label="Marketing OK?" className="text-xs">
                      {l.consent_marketing ? (
                        <span className="wa-pill" data-tone="accepted">Yes</span>
                      ) : (
                        <span className="wa-pill" data-tone="declined">No</span>
                      )}
                    </td>
                    <td data-label="Status">
                      <LeadStatusCell lead={l} onChanged={(values) => patchLead(l.id, values)} />
                    </td>
                    <td data-label="Mailchimp">
                      <MailchimpCell lead={l} onChanged={(values) => patchLead(l.id, values)} />
                    </td>
                    <td data-label="Retreat review">
                      {l.pathway_interest === "retreat" ? (
                        <RetreatReviewCell lead={l} onChanged={(values) => patchLead(l.id, values)} />
                      ) : (
                        <span className="wa-muted text-xs">—</span>
                      )}
                    </td>
                    <td data-label="Applicant needs" className="text-xs">
                      {l.dietary_notes || l.participation_notes ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 190 }}>
                          {l.dietary_notes && (
                            <div>
                              <span className="wa-muted">Dietary: </span>
                              <span>{l.dietary_notes}</span>
                            </div>
                          )}
                          {l.participation_notes && (
                            <div>
                              <span className="wa-muted">Mobility: </span>
                              <span>{l.participation_notes}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="wa-muted">None given</span>
                      )}
                    </td>
                    <td data-label="Notes">
                      <textarea
                        aria-label="Lead notes"
                        className="min-w-[200px]"
                        rows={2}
                        defaultValue={l.notes ?? ""}
                        onBlur={(e) => {
                          if (e.target.value !== (l.notes ?? "")) patchNotes(l.id, e.target.value);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
