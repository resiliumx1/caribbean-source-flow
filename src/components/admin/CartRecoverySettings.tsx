import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Send, Trash2 } from "lucide-react";

type ReminderStep = { hours: number; subject: string; body: string };
type Settings = {
  enabled: boolean;
  webhook_url: string;
  from_email: string;
  reminders: ReminderStep[];
};

const DEFAULTS: Settings = {
  enabled: true,
  webhook_url: "",
  from_email: "Mount Kailash <orders@mountkailashslu.com>",
  reminders: [
    {
      hours: 2,
      subject: "{{first_name}}, your Mount Kailash bag is saved",
      body:
        "Hi {{first_name}},\n\nWe kept your bag safe: {{items}} — total {{total}}.\n\nFinish whenever you're ready: {{recovery_link}}\n\nMount Kailash Rejuvenation Centre",
    },
    {
      hours: 24,
      subject: "Still thinking it over, {{first_name}}?",
      body:
        "Hi {{first_name}},\n\nYour selection ({{items}}, {{total}}) is still waiting.\n\nPick up where you left off: {{recovery_link}}\n\nMount Kailash Rejuvenation Centre",
    },
    {
      hours: 72,
      subject: "Last reminder about your saved bag",
      body:
        "Hi {{first_name}},\n\nThis is the last note about your saved bag ({{items}}, {{total}}).\n\nCheckout here: {{recovery_link}}\n\nMount Kailash Rejuvenation Centre",
    },
  ],
};

const TOKENS = ["{{first_name}}", "{{name}}", "{{items}}", "{{total}}", "{{recovery_link}}"];

export default function CartRecoverySettings({ onRan }: { onRan?: () => void }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "abandoned_cart_recovery")
        .maybeSingle();
      const value = (data?.value ?? {}) as Partial<Settings>;
      setSettings({
        ...DEFAULTS,
        ...value,
        reminders: value.reminders?.length ? value.reminders : DEFAULTS.reminders,
      });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = { key: "abandoned_cart_recovery", value: settings as never, updated_at: new Date().toISOString() };
    const { data: existing } = await supabase
      .from("store_settings")
      .select("id")
      .eq("key", "abandoned_cart_recovery")
      .maybeSingle();
    const { error } = existing
      ? await supabase.from("store_settings").update(payload).eq("id", existing.id)
      : await supabase.from("store_settings").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Recovery settings saved");
  };

  const runNow = async () => {
    setRunning(true);
    const { data, error } = await supabase.functions.invoke("abandoned-cart-reminders", { body: {} });
    setRunning(false);
    if (error) return toast.error(error.message);
    const sent = (data as { results?: Array<{ status: string }> })?.results?.filter(
      (r) => r.status === "sent",
    ).length ?? 0;
    toast.success(sent ? `${sent} reminder(s) sent` : "No reminders were due");
    onRan?.();
  };

  const patchStep = (idx: number, patch: Partial<ReminderStep>) =>
    setSettings((s) => ({
      ...s,
      reminders: s.reminders.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));

  if (loading) return <p className="text-muted-foreground py-6">Loading settings…</p>;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-foreground">Automated recovery &amp; CRM sync</h2>
          <p className="text-xs text-muted-foreground">
            Reminder emails send in stages; every capture, reminder and recovery is pushed to your CRM webhook.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.enabled}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, enabled: v }))}
            aria-label="Enable automated reminders"
          />
          <span className="text-sm text-muted-foreground">
            {settings.enabled ? "Reminders on" : "Reminders off"}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="crm-url">CRM webhook URL</Label>
          <Input
            id="crm-url"
            className="h-11"
            placeholder="https://your-crm.example.com/hooks/carts"
            value={settings.webhook_url}
            onChange={(e) => setSettings((s) => ({ ...s, webhook_url: e.target.value }))}
          />
          <p className="text-[11px] text-muted-foreground">
            Sent as JSON with events cart_captured, cart_updated, cart_reminder_sent, cart_recovered.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from-email">Reminder sender</Label>
          <Input
            id="from-email"
            className="h-11"
            value={settings.from_email}
            onChange={(e) => setSettings((s) => ({ ...s, from_email: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-4">
        {settings.reminders.map((step, idx) => (
          <div key={idx} className="rounded-md border border-border p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">Reminder {idx + 1}</p>
              <div className="flex items-center gap-2">
                <Label htmlFor={`hours-${idx}`} className="text-xs text-muted-foreground">
                  Send after (hours)
                </Label>
                <Input
                  id={`hours-${idx}`}
                  type="number"
                  min={0}
                  className="h-10 w-24"
                  value={step.hours}
                  onChange={(e) => patchStep(idx, { hours: Number(e.target.value) })}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  aria-label={`Remove reminder ${idx + 1}`}
                  onClick={() =>
                    setSettings((s) => ({ ...s, reminders: s.reminders.filter((_, i) => i !== idx) }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Input
              className="h-11"
              placeholder="Subject line"
              value={step.subject}
              onChange={(e) => patchStep(idx, { subject: e.target.value })}
            />
            <Textarea
              rows={5}
              placeholder="Message body"
              value={step.body}
              onChange={(e) => patchStep(idx, { body: e.target.value })}
            />
          </div>
        ))}
        <p className="text-[11px] text-muted-foreground">Placeholders: {TOKENS.join("  ")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
        <Button
          variant="outline"
          className="gap-1.5"
          onClick={() =>
            setSettings((s) => ({
              ...s,
              reminders: [...s.reminders, { hours: 168, subject: "", body: "" }],
            }))
          }
        >
          <Plus className="h-4 w-4" /> Add reminder
        </Button>
        <Button variant="outline" className="gap-1.5" onClick={runNow} disabled={running}>
          <Send className="h-4 w-4" /> {running ? "Running…" : "Run reminders now"}
        </Button>
      </div>
    </div>
  );
}