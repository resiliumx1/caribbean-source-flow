import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { inputCls, useDragReorder, DragHandle } from "./shared";

type Faq = {
  id: string;
  question: string;
  answer: string | null;
  display_order: number;
  published: boolean;
};

export default function WceFaqs() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_faqs").select("*").order("display_order", { ascending: true });
      if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
      setRows((data ?? []) as Faq[]);
      setLoading(false);
    })();
  }, []);

  const patch = async (id: string, values: Partial<Faq>) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...values } : r)));
    const { error } = await supabase.from("wce_faqs").update(values).eq("id", id);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
  };

  const persistOrder = async (ordered: Faq[]) => {
    setRows(ordered.map((r, i) => ({ ...r, display_order: i + 1 })));
    await Promise.all(ordered.map((r, i) =>
      supabase.from("wce_faqs").update({ display_order: i + 1 }).eq("id", r.id)));
  };
  const { rowProps } = useDragReorder(rows, (o) => { void persistOrder(o); });

  const add = async () => {
    const { data, error } = await supabase.from("wce_faqs")
      .insert({ question: "New question", display_order: rows.length + 1 }).select().single();
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    setRows((p) => [...p, data as Faq]);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    const { error } = await supabase.from("wce_faqs").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    setRows((p) => p.filter((r) => r.id !== id));
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Drag rows to reorder.</p>
        <Button size="sm" className="gap-2" onClick={add}><Plus className="h-4 w-4" /> Add FAQ</Button>
      </div>
      {rows.map((f) => (
        <div key={f.id} {...rowProps(f)} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <DragHandle />
            <div className="flex-1 space-y-2">
              <input className={inputCls} defaultValue={f.question} placeholder="Question"
                onBlur={(e) => e.target.value !== f.question && patch(f.id, { question: e.target.value })} />
              <textarea className={inputCls} rows={3} defaultValue={f.answer ?? ""} placeholder="Answer"
                onBlur={(e) => patch(f.id, { answer: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={f.published}
                  onChange={(e) => patch(f.id, { published: e.target.checked })} />
                Published
              </label>
            </div>
            <button onClick={() => remove(f.id)} aria-label="Delete FAQ" className="p-2 text-destructive hover:opacity-70">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}