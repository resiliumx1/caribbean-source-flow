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
  last_woo_coupon_found: boolean | null;
  last_used_at: string | null;
};

export default function WceReferralCodes() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", owner_name: "", owner_type: "", discount_percent: "0" });

  const load = async () => {
    const { data, error } = await supabase
      .from("wce_referral_codes").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRows((data ?? []) as Code[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.code.trim()) return;
    const { data, error } = await supabase.from("wce_referral_codes").insert({
      code: form.code.trim().toUpperCase(),
      owner_name: form.owner_name || null,
      owner_type: form.owner_type || null,
      discount_percent: Number(form.discount_percent) || 0,
    }).select().single();
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    setRows((p) => [data as Code, ...p]);
    setForm({ code: "", owner_name: "", owner_type: "", discount_percent: "0" });
  };

  const toggle = async (c: Code) => {
    setRows((p) => p.map((r) => (r.id === c.id ? { ...r, is_active: !c.is_active } : r)));
    const { error } = await supabase
      .from("wce_referral_codes").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 rounded-lg border border-border bg-card p-4 md:grid-cols-5">
        <input className={inputCls} placeholder="CODE" value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <input className={inputCls} placeholder="Owner name" value={form.owner_name}
          onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
        <input className={inputCls} placeholder="Owner type" value={form.owner_type}
          onChange={(e) => setForm({ ...form, owner_type: e.target.value })} />
        <input className={inputCls} type="number" placeholder="Discount %" value={form.discount_percent}
          onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
        <Button className="gap-2" onClick={create}><Plus className="h-4 w-4" /> Create</Button>
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
              <th className="p-3 text-left">Woo coupon</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No codes yet.</td></tr>
            )}
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-mono font-bold text-foreground">{c.code}</td>
                <td className="p-3">{c.owner_name || "—"}</td>
                <td className="p-3">{c.owner_type || "—"}</td>
                <td className="p-3">{c.discount_percent}%</td>
                <td className="p-3 font-bold">{c.use_count}</td>
                <td className="p-3 text-xs">
                  {c.last_woo_coupon_found === null ? (
                    <span className="text-muted-foreground">Not used yet</span>
                  ) : c.last_woo_coupon_found ? (
                    <span style={{ color: "#15803d" }}>Matched — discount applied</span>
                  ) : (
                    <span className="text-destructive">No Woo coupon — create it in WordPress</span>
                  )}
                </td>
                <td className="p-3">
                  <Button variant={c.is_active ? "outline" : "secondary"} size="sm" onClick={() => toggle(c)}>
                    {c.is_active ? "Active — deactivate" : "Inactive — reactivate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}