import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { inputCls, ImageUploadField } from "./shared";

type Settings = {
  id: string;
  hero_headline: string | null;
  hero_subline: string | null;
  event_dates: string | null;
  venue: string | null;
  popup_enabled: boolean;
  popup_flyer_url: string | null;
  popup_cta_text: string | null;
};

export default function WceSettings() {
  const { toast } = useToast();
  const [row, setRow] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_settings").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
      setRow((data as Settings) ?? null);
      setLoading(false);
    })();
  }, []);

  const patch = async (values: Partial<Settings>) => {
    if (!row) return;
    const next = { ...row, ...values };
    setRow(next);
    setSaving(true);
    const { error } = await supabase.from("wce_settings").update(values).eq("id", row.id);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
  };

  const createRow = async () => {
    const { data, error } = await supabase.from("wce_settings").insert({}).select().single();
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    setRow(data as Settings);
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  if (!row) return <Button onClick={createRow}>Create settings row</Button>;

  return (
    <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-5">
      <div>
        <label className="text-xs text-muted-foreground">Hero headline</label>
        <input className={inputCls} defaultValue={row.hero_headline ?? ""}
          onBlur={(e) => patch({ hero_headline: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Hero subline</label>
        <textarea className={inputCls} rows={2} defaultValue={row.hero_subline ?? ""}
          onBlur={(e) => patch({ hero_subline: e.target.value })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs text-muted-foreground">Event dates</label>
          <input className={inputCls} defaultValue={row.event_dates ?? ""}
            onBlur={(e) => patch({ event_dates: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Venue</label>
          <input className={inputCls} defaultValue={row.venue ?? ""}
            onBlur={(e) => patch({ venue: e.target.value })} />
        </div>
      </div>
      <hr className="border-border" />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={row.popup_enabled}
          onChange={(e) => patch({ popup_enabled: e.target.checked })} />
        Popup enabled
      </label>
      <div>
        <label className="text-xs text-muted-foreground">Popup CTA text</label>
        <input className={inputCls} defaultValue={row.popup_cta_text ?? ""}
          onBlur={(e) => patch({ popup_cta_text: e.target.value })} />
      </div>
      <ImageUploadField label="Popup flyer" folder="flyers" value={row.popup_flyer_url}
        onChange={(url) => patch({ popup_flyer_url: url })} />
      {saving && <p className="text-xs text-muted-foreground">Saving…</p>}
    </div>
  );
}