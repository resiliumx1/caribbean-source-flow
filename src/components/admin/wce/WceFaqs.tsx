import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { inputCls, useDragReorder, DragHandle } from "./shared";
import { wceToast, useSaveState, SaveBadge, CardsSkeleton, InfoTip, useConfirm, GuidedEmpty } from "./kit";

type Faq = {
  id: string;
  question: string;
  answer: string | null;
  display_order: number;
  published: boolean;
};

export default function WceFaqs() {
  const [rows, setRows] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const { state, message, run } = useSaveState();
  const addSave = useSaveState();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_faqs").select("*").order("display_order", { ascending: true });
      if (error) wceToast({ title: "Could not load FAQs", description: error.message, tone: "error" });
      setRows((data ?? []) as Faq[]);
      setLoading(false);
    })();
  }, []);

  const patch = (id: string, values: Partial<Faq>) => {
    const prev = rows;
    void run({
      label: "FAQ",
      optimistic: () => setRows((p) => p.map((r) => (r.id === id ? { ...r, ...values } : r))),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_faqs").update(values).eq("id", id),
    });
  };

  const persistOrder = (ordered: Faq[]) => {
    const prev = rows;
    const next = ordered.map((r, i) => ({ ...r, display_order: i + 1 }));
    void run({
      label: "FAQ order",
      optimistic: () => setRows(next),
      rollback: () => setRows(prev),
      write: async () => {
        const results = await Promise.all(
          next.map((r) => supabase.from("wce_faqs").update({ display_order: r.display_order }).eq("id", r.id))
        );
        const failed = results.find((r) => r.error);
        return { error: failed?.error ?? null };
      },
    });
  };
  const { rowProps } = useDragReorder(rows, (o) => persistOrder(o));

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
      label: "New FAQ",
      write: async () => {
        const { data, error } = await supabase.from("wce_faqs")
          .insert({ question: "New question", display_order: rows.length + 1 }).select().single();
        if (!error && data) setRows((p) => [...p, data as Faq]);
        return { error };
      },
    });
  };

  const remove = async (f: Faq) => {
    const ok = await confirm({ title: "Delete FAQ", item: f.question || "this FAQ" });
    if (!ok) return;
    const prev = rows;
    void run({
      label: "FAQ deleted",
      optimistic: () => setRows((p) => p.filter((r) => r.id !== f.id)),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_faqs").delete().eq("id", f.id),
    });
  };

  if (loading) return <CardsSkeleton count={4} lines={3} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="wa-muted" style={{ fontSize: "0.82rem" }}>
          Drag rows to reorder, or use the move buttons.{" "}
          <InfoTip label="Published">
            Unpublished FAQs are hidden from the public /wce-2026 page.
          </InfoTip>
        </p>
        <div className="flex items-center gap-2">
          <SaveBadge state={state} message={message} />
          <Button size="sm" className="gap-2" onClick={add} disabled={addSave.state === "saving"}>
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <GuidedEmpty
          title="No FAQs yet"
          line="Add your first frequently asked question for WCE 2026 visitors."
          action={<Button size="sm" onClick={add}><Plus className="h-4 w-4" /> Add FAQ</Button>}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((f, i) => (
            <div key={f.id} {...rowProps(f)} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="hidden sm:block"><DragHandle /></div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button type="button" aria-label={`Move "${f.question}" up`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === 0} onClick={() => move(f.id, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Move "${f.question}" down`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === rows.length - 1} onClick={() => move(f.id, 1)}>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <input className={inputCls} defaultValue={f.question} placeholder="Question"
                    onBlur={(e) => e.target.value !== f.question && patch(f.id, { question: e.target.value })} />
                  <textarea className={inputCls} rows={3} defaultValue={f.answer ?? ""} placeholder="Answer"
                    onBlur={(e) => patch(f.id, { answer: e.target.value })} />
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex items-center gap-2" style={{ minHeight: 44 }}>
                      <input type="checkbox" checked={f.published}
                        onChange={(e) => patch(f.id, { published: e.target.checked })} />
                      Published
                    </label>
                    <span className="wa-pill" data-tone={f.published ? "qualified" : "neutral"}>
                      {f.published ? "Published" : "Unpublished"}
                    </span>
                  </div>
                </div>
                <button onClick={() => remove(f)} aria-label={`Delete "${f.question}"`}
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
