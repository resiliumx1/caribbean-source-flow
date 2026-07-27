import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Copy,
  Mail,
  MessageCircle,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Check,
} from "lucide-react";

const SITE_ORIGIN = "https://www.mountkailashslu.com";

type CartItem = { product_id?: string; name?: string; quantity?: number; price_usd?: number };

type Cart = {
  id: string;
  email: string | null;
  customer_name: string | null;
  phone: string | null;
  items: CartItem[];
  subtotal_usd: number;
  recovered: boolean;
  recovered_order_id: string | null;
  last_seen_at: string;
  created_at: string;
  recovery_sent_at: string | null;
  recovery_sent_count: number;
  admin_notes: string | null;
};

const money = (n: number | string) => `$${Number(n || 0).toFixed(2)}`;
const when = (d: string | null) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

const recoveryLink = (id: string) => `${SITE_ORIGIN}/cart?recover=${id}`;

function recoveryMessage(cart: Cart) {
  const first = (cart.customer_name || "").split(" ")[0] || "there";
  const items = (cart.items || [])
    .map((i) => `${i.name ?? "item"} ×${i.quantity ?? 1}`)
    .join(", ");
  return `Hi ${first}, this is Mount Kailash Rejuvenation Centre. We saved your bag${
    items ? ` (${items})` : ""
  } — total ${money(cart.subtotal_usd)}. You can finish checking out here: ${recoveryLink(
    cart.id
  )}\n\nIf anything held you up — shipping, payment or choosing the right blend — just reply and we'll help.`;
}

export default function AdminAbandonedCarts() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"open" | "recovered" | "all">("open");
  const [search, setSearch] = useState("");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("abandoned_carts")
      .select("*")
      .order("last_seen_at", { ascending: false })
      .limit(300);
    if (error) toast.error(error.message);
    setCarts(((data as unknown as Cart[]) || []).map((c) => ({ ...c, items: (c.items as CartItem[]) ?? [] })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return carts.filter((c) => {
      if (tab === "open" && c.recovered) return false;
      if (tab === "recovered" && !c.recovered) return false;
      if (!q) return true;
      return (
        (c.email || "").toLowerCase().includes(q) ||
        (c.customer_name || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q)
      );
    });
  }, [carts, tab, search]);

  const openCarts = carts.filter((c) => !c.recovered);
  const stats = {
    open: openCarts.length,
    value: openCarts.reduce((s, c) => s + Number(c.subtotal_usd || 0), 0),
    contacted: openCarts.filter((c) => c.recovery_sent_count > 0).length,
    recovered: carts.filter((c) => c.recovered).length,
  };

  const patch = async (id: string, updates: Partial<Cart>) => {
    setCarts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    const { error } = await supabase.from("abandoned_carts").update(updates as never).eq("id", id);
    if (error) {
      toast.error(error.message);
      load();
    }
  };

  const markSent = (cart: Cart) =>
    patch(cart.id, {
      recovery_sent_at: new Date().toISOString(),
      recovery_sent_count: (cart.recovery_sent_count || 0) + 1,
    });

  const sendWhatsApp = (cart: Cart) => {
    if (!cart.phone) return toast.error("No phone number captured for this cart.");
    const num = cart.phone.replace(/[^\d]/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(recoveryMessage(cart))}`, "_blank");
    markSent(cart);
  };

  const sendEmail = (cart: Cart) => {
    if (!cart.email) return toast.error("No email captured for this cart.");
    const subject = encodeURIComponent("Your Mount Kailash bag is still waiting");
    window.open(
      `mailto:${cart.email}?subject=${subject}&body=${encodeURIComponent(recoveryMessage(cart))}`,
      "_blank"
    );
    markSent(cart);
  };

  const copy = async (cart: Cart) => {
    await navigator.clipboard.writeText(recoveryLink(cart.id)).catch(() => {});
    toast.success("Recovery link copied");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("abandoned_carts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setCarts((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cart removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Abandoned Carts</h1>
          <p className="text-sm text-muted-foreground">
            Shoppers who entered their details at checkout but didn't complete payment.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Open carts", value: String(stats.open) },
          { label: "Value at risk", value: money(stats.value) },
          { label: "Contacted", value: String(stats.contacted) },
          { label: "Recovered", value: String(stats.recovered) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-md border border-border overflow-hidden">
          {(["open", "recovered", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`min-h-[44px] px-4 text-sm capitalize ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-11"
            placeholder="Search name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search abandoned carts"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground py-10 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-foreground font-medium">No carts here yet</p>
          <p className="text-sm text-muted-foreground">
            Carts appear once a shopper enters their email on checkout and leaves without paying.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cart) => (
            <div key={cart.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{cart.customer_name || "Unknown shopper"}</p>
                    {cart.recovered ? (
                      <Badge className="bg-primary/10 text-primary border-primary/30" variant="outline">
                        Recovered
                      </Badge>
                    ) : cart.recovery_sent_count > 0 ? (
                      <Badge variant="outline">Contacted ×{cart.recovery_sent_count}</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                        Not contacted
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cart.email || "no email"}
                    {cart.phone ? ` · ${cart.phone}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last seen {when(cart.last_seen_at)}
                    {cart.recovery_sent_at ? ` · last contacted ${when(cart.recovery_sent_at)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{money(cart.subtotal_usd)}</p>
                  <p className="text-xs text-muted-foreground">
                    {(cart.items || []).reduce((s, i) => s + Number(i.quantity || 0), 0)} item(s)
                  </p>
                </div>
              </div>

              <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                {(cart.items || []).map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span className="truncate">
                      {i.name ?? "Item"} ×{i.quantity ?? 1}
                    </span>
                    <span>{money(Number(i.price_usd || 0) * Number(i.quantity || 1))}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" className="gap-1.5" onClick={() => sendWhatsApp(cart)} disabled={!cart.phone}>
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => sendEmail(cart)}>
                  <Mail className="h-3.5 w-3.5" /> Email
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copy(cart)}>
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </Button>
                {!cart.recovered && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => patch(cart.id, { recovered: true })}
                  >
                    <Check className="h-3.5 w-3.5" /> Mark recovered
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpanded(expanded === cart.id ? null : cart.id)}
                >
                  {expanded === cart.id ? "Hide note" : "Note"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-destructive"
                  onClick={() => setDeleteId(cart.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>

              {expanded === cart.id && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    rows={3}
                    placeholder="Internal note (not shown to the customer)"
                    value={notesDraft[cart.id] ?? cart.admin_notes ?? ""}
                    onChange={(e) => setNotesDraft((p) => ({ ...p, [cart.id]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      patch(cart.id, { admin_notes: notesDraft[cart.id] ?? cart.admin_notes ?? "" }).then(
                        () => toast.success("Note saved")
                      )
                    }
                  >
                    Save note
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the captured cart and its recovery history. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) remove(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
