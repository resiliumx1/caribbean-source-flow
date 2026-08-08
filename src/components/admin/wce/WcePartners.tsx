import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { inputCls } from "./shared";
import { wceToast, useSaveState, SaveBadge, CardsSkeleton, InfoTip, useConfirm, GuidedEmpty } from "./kit";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  url: string | null;
  round: boolean;
  display_order: number;
  published: boolean;
};

export default function WcePartners() {
  const [rows, setRows] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const { state, message, run } = useSaveState();
  const addSave = useSaveState();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_partners").select("*").order("display_order", { ascending: true });
      if (error) wceToast({ title: "Could not load partners", description: error.message, tone: "error" });
      setRows((data ?? []) as Partner[]);
      setLoading(false);
    })();
  }, []);

  const patch = (id: string, values: Partial<Partner>) => {
    const prev = rows;
    void run({
      label: "Partner",
      optimistic: () => setRows((p) => p.map((r) => (r.id === id ? { ...r, ...values } : r))),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_partners").update(values).eq("id", id),
    });
  };

  const persistOrder = (ordered: Partner[]) => {
    const prev = rows;
    const next = ordered.map((r, i) => ({ ...r, display_order: i + 1 }));
    void run({
      label: "Partner order",
      optimistic: () => setRows(next),
      rollback: () => setRows(prev),
      write: async () => {
        const results = await Promise.all(
          next.map((r) => supabase.from("wce_partners").update({ display_order: r.display_order }).eq("id", r.id)),
        );
        const failed = results.find((r) => r.error);
        return { error: failed?.error ?? null };
      },
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [moved] = next.splice(idx, 1);
    next.splice(to, 0, moved);
    persistOrder(next);
  };

  const add = async () => {
    await addSave.run({
      label: "New partner",
      write: async () => {
        const { data, error } = await supabase.from("wce_partners")
          .insert({ name: "New partner", display_order: rows.length + 1 }).select().single();
        if (!error && data) setRows((p) => [...p, data as Partner]);
        return { error };
      },
    });
  };

  const remove = async (p: Partner) => {
    const ok = await confirm({ title: "Delete partner", item: p.name || "this partner" });
    if (!ok) return;
    const prev = rows;
    void run({
      label: "Partner deleted",
      optimistic: () => setRows((r) => r.filter((x) => x.id !== p.id)),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_partners").delete().eq("id", p.id),
    });
  };

  if (loading) return <CardsSkeleton count={4} lines={2} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="wa-muted" style={{ fontSize: "0.82rem" }}>
          These appear in the hero “Powered by” marquee and the page footer.{" "}
          <InfoTip label="Website">
            Add a website address to make the logo clickable — it opens in a new tab. Leave it empty and the
            logo stays unlinked. Logo artwork ships with the site and is matched by the partner name; a custom
            image address overrides it.
          </InfoTip>
        </p>
        <div className="flex items-center gap-2">
          <SaveBadge state={state} message={message} />
          <Button size="sm" className="gap-2" onClick={add} disabled={addSave.state === "saving"}>
            <Plus className="h-4 w-4" /> Add partner
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <GuidedEmpty
          title="No partners yet"
          line="Add the organisations shown in the hero marquee and footer."
          action={<Button size="sm" onClick={add}><Plus className="h-4 w-4" /> Add partner</Button>}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((p, i) => (
            <div key={p.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex flex-col gap-1 shrink-0">
                  <button type="button" aria-label={`Move ${p.name} up`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === 0} onClick={() => move(p.id, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Move ${p.name} down`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === rows.length - 1} onClick={() => move(p.id, 1)}>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <input className={inputCls} defaultValue={p.name} placeholder="Partner name"
                    onBlur={(e) => e.target.value !== p.name && patch(p.id, { name: e.target.value })} />
                  <input className={inputCls} defaultValue={p.url ?? ""} placeholder="Website (https://…) — leave empty to keep the logo unlinked"
                    onBlur={(e) => patch(p.id, { url: e.target.value.trim() || null })} />
                  <input className={inputCls} defaultValue={p.logo_url ?? ""} placeholder="Custom logo image address (optional)"
                    onBlur={(e) => patch(p.id, { logo_url: e.target.value.trim() || null })} />
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-2" style={{ minHeight: 44 }}>
                      <input type="checkbox" checked={p.round}
                        onChange={(e) => patch(p.id, { round: e.target.checked })} />
                      Round seal artwork
                    </label>
                    <label className="flex items-center gap-2" style={{ minHeight: 44 }}>
                      <input type="checkbox" checked={p.published}
                        onChange={(e) => patch(p.id, { published: e.target.checked })} />
                      Published
                    </label>
                    <span className="wa-pill" data-tone={p.url ? "qualified" : "neutral"}>
                      {p.url ? "Linked" : "Not linked"}
                    </span>
                  </div>
                </div>
                <button onClick={() => remove(p)} aria-label={`Delete ${p.name}`}
                  className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0, color: "var(--wa-danger, #E7A98F)" }}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
