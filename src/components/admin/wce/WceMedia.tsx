import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { inputCls, ImageUploadField, useDragReorder, DragHandle } from "./shared";
import { wceToast, useSaveState, SaveBadge, CardsSkeleton, InfoTip, useConfirm, GuidedEmpty } from "./kit";

type Media = {
  id: string;
  title: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  category: string | null;
  display_order: number;
  published: boolean;
};

export default function WceMedia() {
  const [rows, setRows] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const { state, message, run } = useSaveState();
  const addSave = useSaveState();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_media").select("*").order("display_order", { ascending: true });
      if (error) wceToast({ title: "Could not load media", description: error.message, tone: "error" });
      setRows((data ?? []) as Media[]);
      setLoading(false);
    })();
  }, []);

  const patch = (id: string, values: Partial<Media>) => {
    const prev = rows;
    void run({
      label: "Media item",
      optimistic: () => setRows((p) => p.map((r) => (r.id === id ? { ...r, ...values } : r))),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_media").update(values).eq("id", id),
    });
  };

  const persistOrder = (ordered: Media[]) => {
    const prev = rows;
    const next = ordered.map((r, i) => ({ ...r, display_order: i + 1 }));
    void run({
      label: "Media order",
      optimistic: () => setRows(next),
      rollback: () => setRows(prev),
      write: async () => {
        const results = await Promise.all(
          next.map((r) => supabase.from("wce_media").update({ display_order: r.display_order }).eq("id", r.id))
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
      label: "New media item",
      write: async () => {
        const { data, error } = await supabase.from("wce_media")
          .insert({ title: "New media item", display_order: rows.length + 1 }).select().single();
        if (!error && data) setRows((p) => [...p, data as Media]);
        return { error };
      },
    });
  };

  const remove = async (m: Media) => {
    const ok = await confirm({ title: "Delete media item", item: m.title || "this media item" });
    if (!ok) return;
    const prev = rows;
    void run({
      label: "Media item deleted",
      optimistic: () => setRows((p) => p.filter((r) => r.id !== m.id)),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_media").delete().eq("id", m.id),
    });
  };

  if (loading) return <CardsSkeleton count={4} lines={3} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="wa-muted" style={{ fontSize: "0.82rem" }}>
          Drag rows to reorder, or use the move buttons.{" "}
          <InfoTip label="Published">
            Unpublished media items are hidden from the public /wce-2026 page.
          </InfoTip>
        </p>
        <div className="flex items-center gap-2">
          <SaveBadge state={state} message={message} />
          <Button size="sm" className="gap-2" onClick={add} disabled={addSave.state === "saving"}>
            <Plus className="h-4 w-4" /> Add media
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <GuidedEmpty
          title="No media yet"
          line="Add photos or videos to showcase on the WCE 2026 media page."
          action={<Button size="sm" onClick={add}><Plus className="h-4 w-4" /> Add media</Button>}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((m, i) => (
            <div key={m.id} {...rowProps(m)} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="hidden sm:block"><DragHandle /></div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button type="button" aria-label={`Move "${m.title ?? "media item"}" up`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === 0} onClick={() => move(m.id, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Move "${m.title ?? "media item"}" down`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === rows.length - 1} onClick={() => move(m.id, 1)}>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid flex-1 gap-3 grid-cols-1 md:grid-cols-2 min-w-0">
                  <input className={inputCls} defaultValue={m.title ?? ""} placeholder="Title"
                    onBlur={(e) => patch(m.id, { title: e.target.value })} />
                  <input className={inputCls} defaultValue={m.category ?? ""} placeholder="Category"
                    onBlur={(e) => patch(m.id, { category: e.target.value })} />
                  <input className={inputCls} defaultValue={m.video_url ?? ""} placeholder="Video URL"
                    onBlur={(e) => patch(m.id, { video_url: e.target.value })} />
                  <ImageUploadField label="Thumbnail" folder="media" value={m.thumbnail_url}
                    onChange={(url) => patch(m.id, { thumbnail_url: url })} />
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex items-center gap-2" style={{ minHeight: 44 }}>
                      <input type="checkbox" checked={m.published}
                        onChange={(e) => patch(m.id, { published: e.target.checked })} />
                      Published
                    </label>
                    <span className="wa-pill" data-tone={m.published ? "qualified" : "neutral"}>
                      {m.published ? "Published" : "Unpublished"}
                    </span>
                  </div>
                </div>
                <button onClick={() => remove(m)} aria-label={`Delete "${m.title ?? "media item"}"`}
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
