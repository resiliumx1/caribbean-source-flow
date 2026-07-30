import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { inputCls, ImageUploadField, useDragReorder, DragHandle } from "./shared";

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
  const { toast } = useToast();
  const [rows, setRows] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_media").select("*").order("display_order", { ascending: true });
      if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
      setRows((data ?? []) as Media[]);
      setLoading(false);
    })();
  }, []);

  const patch = async (id: string, values: Partial<Media>) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...values } : r)));
    const { error } = await supabase.from("wce_media").update(values).eq("id", id);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
  };

  const persistOrder = async (ordered: Media[]) => {
    setRows(ordered.map((r, i) => ({ ...r, display_order: i + 1 })));
    await Promise.all(ordered.map((r, i) =>
      supabase.from("wce_media").update({ display_order: i + 1 }).eq("id", r.id)));
  };
  const { rowProps } = useDragReorder(rows, (o) => { void persistOrder(o); });

  const add = async () => {
    const { data, error } = await supabase.from("wce_media")
      .insert({ title: "New media item", display_order: rows.length + 1 }).select().single();
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    setRows((p) => [...p, data as Media]);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this media item?")) return;
    const { error } = await supabase.from("wce_media").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    setRows((p) => p.filter((r) => r.id !== id));
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Drag rows to reorder.</p>
        <Button size="sm" className="gap-2" onClick={add}><Plus className="h-4 w-4" /> Add media</Button>
      </div>
      {rows.map((m) => (
        <div key={m.id} {...rowProps(m)} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <DragHandle />
            <div className="grid flex-1 gap-3 md:grid-cols-2">
              <input className={inputCls} defaultValue={m.title ?? ""} placeholder="Title"
                onBlur={(e) => patch(m.id, { title: e.target.value })} />
              <input className={inputCls} defaultValue={m.category ?? ""} placeholder="Category"
                onBlur={(e) => patch(m.id, { category: e.target.value })} />
              <input className={inputCls} defaultValue={m.video_url ?? ""} placeholder="Video URL"
                onBlur={(e) => patch(m.id, { video_url: e.target.value })} />
              <ImageUploadField label="Thumbnail" folder="media" value={m.thumbnail_url}
                onChange={(url) => patch(m.id, { thumbnail_url: url })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={m.published}
                  onChange={(e) => patch(m.id, { published: e.target.checked })} />
                Published
              </label>
            </div>
            <button onClick={() => remove(m.id)} aria-label="Delete media" className="p-2 text-destructive hover:opacity-70">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}