import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { inputCls } from "./shared";

type Pathway = {
  id: string;
  key: string;
  label: string;
  price: number;
  currency: string;
  features: any;
  capacity: number | null;
  sold_count: number;
  is_open: boolean;
  is_highlighted: boolean;
  display_order: number;
};

export default function WcePathways() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Pathway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_pathways").select("*").order("display_order", { ascending: true });
      if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
      setRows((data ?? []) as Pathway[]);
      setLoading(false);
    })();
  }, []);

  const patch = async (id: string, values: Partial<Pathway>) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...values } : r)));
    const { error } = await supabase.from("wce_pathways").update(values).eq("id", id);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-3">
      {rows.map((p) => (
        <div key={p.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-foreground">{p.label}</div>
              <div className="text-xs text-muted-foreground">key: {p.key} · sold: {p.sold_count}</div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.is_open}
                  onChange={(e) => patch(p.id, { is_open: e.target.checked })} />
                {p.is_open ? "Open" : "Closed"}
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.is_highlighted}
                  onChange={(e) => patch(p.id, { is_highlighted: e.target.checked })} />
                Highlighted
              </label>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs text-muted-foreground">Label</label>
              <input className={inputCls} defaultValue={p.label}
                onBlur={(e) => e.target.value !== p.label && patch(p.id, { label: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Price ({p.currency})</label>
              <input className={inputCls} type="number" step="0.01" defaultValue={p.price}
                onBlur={(e) => patch(p.id, { price: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Capacity</label>
              <input className={inputCls} type="number" defaultValue={p.capacity ?? ""}
                onBlur={(e) => patch(p.id, { capacity: e.target.value === "" ? null : Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Features (one per line)</label>
            <textarea
              className={inputCls}
              rows={3}
              defaultValue={Array.isArray(p.features) ? p.features.join("\n") : ""}
              onBlur={(e) =>
                patch(p.id, {
                  features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                })
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}