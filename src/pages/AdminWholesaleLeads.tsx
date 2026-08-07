import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Loader2 } from "lucide-react";

type Status = "new" | "contacted" | "qualified" | "converted" | "lost";

type Lead = {
  id: string;
  company_name: string;
  email: string;
  business_type: string | null;
  needs: string | null;
  source: string | null;
  whatsapp_sent: boolean | null;
  status: Status;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
};

const STATUSES: Status[] = ["new", "contacted", "qualified", "converted", "lost"];

const STATUS_STYLES: Record<Status, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  contacted: "bg-amber-100 text-amber-800 border-amber-200",
  qualified: "bg-purple-100 text-purple-800 border-purple-200",
  converted: "bg-green-100 text-green-800 border-green-200",
  lost: "bg-gray-100 text-gray-700 border-gray-200",
};

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

export default function AdminWholesaleLeads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wholesale_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load leads", description: error.message, variant: "destructive" });
    } else {
      setLeads((data ?? []) as Lead[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return [l.company_name, l.email, l.business_type, l.needs, l.admin_notes]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [leads, statusFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of STATUSES) c[s] = 0;
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const updateStatus = async (id: string, status: Status) => {
    setSavingId(id);
    const { error } = await supabase.from("wholesale_leads").update({ status }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    toast({ title: "Status updated", description: `Marked as ${status}.` });
  };

  const saveNotes = async (id: string, admin_notes: string) => {
    setSavingId(id);
    const { error } = await supabase.from("wholesale_leads").update({ admin_notes }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, admin_notes } : l)));
    toast({ title: "Notes saved" });
  };

  const exportCSV = () => {
    const headers = [
      "id","company_name","email","business_type","status","whatsapp_sent",
      "source","needs","admin_notes","created_at","updated_at",
    ];
    const rows = filtered.map((l) => headers.map((h) => csvEscape((l as any)[h])).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wholesale-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Wholesale Leads</h1>
          <p className="text-sm text-gray-500">Track and follow up on B2B inquiries.</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!filtered.length}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export CSV ({filtered.length})
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              statusFilter === s
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
            }`}
          >
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, email, notes..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg text-gray-500 text-sm">
          No leads match your filters.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Received</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((l) => (
                <LeadRow
                  key={l.id}
                  lead={l}
                  expanded={expanded === l.id}
                  onToggle={() => setExpanded(expanded === l.id ? null : l.id)}
                  onStatusChange={(s) => updateStatus(l.id, s)}
                  onSaveNotes={(n) => saveNotes(l.id, n)}
                  saving={savingId === l.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeadRow({
  lead, expanded, onToggle, onStatusChange, onSaveNotes, saving,
}: {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (s: Status) => void;
  onSaveNotes: (n: string) => void;
  saving: boolean;
}) {
  const [notes, setNotes] = useState(lead.admin_notes ?? "");
  useEffect(() => setNotes(lead.admin_notes ?? ""), [lead.admin_notes]);

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 font-medium text-gray-900">{lead.company_name}</td>
        <td className="px-4 py-3 text-gray-700">
          <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
        </td>
        <td className="px-4 py-3 text-gray-600">{lead.business_type || "—"}</td>
        <td className="px-4 py-3">
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(e.target.value as Status)}
            disabled={saving}
            className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer ${STATUS_STYLES[lead.status]}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
          {new Date(lead.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 text-right">
          <button onClick={onToggle} className="text-xs text-gray-600 hover:text-gray-900">
            {expanded ? "Hide" : "View"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Lead details</h4>
                <p className="text-xs text-gray-500">Source: {lead.source || "—"}</p>
                <p className="text-xs text-gray-500 mb-2">
                  WhatsApp sent: {lead.whatsapp_sent ? "Yes" : "No"}
                </p>
                <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Message</h4>
                <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white p-3 rounded border border-gray-200">
{lead.needs || "—"}
                </pre>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Internal notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Follow-up notes, quote sent, next steps..."
                  className="w-full text-sm p-3 border border-gray-200 rounded focus:outline-none focus:border-gray-500"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => onSaveNotes(notes)}
                    disabled={saving || notes === (lead.admin_notes ?? "")}
                    className="px-3 py-1.5 text-xs rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save notes"}
                  </button>
                  <a
                    href={`mailto:${lead.email}`}
                    className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-white"
                  >
                    Reply via email
                  </a>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}