/** WCE referral codes — a management layer over the native `coupons` table.
 *  Creating a code here creates the real coupon (scoped to the WCE pathway
 *  products) so the existing server-side checkout validation applies unchanged. */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { inputCls } from "./shared";
import {
  GuidedEmpty, InfoTip, SaveBadge, TableSkeleton, useConfirm, useSaveState, wceToast,
  WarnBadge,
} from "./kit";

type Code = {
  id: string;
  code: string;
  owner_name: string | null;
  owner_type: string | null;
  discount_percent: number;
  use_count: number;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  coupon_id: string | null;
};

type Coupon = {
  id: string;
  code: string;
  used_count: number;
  is_active: boolean;
  discount_value: number;
  discount_type: string;
  expires_at?: string | null;
};

export default function WceReferralCodes() {
  const [rows, setRows] = useState<Code[]>([]);
  const [coupons, setCoupons] = useState<Record<string, Coupon>>({});
  const [pathwayProductIds, setPathwayProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", owner_name: "", owner_type: "", discount_percent: "10" });
  const confirmToggle = useConfirm();

  const load = async () => {
    const [{ data, error }, { data: pathways }] = await Promise.all([
      supabase.from("wce_referral_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("wce_pathways").select("product_id").not("product_id", "is", null),
    ]);
    if (error) wceToast({ title: "Load failed", description: error.message, tone: "error" });
    const list = (data ?? []) as unknown as Code[];
    setRows(list);
    setPathwayProductIds((pathways ?? []).map((p) => p.product_id as string));

    const couponIds = list.map((r) => r.coupon_id).filter(Boolean) as string[];
    if (couponIds.length) {
      const { data: cps } = await supabase
        .from("coupons").select("id, code, used_count, is_active, discount_value, discount_type, expires_at").in("id", couponIds);
      setCoupons(Object.fromEntries(((cps ?? []) as Coupon[]).map((c) => [c.id, c])));
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) return;
    if (pathwayProductIds.length === 0) {
      return wceToast({
        title: "Link the pathway products first",
        description: "Referral coupons are scoped to the WCE tier products so they can't discount the whole store.",
        tone: "error",
      });
    }
    setSaving(true);
    const percent = Number(form.discount_percent) || 0;

    // 1. The real coupon — scoped to the WCE pathway products only.
    const { data: coupon, error: cErr } = await supabase.from("coupons").insert({
      code,
      description: `WCE 2026 referral — ${form.owner_name || "partner"}`,
      discount_type: "percent",
      discount_value: percent,
      product_ids: pathwayProductIds,
      is_active: true,
    }).select("id, code, used_count, is_active, discount_value, discount_type").single();
    if (cErr) {
      setSaving(false);
      return wceToast({ title: "Coupon create failed", description: cErr.message, tone: "error" });
    }

    // 2. The WCE-facing management row.
    const { data, error } = await supabase.from("wce_referral_codes").insert({
      code,
      owner_name: form.owner_name || null,
      owner_type: form.owner_type || null,
      discount_percent: percent,
      coupon_id: coupon.id,
    }).select().single();
    setSaving(false);
    if (error) return wceToast({ title: "Create failed", description: error.message, tone: "error" });

    setCoupons((p) => ({ ...p, [coupon.id]: coupon as Coupon }));
    setRows((p) => [data as unknown as Code, ...p]);
    setForm({ code: "", owner_name: "", owner_type: "", discount_percent: "10" });
    wceToast({ title: "Referral code created" });
  };

  if (loading) return <TableSkeleton rows={5} cols={7} />;

  return (
    <div className="space-y-4">
      <p className="wa-muted" style={{ fontSize: "0.82rem" }}>
        Each referral code creates a real store discount code, scoped to the WCE ticket products only — a speaker code
        can never discount the rest of the shop. Usage counts come from the live coupon.
      </p>

      <div className="wa-panel grid gap-2 md:grid-cols-5">
        <input className={inputCls} placeholder="CODE" value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <input className={inputCls} placeholder="Owner name" value={form.owner_name}
          onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
        <input className={inputCls} placeholder="Owner type" value={form.owner_type}
          onChange={(e) => setForm({ ...form, owner_type: e.target.value })} />
        <input className={inputCls} type="number" placeholder="Discount %" value={form.discount_percent}
          onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
        <Button className="gap-2" onClick={create} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
        </Button>
      </div>

      {rows.length === 0 ? (
        <GuidedEmpty
          title="No referral codes yet"
          line="Create a code above to give a speaker or partner a discounted, scoped coupon for WCE ticket products."
        />
      ) : (
        <div className="wa-table-wrap">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Discount</th>
                <th className="p-3 text-left">Uses</th>
                <th className="p-3 text-left">Store coupon</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <ReferralRow key={c.id} c={c} coupon={c.coupon_id ? coupons[c.coupon_id] : undefined}
                  setRows={setRows} setCoupons={setCoupons} confirmToggle={confirmToggle} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function codeStatus(c: Code, coupon?: Coupon): { label: string; tone: string } {
  const expired = coupon?.expires_at ? new Date(coupon.expires_at).getTime() < Date.now() : false;
  if (expired) return { label: "Expired", tone: "declined" };
  if (!c.is_active) return { label: "Inactive", tone: "neutral" };
  return { label: "Active", tone: "accepted" };
}

function ReferralRow({
  c, coupon, setRows, setCoupons, confirmToggle,
}: {
  c: Code;
  coupon: Coupon | undefined;
  setRows: React.Dispatch<React.SetStateAction<Code[]>>;
  setCoupons: React.Dispatch<React.SetStateAction<Record<string, Coupon>>>;
  confirmToggle: ReturnType<typeof useConfirm>;
}) {
  const { state, message, run } = useSaveState();
  const status = codeStatus(c, coupon);
  const couponMissingOrInactive = c.is_active && (!coupon || !coupon.is_active);

  const toggle = async () => {
    const next = !c.is_active;
    if (c.is_active) {
      const ok = await confirmToggle({
        title: "Deactivate referral code?",
        item: `code "${c.code}"`,
        body: "The linked store coupon will also be deactivated, so the discount will stop applying at checkout.",
        confirmLabel: "Deactivate",
      });
      if (!ok) return;
    }
    const prevRows = c;
    const prevCoupon = coupon;
    await run({
      label: "Status",
      optimistic: () => {
        setRows((p) => p.map((r) => (r.id === c.id ? { ...r, is_active: next } : r)));
        if (c.coupon_id) {
          setCoupons((p) => (p[c.coupon_id!] ? { ...p, [c.coupon_id!]: { ...p[c.coupon_id!], is_active: next } } : p));
        }
      },
      rollback: () => {
        setRows((p) => p.map((r) => (r.id === c.id ? prevRows : r)));
        if (c.coupon_id && prevCoupon) setCoupons((p) => ({ ...p, [c.coupon_id!]: prevCoupon }));
      },
      write: async () => {
        const { error } = await supabase.from("wce_referral_codes").update({ is_active: next }).eq("id", c.id);
        if (error) return { error };
        if (c.coupon_id) {
          const { error: cErr } = await supabase.from("coupons").update({ is_active: next }).eq("id", c.coupon_id);
          if (cErr) return { error: cErr };
        }
        return { error: null };
      },
    });
  };

  return (
    <tr>
      <td className="p-3 font-mono font-bold text-foreground" data-label="Code">{c.code}</td>
      <td className="p-3" data-label="Owner">{c.owner_name || "—"}</td>
      <td className="p-3" data-label="Type">{c.owner_type || "—"}</td>
      <td className="p-3" data-label="Discount">
        {coupon ? Number(coupon.discount_value) : c.discount_percent}%
        <InfoTip label="Discount">
          The percentage taken off the linked WCE ticket products at checkout when this code is applied.
        </InfoTip>
      </td>
      <td className="p-3 font-bold" data-label="Uses">
        {coupon ? coupon.used_count : c.use_count}
        <InfoTip label="Uses">
          How many times this code has been redeemed at checkout, taken live from the store coupon.
        </InfoTip>
      </td>
      <td className="p-3" data-label="Store coupon">
        <span className="wa-pill" data-tone={coupon?.is_active ? "accepted" : "declined"} style={{ fontSize: "0.82rem" }}>
          {coupon ? (coupon.is_active ? "Live" : "Inactive") : "Missing"}
        </span>
        {couponMissingOrInactive && (
          <span style={{ marginLeft: "0.4rem" }}>
            <WarnBadge tone="danger">
              {coupon ? "Coupon inactive — no discount" : "No store coupon — no discount"}
            </WarnBadge>
            <InfoTip label="Discount will not apply">
              A referral code is backed by a store coupon. If the coupon is missing or inactive, the discount will
              not apply at checkout even while this code is marked active.
            </InfoTip>
          </span>
        )}
      </td>
      <td className="p-3" data-label="Status">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="wa-pill" data-tone={status.tone}>{status.label}</span>
          <SaveBadge state={state} message={message} />
          <Button variant={c.is_active ? "outline" : "secondary"} size="sm" onClick={toggle}>
            {c.is_active ? "Deactivate" : "Reactivate"}
          </Button>
        </div>
      </td>
    </tr>
  );
}
