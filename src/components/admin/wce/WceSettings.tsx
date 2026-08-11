import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { inputCls, ImageUploadField } from "./shared";
import {
  wceToast, useSaveState, SaveBadge, CardsSkeleton, TipLabel, InfoTip,
  useUnsavedChanges, DirtyFlag, GuidedEmpty,
} from "./kit";

type Settings = {
  id: string;
  hero_headline: string | null;
  hero_subline: string | null;
  event_dates: string | null;
  venue: string | null;
  popup_enabled: boolean;
  announcement_enabled: boolean;
  popup_flyer_url: string | null;
  popup_cta_text: string | null;
  livestream_provider: string | null;
  livestream_embed_url: string | null;
  livestream_embed_code: string | null;
  livestream_fallback_copy: string | null;
  retreat_checkout_expiry_days: number;
};

export default function WceSettings() {
  const [saved, setSaved] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { state, message, run } = useSaveState();
  const createSave = useSaveState();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_settings").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (error) wceToast({ title: "Could not load settings", description: error.message, tone: "error" });
      const row = (data as Settings) ?? null;
      setSaved(row);
      setDraft(row);
      setLoading(false);
    })();
  }, []);

  const dirty = !!saved && !!draft && JSON.stringify(saved) !== JSON.stringify(draft);
  useUnsavedChanges(dirty);

  const set = (values: Partial<Settings>) => {
    setDraft((p) => (p ? { ...p, ...values } : p));
  };

  const save = async () => {
    if (!draft || !saved) return;
    const prevSaved = saved;
    await run({
      label: "Settings",
      write: () => supabase.from("wce_settings").update(draft).eq("id", draft.id),
      optimistic: () => setSaved(draft),
      rollback: () => setSaved(prevSaved),
    });
  };

  const createRow = async () => {
    await createSave.run({
      label: "Settings row",
      write: async () => {
        const { data, error } = await supabase.from("wce_settings").insert({}).select().single();
        if (!error && data) {
          setSaved(data as Settings);
          setDraft(data as Settings);
        }
        return { error };
      },
    });
  };

  if (loading) return <CardsSkeleton count={1} lines={8} />;

  if (!draft) {
    return (
      <GuidedEmpty
        title="No settings configured yet"
        line="Create the settings row to control the WCE 2026 hero content and site-wide popup."
        action={<Button onClick={createRow} disabled={createSave.state === "saving"}>Create settings row</Button>}
      />
    );
  }

  return (
    <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DirtyFlag dirty={dirty} />
        <SaveBadge state={state} message={message} />
      </div>

      <div>
        <label className="wa-field-label">Hero headline</label>
        <input className={inputCls} value={draft.hero_headline ?? ""}
          onChange={(e) => set({ hero_headline: e.target.value })} />
      </div>
      <div>
        <label className="wa-field-label">Hero subline</label>
        <textarea className={inputCls} rows={2} value={draft.hero_subline ?? ""}
          onChange={(e) => set({ hero_subline: e.target.value })} />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div>
          <TipLabel tip="This exact text appears verbatim on the public /wce-2026 page.">
            Event dates
          </TipLabel>
          <input className={inputCls} value={draft.event_dates ?? ""}
            onChange={(e) => set({ event_dates: e.target.value })} />
        </div>
        <div>
          <TipLabel tip="This exact text appears verbatim on the public /wce-2026 page.">
            Venue
          </TipLabel>
          <input className={inputCls} value={draft.venue ?? ""}
            onChange={(e) => set({ venue: e.target.value })} />
        </div>
      </div>
      <hr className="border-border wa-rule" />
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-medium" style={{ minHeight: 44 }}>
          <input type="checkbox" checked={draft.announcement_enabled !== false}
            onChange={(e) => set({ announcement_enabled: e.target.checked })} />
          Announcement bar enabled
        </label>
        <InfoTip label="Announcement bar enabled">
          The slim strip above the site header on every page except the WCE 2026 page itself. Switch it off here and it
          disappears immediately — no new release needed.
        </InfoTip>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-medium" style={{ minHeight: 44 }}>
          <input type="checkbox" checked={draft.popup_enabled}
            onChange={(e) => set({ popup_enabled: e.target.checked })} />
          Popup enabled
        </label>
        <InfoTip label="Popup enabled">
          When on, this shows a site-wide flyer popup to every visitor across the whole site, not just the WCE 2026 page.
          Currently off: the announcement bar carries the event instead. Keep this for a timed push closer to the event.
        </InfoTip>
      </div>
      <div>
        <TipLabel tip="The call-to-action text shown on the popup flyer button, seen verbatim by visitors.">
          Popup CTA text
        </TipLabel>
        <input className={inputCls} value={draft.popup_cta_text ?? ""}
          onChange={(e) => set({ popup_cta_text: e.target.value })} />
      </div>
      <div>
        <TipLabel tip="The flyer image shown in the site-wide popup. Use a clear, legible image since it displays at a modest size.">
          Popup flyer
        </TipLabel>
        <ImageUploadField label="" folder="flyers" value={draft.popup_flyer_url}
          onChange={(url) => set({ popup_flyer_url: url })} />
      </div>

      <hr className="border-border wa-rule" />
      <h3 className="wa-serif text-base">Online symposium livestream</h3>
      <p className="text-xs text-muted-foreground">
        Only people who bought online access can reach the player at <code>/wce-2026/live</code>. Access is checked on
        the server, so these details are never handed to a visitor without a valid ticket.
      </p>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div>
          <TipLabel tip="Which service hosts the stream, e.g. YouTube, Vimeo or StreamYard.">
            Livestream provider
          </TipLabel>
          <input className={inputCls} value={draft.livestream_provider ?? ""}
            onChange={(e) => set({ livestream_provider: e.target.value })} />
        </div>
        <div>
          <TipLabel tip="The player URL used inside the embedded frame, e.g. https://www.youtube.com/embed/XXXX.">
            Embed URL
          </TipLabel>
          <input className={inputCls} value={draft.livestream_embed_url ?? ""}
            onChange={(e) => set({ livestream_embed_url: e.target.value })} />
        </div>
      </div>
      <div>
        <TipLabel tip="Optional. Paste the provider's full embed snippet if a plain URL is not enough. Leave empty to use the embed URL.">
          Embed code
        </TipLabel>
        <textarea className={inputCls} rows={3} value={draft.livestream_embed_code ?? ""}
          onChange={(e) => set({ livestream_embed_code: e.target.value })} />
      </div>
      <div>
        <TipLabel tip="Shown to ticket holders before the stream goes live, or if the player is temporarily unavailable.">
          Message when the stream is not live
        </TipLabel>
        <textarea className={inputCls} rows={2} value={draft.livestream_fallback_copy ?? ""}
          onChange={(e) => set({ livestream_fallback_copy: e.target.value })} />
      </div>

      <hr className="border-border wa-rule" />
      <div className="max-w-xs">
        <TipLabel tip="How many days an approved retreat applicant has to pay before their private payment link stops working.">
          Retreat payment link expires after (days)
        </TipLabel>
        <input className={inputCls} type="number" min={1} max={60}
          value={draft.retreat_checkout_expiry_days ?? 7}
          onChange={(e) => set({ retreat_checkout_expiry_days: Math.max(1, Math.min(60, Number(e.target.value) || 7)) })} />
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={!dirty || state === "saving"}>
          Save changes
        </Button>
      </div>

      <hr className="border-border wa-rule" />
      <p className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Transactional email:</strong> order confirmation and processing emails are
        sent by WooCommerce from the WordPress site — not from this app. Deliverability therefore depends on the
        WordPress domain's SPF, DKIM and DMARC DNS records being configured correctly. If customers report missing
        confirmations, check those records first.
      </p>
    </div>
  );
}
