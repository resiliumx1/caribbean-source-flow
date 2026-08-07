/** Full admins only: view/edit where business-side consultation notifications
 *  go (new bookings, reschedules, cancellations, no-shows, admin alerts).
 *  Customer-facing email is unaffected — it always goes to the booker. */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";

const SETTINGS_KEY = "consultation_notifications";
const FALLBACK = "Mountkailashherbalschool@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ConsultationNotifySettings() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("consultation_settings")
        .select("value")
        .eq("key", SETTINGS_KEY)
        .maybeSingle();
      if (!error && data?.value) {
        setEmail(data.value.notify_email ?? FALLBACK);
        setLabel(data.value.label ?? null);
      } else {
        setEmail(FALLBACK);
      }
      setLoading(false);
    })();
  }, [isAdmin]);

  const save = async () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any)
      .from("consultation_settings")
      .upsert(
        { key: SETTINGS_KEY, value: { label: label ?? "Consultations notification address", notify_email: trimmed } },
        { onConflict: "key" },
      );
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Notification address updated", description: trimmed });
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" />
          Consultations notification address
        </CardTitle>
        <CardDescription>
          Business-side email for consultations — new bookings, reschedules, cancellations,
          no-shows and admin alerts — is sent here. Customer-facing email is unaffected; it
          always goes to the person who booked.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="notify-email">Notification email</Label>
              <Input
                id="notify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ minHeight: 44 }}
              />
            </div>
            <Button onClick={save} disabled={saving} style={{ minHeight: 44 }}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
