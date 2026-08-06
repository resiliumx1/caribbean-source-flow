/** Full admins only: grant or revoke the narrow wce_admin role by email.
 *  Roles live in public.user_roles, which is writable only by full admins at the
 *  RLS level — a wce_admin hitting this table directly is refused. */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ShieldCheck } from "lucide-react";
import { inputCls } from "./shared";

type Organiser = { id: string; user_id: string; email: string; created_at: string };

const db = supabase as any;

export default function WceOrganisers() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Organiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: roles, error } = await db
        .from("user_roles")
        .select("id, user_id, created_at")
        .eq("role", "wce_admin")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const ids = (roles ?? []).map((r: any) => r.user_id);
      let emails: Record<string, string> = {};
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles").select("id, email").in("id", ids);
        emails = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.email]));
      }
      setRows((roles ?? []).map((r: any) => ({ ...r, email: emails[r.user_id] ?? r.user_id })));
    } catch (e: any) {
      toast({ variant: "destructive", title: "Could not load organisers", description: e.message });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const grant = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.trim().toLowerCase();
    if (!target) return;
    setSaving(true);
    try {
      const { data: profile, error: pErr } = await supabase
        .from("profiles").select("id").ilike("email", target).maybeSingle();
      if (pErr) throw pErr;
      if (!profile) {
        toast({
          variant: "destructive",
          title: "No account found",
          description: "The person must already have an account on the site before they can be made an organiser.",
        });
        setSaving(false);
        return;
      }
      const { error } = await db
        .from("user_roles")
        .upsert({ user_id: profile.id, role: "wce_admin" }, { onConflict: "user_id,role" });
      if (error) throw error;
      toast({ title: "Organiser access granted", description: target });
      setEmail("");
      await load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Could not grant access", description: e.message });
    }
    setSaving(false);
  };

  const revoke = async (row: Organiser) => {
    if (!confirm(`Remove organiser access for ${row.email}?`)) return;
    const { error } = await db.from("user_roles").delete().eq("id", row.id);
    if (error) {
      toast({ variant: "destructive", title: "Could not revoke access", description: error.message });
      return;
    }
    toast({ title: "Organiser access revoked", description: row.email });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> WCE Organisers
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Organisers can manage this WCE section and see WCE orders only. They cannot reach any
          other part of the store admin, and cannot grant roles.
        </p>

        <form onSubmit={grant} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            className={inputCls}
            placeholder="organiser@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={saving} className="min-h-[44px] shrink-0">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Grant organiser access
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No organisers yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{r.email}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Added {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => revoke(r)}
                  className="text-destructive inline-flex items-center gap-1.5 text-xs min-h-[44px] px-2"
                  aria-label={`Revoke organiser access for ${r.email}`}
                >
                  <Trash2 className="h-4 w-4" /> Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}