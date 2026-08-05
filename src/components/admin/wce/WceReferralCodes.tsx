/** WCE referral codes — a management layer over the native `coupons` table.
 *  Creating a code here creates the real coupon (scoped to the WCE pathway
 *  products) so the existing server-side checkout validation applies unchanged. */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { inputCls } from "./shared";

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
};

export default function WceReferralCodes() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Code[]>([]);
  const [coupons, setCoupons] = useState<Record<string, Coupon>>({});
  const [pathwayProductIds, setPathwayProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", owner_name: "", owner_type: "", discount_percent: "10" });

  const load = async () => {
    const [{ data, error }, { data: pathways }] = await Promise.all([
      supabase.from("wce_referral_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("wce_pathways").select("product_id").not("product_id", "is", null),
    ]);
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    const list = (data ?? []) as unknown as Code[];
    setRows(list);
    setPathwayProductIds((pathways ?? []).map((p) => p.product_id as string));

    const couponIds = list.map((r) => r.coupon_id).filter(Boolean) as string[];
    if (couponIds.length) {
      const { data: cps } = await supabase
        .from("coupons").select("id, code, used_count, is_active, discount_value, discount_type").in("id", couponIds);
      setCoupons(Object.fromEntries(((cps ?? []) as Coupon[]).map((c) => [c.id, c])));
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) return;
    if (pathwayProductIds.length === 0) {
      return toast({
        title: "Link the pathway products first",
        description: "Referral coupons are scoped to the WCE tier products so they can't discount the whole store.",
        variant: "destructive",
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
      return toast({ title: "Coupon create failed", description: cErr.message, variant: "destructive" });
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
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });

    setCoupons((p) => ({ ...p, [coupon.id]: coupon as Coupon }));
    setRows((p) => [data as unknown as Code, ...p]);
    setForm({ code: "", owner_name: "", owner_type: "", discount_percent: "10" });
  };

  const toggle = async (c: Code) => {
    const next = !c.is_active;
    setRows((p) => p.map((r) => (r.id === c.id ? { ...r, is_active: next } : r)));
    const { error } = await supabase
      .from("wce_referral_codes").update({ is_active: next }).eq("id", c.id);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    if (c.coupon_id) {
      // Keep the real coupon in step — deactivating here must stop the discount.
      await supabase.from("coupons").update({ is_active: next }).eq("id", c.coupon_id);
      setCoupons((p) => (p[c.coupon_id!] ? { ...p, [c.coupon_id!]: { ...p[c.coupon_id!], is_active: next } } : p));
    }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Each referral code creates a real store discount code, scoped to the WCE ticket products only — a speaker code
        can never discount the rest of the shop. Usage counts come from the live coupon.
      </p>

      <div className="grid gap-2 rounded-lg border border-border bg-card p-4 md:grid-cols-5">
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

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
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
            {rows.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No codes yet.</td></tr>
            )}
            {rows.map((c) => {
              const coupon = c.coupon_id ? coupons[c.coupon_id] : undefined;
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 font-mono font-bold text-foreground">{c.code}</td>
                  <td className="p-3">{c.owner_name || "—"}</td>
                  <td className="p-3">{c.owner_type || "—"}</td>
                  <td className="p-3">{coupon ? Number(coupon.discount_value) : c.discount_percent}%</td>
                  <td className="p-3 font-bold">{coupon ? coupon.used_count : c.use_count}</td>
                  <td className="p-3 text-xs">
                    {coupon ? (
                      <span style={{ color: coupon.is_active ? "#15803d" : undefined }}
                        className={coupon.is_active ? "" : "text-muted-foreground"}>
                        {coupon.is_active ? "Live — discount applies at checkout" : "Coupon inactive"}
                      </span>
                    ) : (
                      <span className="text-destructive">No store coupon — this code gives no discount</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Button variant={c.is_active ? "outline" : "secondary"} size="sm" onClick={() => toggle(c)}>
                      {c.is_active ? "Active — deactivate" : "Inactive — reactivate"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}