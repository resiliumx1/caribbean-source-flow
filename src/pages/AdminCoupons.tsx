import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Copy } from "lucide-react";
import { MobileTable, StackedCard } from "@/components/admin/responsive";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_usd: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

const blank = {
  code: "", description: "", discount_type: "percent",
  discount_value: "", min_order_usd: "", max_uses: "", expires_at: "",
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    const value = Number(form.discount_value);
    if (!form.code.trim() || !(value > 0)) return toast.error("Code and discount value are required");
    if (form.discount_type === "percent" && value > 100) return toast.error("Percentage cannot exceed 100");
    setSaving(true);
    const { error } = await supabase.from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: value,
      min_order_usd: form.min_order_usd ? Number(form.min_order_usd) : 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message.includes("duplicate") ? "That code already exists" : error.message);
    setOpen(false);
    setForm(blank);
    toast.success("Discount code created");
    load();
  };

  const toggleActive = async (c: Coupon) => {
    const { error } = await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("coupons").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    if (error) return toast.error(error.message);
    toast.success("Code deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discount Codes</h1>
          <p className="text-sm text-muted-foreground">
            Percentage or fixed-amount codes customers can apply at checkout.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create discount code</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Code</Label>
                <Input value={form.code} placeholder="WELCOME10"
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label>Description (internal)</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage off</SelectItem>
                      <SelectItem value="fixed">Fixed amount (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input type="number" step="0.01" value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
                </div>
                <div>
                  <Label>Minimum order (USD)</Label>
                  <Input type="number" step="0.01" value={form.min_order_usd}
                    onChange={(e) => setForm({ ...form, min_order_usd: e.target.value })} />
                </div>
                <div>
                  <Label>Max uses (optional)</Label>
                  <Input type="number" value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Expires (optional)</Label>
                  <Input type="date" value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-muted-foreground">Loading…</div>
      ) : coupons.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-muted-foreground">No discount codes yet.</div>
      ) : (
        <MobileTable
          items={coupons}
          renderRow={(c) => (
            <StackedCard
              primary={
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{c.code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied"); }}>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="text-sm text-foreground">
                    {c.discount_type === "percent" ? `${Number(c.discount_value)}% off` : `$${Number(c.discount_value).toFixed(2)} off`}
                    {" · "}{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""} used
                  </div>
                </>
              }
              details={
                <>
                  {c.description && <div>{c.description}</div>}
                  {Number(c.min_order_usd) > 0 && <div>Min order ${Number(c.min_order_usd).toFixed(2)}</div>}
                  {c.max_uses && <div>Max {c.max_uses} uses</div>}
                  {c.expires_at && <div>Expires {new Date(c.expires_at).toLocaleDateString()}</div>}
                  {!c.min_order_usd && !c.max_uses && !c.expires_at && <div>No restrictions</div>}
                </>
              }
              actions={
                <div className="flex items-center gap-2">
                  {c.expires_at && new Date(c.expires_at) < new Date() && <Badge variant="outline">expired</Badge>}
                  <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                  <Button size="sm" variant="ghost" className="min-h-[44px] min-w-[44px]" onClick={() => setDeleteTarget(c)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              }
            />
          )}
          table={
            <div className="rounded-lg border border-border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Discount</th>
                    <th className="px-4 py-3 font-semibold">Rules</th>
                    <th className="px-4 py-3 font-semibold text-right">Used</th>
                    <th className="px-4 py-3 font-semibold">Active</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{c.code}</span>
                          <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied"); }}>
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                        {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {c.discount_type === "percent" ? `${Number(c.discount_value)}% off` : `$${Number(c.discount_value).toFixed(2)} off`}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {Number(c.min_order_usd) > 0 && <div>Min order ${Number(c.min_order_usd).toFixed(2)}</div>}
                        {c.max_uses && <div>Max {c.max_uses} uses</div>}
                        {c.expires_at && <div>Expires {new Date(c.expires_at).toLocaleDateString()}</div>}
                        {!c.min_order_usd && !c.max_uses && !c.expires_at && <span>No restrictions</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                          {c.expires_at && new Date(c.expires_at) < new Date() && <Badge variant="outline">expired</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(c)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.code}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Customers will no longer be able to use this code. Past orders that used it are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete code</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
