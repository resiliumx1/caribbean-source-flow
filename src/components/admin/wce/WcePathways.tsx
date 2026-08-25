import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inputCls } from "./shared";
import {
  CardsSkeleton, DirtyFlag, GuidedEmpty, InfoTip, SaveBadge, TipLabel,
  useConfirm, useSaveState, useUnsavedChanges, wceToast, WarnBadge,
} from "./kit";
import { buildCampaignUrl, pathwayLinkSlug } from "@/lib/wce-links";

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
  product_id: string | null;
  link_slug: string | null;
};

type ProductOption = {
  id: string;
  name: string;
  price_usd: number;
  is_digital: boolean;
};

export default function WcePathways() {
  const confirmDelete = useConfirm();
  const [rows, setRows] = useState<Pathway[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const anyDirty = Object.values(dirty).some(Boolean);
  useUnsavedChanges(anyDirty);

  useEffect(() => {
    (async () => {
      const [{ data, error }, { data: prods }] = await Promise.all([
        supabase.from("wce_pathways").select("*").order("display_order", { ascending: true }),
        supabase.from("products").select("id, name, price_usd, is_digital").eq("is_active", true).order("name"),
      ]);
      if (error) wceToast({ title: "Load failed", description: error.message, tone: "error" });
      setRows((data ?? []) as Pathway[]);
      setProducts((prods ?? []) as ProductOption[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <CardsSkeleton count={3} lines={5} />;

  if (rows.length === 0) {
    return (
      <GuidedEmpty
        title="No pathways yet"
        line="WCE ticket pathways (tiers) will appear here once created. Each pathway needs a linked store product before it can be purchased on the public page."
      />
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((p) => (
        <PathwayRow key={p.id} p={p} products={products} setRows={setRows} setDirty={setDirty} confirmDelete={confirmDelete} />
      ))}
    </div>
  );
}

function PathwayRow({
  p, products, setRows, setDirty, confirmDelete,
}: {
  p: Pathway;
  products: ProductOption[];
  setRows: React.Dispatch<React.SetStateAction<Pathway[]>>;
  setDirty: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  confirmDelete: ReturnType<typeof useConfirm>;
}) {
  const { state, message, run } = useSaveState();
  const [labelDraft, setLabelDraft] = useState(p.label);
  const [priceDraft, setPriceDraft] = useState(String(p.price));
  const [capacityDraft, setCapacityDraft] = useState(p.capacity == null ? "" : String(p.capacity));
  const [featuresDraft, setFeaturesDraft] = useState(Array.isArray(p.features) ? p.features.join("\n") : "");
  const [slugDraft, setSlugDraft] = useState(pathwayLinkSlug(p));

  const rowDirty =
    labelDraft !== p.label ||
    priceDraft !== String(p.price) ||
    capacityDraft !== (p.capacity == null ? "" : String(p.capacity)) ||
    featuresDraft !== (Array.isArray(p.features) ? p.features.join("\n") : "") ||
    slugDraft !== pathwayLinkSlug(p);

  useEffect(() => {
    setDirty((d) => ({ ...d, [p.id]: rowDirty }));
  }, [rowDirty, p.id, setDirty]);

  const patch = async (values: Partial<Pathway>, label: string) => {
    const prev = p;
    await run({
      label,
      optimistic: () => setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, ...values } : r))),
      rollback: () => setRows((rs) => rs.map((r) => (r.id === p.id ? prev : r))),
      write: async () => await supabase.from("wce_pathways").update(values).eq("id", p.id),
    });
  };

  const linked = products.find((pr) => pr.id === p.product_id);
  const noProduct = p.key !== "retreat" && !p.product_id;
  const isClosed = !p.is_open;
  const isSoldOut = p.capacity != null && p.sold_count >= p.capacity;

  return (
    <div className="wa-panel space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-bold text-foreground wa-serif" style={{ fontSize: "1.05rem" }}>{p.label}</div>
          <div className="wa-muted" style={{ fontSize: "0.82rem" }}>key: {p.key} · sold: {p.sold_count}</div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SaveBadge state={state} message={message} />
          <DirtyFlag dirty={rowDirty} />
          <label className="flex items-center gap-2" style={{ minHeight: 44 }}>
            <input type="checkbox" checked={p.is_open}
              onChange={(e) => patch({ is_open: e.target.checked }, "Open state")} />
            {p.is_open ? "Open" : "Closed"}
          </label>
          <label className="flex items-center gap-2" style={{ minHeight: 44 }}>
            <input type="checkbox" checked={p.is_highlighted}
              onChange={(e) => patch({ is_highlighted: e.target.checked }, "Highlighted")} />
            Highlighted
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {noProduct && (
          <span className="flex items-center gap-1">
            <WarnBadge tone="danger">No product linked — cannot be bought</WarnBadge>
            <InfoTip label="No product linked">
              The pathway price shown on the public page comes from the linked store product. Without one, the
              Reserve button has nothing to sell.
            </InfoTip>
          </span>
        )}
        {isClosed && (
          <span className="flex items-center gap-1">
            <WarnBadge tone="warn">Closed — hidden from the public page / not purchasable</WarnBadge>
            <InfoTip label="Closed">
              While closed, this pathway is hidden from the public WCE page and cannot be reserved.
            </InfoTip>
          </span>
        )}
        {isSoldOut && (
          <span className="flex items-center gap-1">
            <WarnBadge tone="warn">Sold out</WarnBadge>
            <InfoTip label="Sold out">
              Sold count has reached capacity ({p.sold_count}/{p.capacity}). New reservations are blocked.
            </InfoTip>
          </span>
        )}
      </div>

      {p.key !== "retreat" && linked && !linked.is_digital && (
        <p className="rounded-md border p-3" style={{ borderColor: "rgba(201,162,39,0.4)", background: "rgba(201,162,39,0.1)", fontSize: "0.82rem" }}>
          "{linked.name}" is not marked digital, so checkout will add a 30 USD shipping charge to every ticket.
          Set the product to digital in Products.
        </p>
      )}

      {p.key !== "retreat" && (
        <div>
          <TipLabel tip="The pathway price shown on the public page comes from this linked store product. Without one, the Reserve button has nothing to sell.">
            Linked product
          </TipLabel>
          <select
            className={inputCls}
            value={p.product_id ?? ""}
            onChange={(e) => patch({ product_id: e.target.value || null }, "Linked product")}
          >
            <option value="">— none (application only) —</option>
            {products.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.name} · ${Number(pr.price_usd).toFixed(2)}{pr.is_digital ? " · digital" : " · physical"}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="wa-field-label">Label</label>
          <input className={inputCls} value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={() => labelDraft !== p.label && patch({ label: labelDraft }, "Label")} />
        </div>
        <div>
          <label className="wa-field-label">Price ({p.currency})</label>
          <input className={inputCls} type="number" step="0.01" value={priceDraft}
            onChange={(e) => setPriceDraft(e.target.value)}
            onBlur={() => patch({ price: Number(priceDraft) || 0 }, "Price")} />
        </div>
        <div>
          <label className="wa-field-label">Capacity</label>
          <input className={inputCls} type="number" value={capacityDraft}
            onChange={(e) => setCapacityDraft(e.target.value)}
            onBlur={() => patch({ capacity: capacityDraft === "" ? null : Number(capacityDraft) }, "Capacity")} />
        </div>
      </div>
      <div>
        <TipLabel tip="The direct campaign link for this pathway. Paid social can send people straight to the right action instead of the landing page.">
          Campaign link slug
        </TipLabel>
        <input
          className={inputCls}
          value={slugDraft}
          onChange={(e) => setSlugDraft(e.target.value)}
          onBlur={() => {
            const clean = slugDraft.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
            setSlugDraft(clean || pathwayLinkSlug(p));
            if (clean && clean !== p.link_slug) patch({ link_slug: clean }, "Campaign link slug");
          }}
        />
        <p className="wa-muted mt-1" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
          {buildCampaignUrl(slugDraft || pathwayLinkSlug(p))}
          {p.key === "retreat" && " — opens the application view, never checkout."}
        </p>
      </div>

      <div>
        <label className="wa-field-label">Features (one per line)</label>
        <textarea
          className={inputCls}
          rows={3}
          value={featuresDraft}
          onChange={(e) => setFeaturesDraft(e.target.value)}
          onBlur={() =>
            patch(
              { features: featuresDraft.split("\n").map((s) => s.trim()).filter(Boolean) },
              "Features",
            )
          }
        />
      </div>
    </div>
  );
}
