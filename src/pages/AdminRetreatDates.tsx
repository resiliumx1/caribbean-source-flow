import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PROMO_LABELS = [
  "Few Slots Left",
  "Reserve Your Spot",
  "Early Bird",
  "Last Chance",
  "New",
];

export default function AdminRetreatDates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    spots_total: 10,
    price_override_usd: "",
    promo_label: "",
    custom_promo: "",
  });

  const { data: retreatTypes = [] } = useQuery({
    queryKey: ["retreat-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retreat_types")
        .select("*")
        .eq("type", "group")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: dates = [], isLoading } = useQuery({
    queryKey: ["admin-retreat-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retreat_dates")
        .select("*, retreat_types(*)")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addDate = useMutation({
    mutationFn: async () => {
      const groupType = retreatTypes[0];
      if (!groupType) throw new Error("No group retreat type found");

      const label = form.promo_label === "custom" ? form.custom_promo : form.promo_label || null;

      const { error } = await supabase.from("retreat_dates").insert({
        retreat_type_id: groupType.id,
        start_date: form.start_date,
        end_date: form.end_date,
        spots_total: form.spots_total,
        price_override_usd: form.price_override_usd ? parseFloat(form.price_override_usd) : null,
        promo_label: label,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retreat-dates"] });
      queryClient.invalidateQueries({ queryKey: ["retreat-dates"] });
      toast({ title: "Date added" });
      setIsDialogOpen(false);
      setForm({ start_date: "", end_date: "", spots_total: 10, price_override_usd: "", promo_label: "", custom_promo: "" });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteDate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("retreat_dates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retreat-dates"] });
      queryClient.invalidateQueries({ queryKey: ["retreat-dates"] });
      toast({ title: "Date deleted" });
    },
  });

  const updatePromo = useMutation({
    mutationFn: async ({ id, label }: { id: string; label: string | null }) => {
      const { error } = await supabase
        .from("retreat_dates")
        .update({ promo_label: label } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retreat-dates"] });
      queryClient.invalidateQueries({ queryKey: ["retreat-dates"] });
    },
  });

  const groupDates = dates.filter((d) => {
    const rt = d.retreat_types as any;
    return rt?.type === "group";
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retreat Dates</h1>
          <p className="text-muted-foreground mt-1">Manage group retreat schedule and promotional labels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Add Date</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Retreat Date</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Total Spots</label>
                  <Input type="number" value={form.spots_total} onChange={(e) => setForm((p) => ({ ...p, spots_total: parseInt(e.target.value) || 10 }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Price Override (USD)</label>
                  <Input type="number" placeholder="Default price" value={form.price_override_usd} onChange={(e) => setForm((p) => ({ ...p, price_override_usd: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Promo Label</label>
                <Select value={form.promo_label} onValueChange={(v) => setForm((p) => ({ ...p, promo_label: v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {PROMO_LABELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {form.promo_label === "custom" && (
                  <Input className="mt-2" placeholder="Custom label text" value={form.custom_promo} onChange={(e) => setForm((p) => ({ ...p, custom_promo: e.target.value }))} />
                )}
              </div>
              <Button onClick={() => addDate.mutate()} disabled={!form.start_date || !form.end_date || addDate.isPending} className="w-full">
                {addDate.isPending ? "Adding..." : "Add Date"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : groupDates.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No group retreat dates. Add one above.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dates</TableHead>
              <TableHead>Spots</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Promo Label</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupDates.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">
                  {format(new Date(d.start_date), "MMM d")} – {format(new Date(d.end_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{d.spots_booked}/{d.spots_total}</TableCell>
                <TableCell>{d.price_override_usd ? `$${d.price_override_usd}` : "Default"}</TableCell>
                <TableCell>
                  <Select
                    value={(d as any).promo_label || "none"}
                    onValueChange={(v) => updatePromo.mutate({ id: d.id, label: v === "none" ? null : v })}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {PROMO_LABELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this date?")) deleteDate.mutate(d.id); }}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
