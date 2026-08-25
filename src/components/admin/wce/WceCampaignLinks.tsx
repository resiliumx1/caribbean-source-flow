/** Campaign Links — direct links straight to the right action for each pathway,
 *  plus a UTM builder and named, reusable links with click and conversion counts.
 *
 *  Conversions are matched on the saved link's own UTM values (and referral code
 *  where set) against the orders and retreat leads, since those are the fields
 *  the public flows already persist.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inputCls } from "./shared";
import { CardsSkeleton, TipLabel, useConfirm, wceToast } from "./kit";
import { buildCampaignUrl, pathwayLinkSlug, type CampaignParams } from "@/lib/wce-links";
import { wcePathwayLabel } from "@/lib/wce-pathway-labels";

type Pathway = { id: string; key: string; label: string; link_slug: string | null; display_order: number };

type Link = {
  id: string;
  name: string;
  pathway_key: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referral_code: string | null;
  click_count: number;
  last_clicked_at: string | null;
  is_active: boolean;
  created_at: string;
};

function CopyButton({ url }: { url: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="wa-btn"
      style={{ minHeight: 44 }}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          wceToast({ title: "Copy failed", description: "Select the link and copy it manually.", tone: "error" });
        }
      }}
    >
      {done ? "Copied" : "Copy link"}
    </button>
  );
}

export default function WceCampaignLinks() {
  const confirmDelete = useConfirm();
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  /* builder state */
  const [form, setForm] = useState({
    name: "", pathway_key: "", utm_source: "", utm_medium: "",
    utm_campaign: "", utm_content: "", utm_term: "", referral_code: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const slugFor = useCallback(
    (key: string) => {
      const p = pathways.find((r) => r.key === key);
      return p ? pathwayLinkSlug(p) : key.replace(/_/g, "-");
    },
    [pathways],
  );

  const loadConversions = useCallback(async (rows: Link[]) => {
    const out: Record<string, number> = {};
    for (const l of rows) {
      const campaign = l.utm_campaign?.trim();
      const ref = l.referral_code?.trim();
      if (!campaign && !ref) { out[l.id] = 0; continue; }
      const table = l.pathway_key === "retreat" ? "wce_leads" : "orders";
      let q = supabase.from(table as "orders").select("id", { count: "exact", head: true });
      if (campaign) q = q.eq("utm_campaign", campaign);
      if (l.utm_source?.trim()) q = q.eq("utm_source", l.utm_source.trim());
      if (ref) q = q.eq("referral_code", ref);
      const { count } = await q;
      out[l.id] = count ?? 0;
    }
    setConversions(out);
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: pw }, { data: ln, error }] = await Promise.all([
        supabase.from("wce_pathways").select("id, key, label, link_slug, display_order").order("display_order"),
        supabase.from("wce_campaign_links").select("*").order("created_at", { ascending: false }),
      ]);
      if (error) wceToast({ title: "Load failed", description: error.message, tone: "error" });
      setPathways((pw ?? []) as Pathway[]);
      const rows = (ln ?? []) as Link[];
      setLinks(rows);
      setLoading(false);
      void loadConversions(rows);
    })();
  }, [loadConversions]);

  const builderParams: CampaignParams = {
    utm_source: form.utm_source, utm_medium: form.utm_medium, utm_campaign: form.utm_campaign,
    utm_content: form.utm_content, utm_term: form.utm_term, ref: form.referral_code,
  };
  const builderUrl = form.pathway_key ? buildCampaignUrl(slugFor(form.pathway_key), builderParams) : "";

  const saveLink = async () => {
    if (!form.name.trim() || !form.pathway_key) {
      wceToast({ title: "Name and pathway are required", tone: "error" });
      return;
    }
    const { data, error } = await supabase
      .from("wce_campaign_links")
      .insert({
        name: form.name.trim(),
        pathway_key: form.pathway_key,
        utm_source: form.utm_source.trim() || null,
        utm_medium: form.utm_medium.trim() || null,
        utm_campaign: form.utm_campaign.trim() || null,
        utm_content: form.utm_content.trim() || null,
        utm_term: form.utm_term.trim() || null,
        referral_code: form.referral_code.trim() || null,
      })
      .select("*")
      .single();
    if (error || !data) {
      wceToast({ title: "Save failed", description: error?.message, tone: "error" });
      return;
    }
    setLinks((ls) => [data as Link, ...ls]);
    setForm({ name: "", pathway_key: form.pathway_key, utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "", utm_term: "", referral_code: "" });
    wceToast({ title: "Campaign link saved" });
  };

  const savedUrl = (l: Link) =>
    buildCampaignUrl(slugFor(l.pathway_key), {
      utm_source: l.utm_source ?? undefined,
      utm_medium: l.utm_medium ?? undefined,
      utm_campaign: l.utm_campaign ?? undefined,
      utm_content: l.utm_content ?? undefined,
      utm_term: l.utm_term ?? undefined,
      ref: l.referral_code ?? undefined,
      cl: l.id,
    });

  if (loading) return <CardsSkeleton count={3} lines={4} />;

  return (
    <div className="space-y-4">
      <p className="wa-panel wa-muted" style={{ fontSize: "0.86rem" }}>
        These links send people straight to payment or the application form, which suits warm and
        retargeting audiences. Cold traffic usually converts better through the landing page first.
        Every utm_* value and referral code is carried through to the resulting order or lead.
      </p>

      {/* ---- one direct link per pathway ---- */}
      <div className="wa-panel space-y-3">
        <div className="font-bold wa-serif text-foreground" style={{ fontSize: "1.05rem" }}>Direct pathway links</div>
        {pathways.map((p) => {
          const url = buildCampaignUrl(pathwayLinkSlug(p));
          return (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "rgba(201,162,39,0.25)" }}>
              <div style={{ minWidth: "16rem" }}>
                <div className="text-foreground" style={{ fontSize: "0.92rem" }}>{p.label}</div>
                <div className="wa-muted" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>{url}</div>
                {p.key === "retreat" && (
                  <div className="wa-muted" style={{ fontSize: "0.78rem" }}>
                    Opens the focused application view — application only, never checkout.
                  </div>
                )}
              </div>
              <CopyButton url={url} />
            </div>
          );
        })}
      </div>

      {/* ---- builder ---- */}
      <div className="wa-panel space-y-3">
        <div className="font-bold wa-serif text-foreground" style={{ fontSize: "1.05rem" }}>Build a campaign link</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="wa-field-label">Name (internal)</label>
            <input className={inputCls} value={form.name} onChange={set("name")} placeholder="August retargeting — online" />
          </div>
          <div>
            <TipLabel tip="Which action the link goes to. Retreat links open the application view.">Pathway</TipLabel>
            <select className={inputCls} value={form.pathway_key} onChange={set("pathway_key")}>
              <option value="">— choose —</option>
              {pathways.map((p) => <option key={p.id} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="wa-field-label">utm_source</label>
            <input className={inputCls} value={form.utm_source} onChange={set("utm_source")} placeholder="facebook" />
          </div>
          <div>
            <label className="wa-field-label">utm_medium</label>
            <input className={inputCls} value={form.utm_medium} onChange={set("utm_medium")} placeholder="paid_social" />
          </div>
          <div>
            <label className="wa-field-label">utm_campaign</label>
            <input className={inputCls} value={form.utm_campaign} onChange={set("utm_campaign")} placeholder="wce2026_retarget" />
          </div>
          <div>
            <label className="wa-field-label">utm_content</label>
            <input className={inputCls} value={form.utm_content} onChange={set("utm_content")} placeholder="carousel_a" />
          </div>
          <div>
            <label className="wa-field-label">utm_term (optional)</label>
            <input className={inputCls} value={form.utm_term} onChange={set("utm_term")} />
          </div>
          <div>
            <label className="wa-field-label">Referral code (optional)</label>
            <input className={inputCls} value={form.referral_code} onChange={set("referral_code")} />
          </div>
        </div>
        {builderUrl && (
          <div className="flex flex-wrap items-center gap-3">
            <code style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>{builderUrl}</code>
            <CopyButton url={builderUrl} />
          </div>
        )}
        <button type="button" className="wa-btn wa-btn-primary" style={{ minHeight: 44 }} onClick={saveLink}>
          Save named link
        </button>
      </div>

      {/* ---- saved links ---- */}
      <div className="wa-panel space-y-3">
        <div className="font-bold wa-serif text-foreground" style={{ fontSize: "1.05rem" }}>Saved campaign links</div>
        {links.length === 0 && (
          <p className="wa-muted" style={{ fontSize: "0.86rem" }}>No saved links yet. Build one above to track clicks and conversions.</p>
        )}
        {links.map((l) => (
          <div key={l.id} className="border-t pt-3 space-y-2" style={{ borderColor: "rgba(201,162,39,0.25)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-foreground" style={{ fontSize: "0.95rem" }}>
                  {l.name} {!l.is_active && <span className="wa-muted">· paused</span>}
                </div>
                <div className="wa-muted" style={{ fontSize: "0.8rem" }}>
                  {wcePathwayLabel(l.pathway_key)} · {l.click_count} click{l.click_count === 1 ? "" : "s"} ·{" "}
                  {conversions[l.id] ?? 0} {l.pathway_key === "retreat" ? "lead" : "order"}
                  {(conversions[l.id] ?? 0) === 1 ? "" : "s"}
                  {l.last_clicked_at && ` · last click ${new Date(l.last_clicked_at).toLocaleString()}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton url={savedUrl(l)} />
                <button
                  type="button"
                  className="wa-btn"
                  style={{ minHeight: 44 }}
                  onClick={async () => {
                    const { error } = await supabase.from("wce_campaign_links")
                      .update({ is_active: !l.is_active }).eq("id", l.id);
                    if (error) { wceToast({ title: "Update failed", description: error.message, tone: "error" }); return; }
                    setLinks((ls) => ls.map((x) => (x.id === l.id ? { ...x, is_active: !x.is_active } : x)));
                  }}
                >
                  {l.is_active ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  className="wa-btn"
                  style={{ minHeight: 44 }}
                  onClick={async () => {
                    const ok = await confirmDelete({ title: "Delete this campaign link?", body: `"${l.name}" and its click history will be removed.` });
                    if (!ok) return;
                    const { error } = await supabase.from("wce_campaign_links").delete().eq("id", l.id);
                    if (error) { wceToast({ title: "Delete failed", description: error.message, tone: "error" }); return; }
                    setLinks((ls) => ls.filter((x) => x.id !== l.id));
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <code className="wa-muted" style={{ fontSize: "0.78rem", wordBreak: "break-all" }}>{savedUrl(l)}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
