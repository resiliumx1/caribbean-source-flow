import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Star } from "lucide-react";
import { inputCls, ImageUploadField, useDragReorder, DragHandle } from "./shared";

type Speaker = {
  id: string;
  name: string;
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
  const { toast } = useToast();
  const [rows, setRows] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("wce_speakers").select("*").order("display_order", { ascending: true });
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRows((data ?? []) as Speaker[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const patch = async (id: string, values: Partial<Speaker>) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...values } : r)));
    const { error } = await supabase.from("wce_speakers").update(values).eq("id", id);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
  };

  const persistOrder = async (ordered: Speaker[]) => {
    setRows(ordered.map((r, i) => ({ ...r, display_order: i + 1 })));
    await Promise.all(
      ordered.map((r, i) => supabase.from("wce_speakers").update({ display_order: i + 1 }).eq("id", r.id))
    );
  };

  const { rowProps } = useDragReorder(rows, (ordered) => { void persistOrder(ordered); });

  const add = async () => {
    const { data, error } = await supabase
      .from("wce_speakers")
      .insert({ name: "New speaker", display_order: rows.length + 1 })
      .select().single();
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    setRows((p) => [...p, data as Speaker]);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this speaker?")) return;
    const { error } = await supabase.from("wce_speakers").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    setRows((p) => p.filter((r) => r.id !== id));
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Drag rows to reorder.</p>
        <Button size="sm" className="gap-2" onClick={add}><Plus className="h-4 w-4" /> Add speaker</Button>
      </div>
      <div className="space-y-3">
        {rows.map((s) => (
          <div
            key={s.id}
            {...rowProps(s)}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <DragHandle />
              <div className="grid flex-1 gap-3 md:grid-cols-2">
                <input className={inputCls} defaultValue={s.name} placeholder="Name"
                  onBlur={(e) => e.target.value !== s.name && patch(s.id, { name: e.target.value })} />
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
                <div className="flex items-end gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={s.is_featured}
                      onChange={(e) => patch(s.id, { is_featured: e.target.checked })} />
                    <Star className="h-3.5 w-3.5" /> Featured
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={s.published}
                      onChange={(e) => patch(s.id, { published: e.target.checked })} />
                    Published
                  </label>
                </div>
              </div>
              <button onClick={() => remove(s.id)} aria-label="Delete speaker"
                className="p-2 text-destructive hover:opacity-70">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}