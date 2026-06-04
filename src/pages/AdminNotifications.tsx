import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingBag, MessageSquare, Wallet, AlertTriangle, Mail, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Notification = {
  id: string;
  type: "order" | "request" | "payment" | "stock" | "message";
  title: string;
  body: string | null;
  is_read: boolean;
  related_order_id: string | null;
  created_at: string;
};

const TYPE_META: Record<string, { Icon: any; color: string; bg: string }> = {
  order:   { Icon: ShoppingBag,    color: "#15803d", bg: "#15803d18" },
  request: { Icon: MessageSquare,  color: "#1d4ed8", bg: "#1d4ed818" },
  payment: { Icon: Wallet,         color: "#15803d", bg: "#15803d18" },
  stock:   { Icon: AlertTriangle,  color: "#b45309", bg: "#b4530918" },
  message: { Icon: Mail,           color: "#6b7280", bg: "#6b728018" },
};

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h !== 1 ? "s" : ""} ago`;
  }
  const d = Math.floor(diff / 86400);
  if (d < 30) return `${d} day${d !== 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setItems((data as Notification[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("notifications-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    setMarking(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchAll();
  };

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    }
    if (n.related_order_id) {
      navigate("/admin/orders", { state: { openOrderId: n.related_order_id } });
    }
  };

  const unread = items.filter(i => !i.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="h-9 px-3 rounded-md border border-border bg-card text-sm text-foreground hover:bg-muted inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.message;
            const { Icon } = meta;
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className="w-full text-left flex items-start gap-3 p-4 rounded-xl border border-border transition-all min-h-[44px] hover:border-primary/40 hover:shadow-sm"
                style={{ background: n.is_read ? "hsl(var(--card))" : "hsl(var(--primary) / 0.04)" }}
              >
                <span
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{n.body}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">{relativeTime(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <span className="shrink-0 mt-1 w-2.5 h-2.5 rounded-full bg-destructive" aria-label="Unread" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
