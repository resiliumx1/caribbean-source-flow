import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, RefreshCw, ExternalLink, Save, DollarSign } from "lucide-react";
import type { ConsultationSettings } from "@/components/consultation/ConsultationBookingForm";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  amount_paid_usd: number;
  payment_transaction_id: string | null;
  status: string;
  calendly_event_uri: string | null;
  scheduled_at: string | null;
  created_at: string;
  landing_path: string | null;
  utm_source: string | null;
}

function relativeTime(iso: string | null) {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminConsultations() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ConsultationSettings | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: bookingsData, error: bookingsErr }, { data: settingsData, error: settingsErr }] = await Promise.all([
      supabase
        .from("consultation_bookings")
        .select("id, name, email, phone, amount_paid_usd, payment_transaction_id, status, calendly_event_uri, scheduled_at, created_at, landing_path, utm_source")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("consultation_settings").select("value").eq("key", "consultation").single(),
    ]);

    if (bookingsErr) {
      toast({ title: "Error loading bookings", description: bookingsErr.message, variant: "destructive" });
    } else {
      setBookings((bookingsData as Booking[]) || []);
    }

    if (settingsErr) {
      toast({ title: "Error loading settings", description: settingsErr.message, variant: "destructive" });
    } else {
      setSettings((settingsData?.value as unknown as ConsultationSettings) || null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateSetting = (field: keyof ConsultationSettings, value: string | number) => {
    if (!settings) return;
    setSettings((s) => ({
      ...s!,
      [field]: typeof value === "number" ? value : value,
    }));
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("consultation_settings")
      .update({ value: settings as unknown as Record<string, unknown> })
      .eq("key", "consultation");
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-bold">Consultation Bookings</h1>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Settings card */}
      {settings && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-serif font-semibold text-lg mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Consultation Settings
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="fee">Fee (USD)</Label>
              <Input
                id="fee"
                type="number"
                value={settings.fee_usd}
                onChange={(e) => updateSetting("fee_usd", Number(e.target.value))}
                min={0}
                step={0.01}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={settings.duration_minutes}
                onChange={(e) => updateSetting("duration_minutes", Number(e.target.value))}
                min={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notice">Notice (hours)</Label>
              <Input
                id="notice"
                type="number"
                value={settings.notice_hours}
                onChange={(e) => updateSetting("notice_hours", Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Calendly Event Slug</Label>
              <Input
                id="slug"
                value={settings.calendly_event_slug}
                onChange={(e) => updateSetting("calendly_event_slug", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      )}

      {/* Bookings table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No consultation bookings yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold">Paid</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Source</th>
                  <th className="text-left px-4 py-3 font-semibold">Booked</th>
                  <th className="text-left px-4 py-3 font-semibold">Calendly</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{b.name}</td>
                    <td className="px-4 py-3">
                      <div>{b.email}</div>
                      {b.phone && <div className="text-muted-foreground">{b.phone}</div>}
                    </td>
                    <td className="px-4 py-3">${Number(b.amount_paid_usd).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: b.status === "paid" ? "rgba(21,128,61,0.12)" : "rgba(234,179,8,0.12)",
                          color: b.status === "paid" ? "#15803d" : "#a16207",
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.utm_source ? (
                        <span className="text-xs">{b.utm_source}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{relativeTime(b.created_at)}</td>
                    <td className="px-4 py-3">
                      {b.calendly_event_uri ? (
                        <a
                          href={b.calendly_event_uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">Not scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
