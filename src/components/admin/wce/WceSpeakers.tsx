import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Star, ChevronUp, ChevronDown } from "lucide-react";
import { inputCls, ImageUploadField, useDragReorder, DragHandle } from "./shared";
import { wceToast, useSaveState, SaveBadge, CardsSkeleton, InfoTip, useConfirm, GuidedEmpty } from "./kit";

type Speaker = {
  id: string;
  name: string;
  prefix: string | null;
  title: string | null;
  theme: string | null;
  bio: string | null;
  portrait_url: string | null;
  session_title: string | null;
  session_time: string | null;
  is_featured: boolean;
  display_order: number;
  published: boolean;
};

export default function WceSpeakers() {
  const [rows, setRows] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const { state, message, run } = useSaveState();
  const addSave = useSaveState();

  const load = async () => {
    const { data, error } = await supabase
      .from("wce_speakers").select("*").order("display_order", { ascending: true });
    if (error) wceToast({ title: "Could not load speakers", description: error.message, tone: "error" });
    setRows((data ?? []) as Speaker[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const patch = (id: string, values: Partial<Speaker>) => {
    const prev = rows;
    void run({
      label: "Speaker",
      optimistic: () => setRows((p) => p.map((r) => (r.id === id ? { ...r, ...values } : r))),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_speakers").update(values).eq("id", id),
    });
  };

  const persistOrder = (ordered: Speaker[]) => {
    const prev = rows;
    const next = ordered.map((r, i) => ({ ...r, display_order: i + 1 }));
    void run({
      label: "Speaker order",
      optimistic: () => setRows(next),
      rollback: () => setRows(prev),
      write: async () => {
        const results = await Promise.all(
          next.map((r) => supabase.from("wce_speakers").update({ display_order: r.display_order }).eq("id", r.id))
        );
        const failed = results.find((r) => r.error);
        return { error: failed?.error ?? null };
      },
    });
  };

  const { rowProps } = useDragReorder(rows, (ordered) => persistOrder(ordered));

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
      label: "New speaker",
      write: async () => {
        const { data, error } = await supabase
          .from("wce_speakers")
          .insert({ name: "New speaker", display_order: rows.length + 1 })
          .select().single();
        if (!error && data) setRows((p) => [...p, data as Speaker]);
        return { error };
      },
    });
  };

  const remove = async (s: Speaker) => {
    const ok = await confirm({ title: "Delete speaker", item: s.name || "this speaker" });
    if (!ok) return;
    const prev = rows;
    void run({
      label: "Speaker deleted",
      optimistic: () => setRows((p) => p.filter((r) => r.id !== s.id)),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_speakers").delete().eq("id", s.id),
    });
  };

  if (loading) return <CardsSkeleton count={3} lines={5} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="wa-muted" style={{ fontSize: "0.82rem" }}>
          Drag rows to reorder, or use the move buttons.{" "}
          <InfoTip label="Published">
            Unpublished speakers are hidden from the public /wce-2026 page.
          </InfoTip>
        </p>
        <div className="flex items-center gap-2">
          <SaveBadge state={state} message={message} />
          <Button size="sm" className="gap-2" onClick={add} disabled={addSave.state === "saving"}>
            <Plus className="h-4 w-4" /> Add speaker
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <GuidedEmpty
          title="No speakers yet"
          line="Add your first speaker to start building the WCE 2026 line-up."
          action={<Button size="sm" onClick={add}><Plus className="h-4 w-4" /> Add speaker</Button>}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((s, i) => (
            <div key={s.id} {...rowProps(s)} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="hidden sm:block"><DragHandle /></div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button type="button" aria-label={`Move ${s.name || "speaker"} up`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === 0} onClick={() => move(s.id, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Move ${s.name || "speaker"} down`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === rows.length - 1} onClick={() => move(s.id, 1)}>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid flex-1 gap-3 grid-cols-1 md:grid-cols-2 min-w-0">
                  <input className={inputCls} defaultValue={s.name} placeholder="Name"
                    onBlur={(e) => e.target.value !== s.name && patch(s.id, { name: e.target.value })} />
                  <input className={inputCls} defaultValue={s.prefix ?? ""} placeholder="Prefix (e.g. Rt. Hon.)"
                    onBlur={(e) => patch(s.id, { prefix: e.target.value })} />
                  <input className={inputCls} defaultValue={s.title ?? ""} placeholder="Title"
                    onBlur={(e) => patch(s.id, { title: e.target.value })} />
                  <input className={inputCls} defaultValue={s.theme ?? ""} placeholder="Theme"
                    onBlur={(e) => patch(s.id, { theme: e.target.value })} />
                  <input className={inputCls} defaultValue={s.session_title ?? ""} placeholder="Session title"
                    onBlur={(e) => patch(s.id, { session_title: e.target.value })} />
                  <input className={inputCls} defaultValue={s.session_time ?? ""} placeholder="Session time"
                    onBlur={(e) => patch(s.id, { session_time: e.target.value })} />
                  <textarea className={inputCls} rows={2} defaultValue={s.bio ?? ""} placeholder="Bio"
                    onBlur={(e) => patch(s.id, { bio: e.target.value })} />
                  <ImageUploadField
                    label="Portrait"
                    folder="speakers"
                    value={s.portrait_url}
                    onChange={(url) => patch(s.id, { portrait_url: url })}
                  />
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-2" style={{ minHeight: 44 }}>
                      <input type="checkbox" checked={s.is_featured}
                        onChange={(e) => patch(s.id, { is_featured: e.target.checked })} />
                      <Star className="h-3.5 w-3.5" /> Featured
                    </label>
                    <label className="flex items-center gap-2" style={{ minHeight: 44 }}>
                      <input type="checkbox" checked={s.published}
                        onChange={(e) => patch(s.id, { published: e.target.checked })} />
                      Published
                    </label>
                    <span className="wa-pill" data-tone={s.published ? "qualified" : "neutral"}>
                      {s.published ? "Published" : "Unpublished"}
                    </span>
                  </div>
                </div>
                <button onClick={() => remove(s)} aria-label={`Delete ${s.name || "speaker"}`}
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
