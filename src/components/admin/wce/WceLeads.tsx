import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { inputCls } from "./shared";

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

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-3">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground self-center mr-2">
          Leads by source
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground">
          Total: {leads.length}
        </span>
        {bySource.map(([src, n]) => (
          <span key={src} className="rounded-full border border-border px-3 py-1 text-xs text-foreground">
            {src}: <strong>{n}</strong>
          </span>
        ))}
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
        <Button variant="outline" size="sm" className="gap-2" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">Country</th>
              <th className="p-3 text-left">Pathway</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No leads yet.</td></tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-border align-top">
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 font-medium text-foreground">{l.full_name || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  <div>{l.email || "—"}</div>
                  <div>{l.whatsapp || ""}</div>
                </td>
                <td className="p-3 text-xs">{l.country || "—"}</td>
                <td className="p-3 text-xs">{l.pathway_interest || "—"}</td>
                <td className="p-3 text-xs">{l.utm_source || "direct"}</td>
                <td className="p-3">
                  <select
                    className={inputCls + " min-w-[130px] py-1"}
                    value={l.status}
                    onChange={(e) => patch(l.id, { status: e.target.value })}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <textarea
                    className={inputCls + " min-w-[200px]"}
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