/** Full admins only: invite, revoke and re-invite Consultation Editors.
 *  Every privileged operation runs through the `consultation-invite-editor`
 *  edge function, which re-checks full-admin status server-side. Modelled on
 *  src/components/admin/wce/WceOrganisers.tsx. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mail, RotateCcw, Trash2, ShieldCheck } from "lucide-react";

type Row = {
  email: string;
  display_name: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  expires_at: string | null;
  resend_count: number;
  status: "active" | "pending" | "expired" | "revoked";
};

const db = supabase as any;

/** Invitation links are valid for 12 hours; after that a resend is required. */
const INVITE_TTL_HOURS = 12;

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
}

function isExpired(expiresAt: string | null) {
  return Boolean(expiresAt) && new Date(expiresAt).getTime() <= Date.now();
}

const STATUS_TONE: Record<Row["status"], string> = {
  active: "bg-emerald-100 text-emerald-900 border-emerald-300",
  pending: "bg-amber-100 text-amber-900 border-amber-300",
  expired: "bg-neutral-200 text-neutral-700 border-neutral-300",
  revoked: "bg-rose-100 text-rose-900 border-rose-300",
};

const STATUS_LABEL: Record<Row["status"], string> = {
  active: "Active",
  pending: "Invited",
  expired: "Expired",
  revoked: "Revoked",
};

/** "Consultation Editors" panel — visible to full admins only. */
export default function ConsultationEditors() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, invitesRes] = await Promise.all([
        db.from("user_roles").select("id, user_id, created_at").eq("role", "consultation_editor"),
        db.from("consultation_editor_invites")
          .select("email, display_name, invited_at, accepted_at, status, expires_at, resend_count")
          .order("invited_at", { ascending: false }),
      ]);
      if (rolesRes.error) throw rolesRes.error;
      if (invitesRes.error) throw invitesRes.error;

      const roles = rolesRes.data ?? [];
      const ids = roles.map((r: any) => r.user_id);
      let emails: Record<string, string> = {};
      if (ids.length) {
        const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", ids);
        emails = Object.fromEntries((profiles ?? []).map((p) => [p.id, (p.email ?? "").toLowerCase()]));
      }

      const map = new Map<string, Row>();
      for (const inv of invitesRes.data ?? []) {
        const key = (inv.email as string).toLowerCase();
        const expires = inv.expires_at ?? null;
        const base =
          inv.status === "revoked" ? "revoked" : inv.status === "accepted" ? "active" : "pending";
        map.set(key, {
          email: key,
          display_name: inv.display_name ?? null,
          invited_at: inv.invited_at ?? null,
          accepted_at: inv.accepted_at ?? null,
          expires_at: expires,
          resend_count: Number(inv.resend_count ?? 0),
          status: base === "pending" && isExpired(expires) ? "expired" : (base as Row["status"]),
        });
      }
      for (const r of roles) {
        const key = emails[r.user_id] || r.user_id;
        const prior = map.get(key);
        map.set(key, {
          email: key,
          display_name: prior?.display_name ?? null,
          invited_at: prior?.invited_at ?? r.created_at,
          accepted_at: prior?.accepted_at ?? null,
          expires_at: prior?.expires_at ?? null,
          resend_count: prior?.resend_count ?? 0,
          status:
            (prior?.status === "pending" || prior?.status === "expired") && !prior?.accepted_at
              ? (prior.status as Row["status"])
              : "active",
        });
      }

      setRows(
        Array.from(map.values()).sort((a, b) => {
          const order = { active: 0, pending: 1, expired: 2, revoked: 3 } as const;
          if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
          return (b.invited_at ?? "").localeCompare(a.invited_at ?? "");
        }),
      );
    } catch (e: any) {
      toast({ title: "Could not load consultation editors", description: e?.message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);

  const call = async (
    action: "invite" | "resend" | "revoke",
    payload: { email: string; display_name?: string | null },
  ) => {
    const { data, error } = await supabase.functions.invoke("consultation-invite-editor", {
      body: {
        action,
        email: payload.email,
        display_name: payload.display_name ?? null,
        redirect_to: `${window.location.origin}/consultation-admin/accept`,
      },
    });
    if (error) {
      let msg = error.message;
      try {
        const body = await (error as any).context?.json?.();
        if (body?.error) msg = body.error;
      } catch { /* keep the transport message */ }
      throw new Error(msg);
    }
    if (data?.error) throw new Error(data.error);
    return data as {
      already_existed?: boolean; email_sent?: boolean; email_error?: string | null;
      expires_at?: string | null;
    };
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.trim().toLowerCase();
    if (!target) return;
    setBusy(target);
    try {
      const res = await call("invite", { email: target, display_name: name.trim() || null });
      if (res && res.email_sent === false) {
        toast({
          title: "Access granted, but the email did not send",
          description: `${target} now holds editor access. ${res.email_error ?? "The mail provider refused the message."} Use Resend to try again.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: res?.already_existed ? "Existing account granted editor access" : "Invitation sent",
          description: res?.already_existed
            ? `${target} already had an account here, so they now hold editor access. A set-password email has been sent.`
            : `${target} will receive an email with a link to set their password. The link is valid for ${INVITE_TTL_HOURS} hours.`,
        });
      }
      setEmail("");
      setName("");
      await load();
    } catch (e: any) {
      toast({ title: "Could not send invitation", description: e?.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const resend = async (row: Row) => {
    setBusy(row.email);
    try {
      await call("resend", { email: row.email, display_name: row.display_name });
      toast({
        title: "Invitation resent",
        description: `A fresh link is on its way to ${row.email}. Any earlier link stops working, and this one is valid for ${INVITE_TTL_HOURS} hours.`,
      });
      await load();
    } catch (e: any) {
      toast({ title: "Could not resend invitation", description: e?.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const revoke = async (row: Row) => {
    if (!window.confirm(`Revoke consultation editor access for ${row.email}? They will immediately lose access to the consultations admin console.`)) return;
    setBusy(row.email);
    try {
      await call("revoke", { email: row.email });
      toast({ title: "Editor access revoked", description: row.email });
      await load();
    } catch (e: any) {
      toast({ title: "Could not revoke access", description: e?.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const counts = useMemo(() => ({
    active: rows.filter((r) => r.status === "active").length,
    pending: rows.filter((r) => r.status === "pending").length,
  }), [rows]);

  // Guard inside the component: this panel must never render for anyone but a
  // full admin, even if a parent forgets to gate it.
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
          <ShieldCheck className="h-5 w-5" />
          Consultation Editors
        </CardTitle>
        <CardDescription>
          People with editor access can manage bookings in this console. Only full administrators
          can invite, resend or revoke access — {counts.active} active, {counts.pending} pending.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={invite} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="ce-email">Email address</Label>
            <Input
              id="ce-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ minHeight: 44 }}
            />
          </div>
          <div>
            <Label htmlFor="ce-name">Name (optional)</Label>
            <Input
              id="ce-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              style={{ minHeight: 44 }}
            />
          </div>
          <Button type="submit" disabled={!email.trim() || busy === email.trim().toLowerCase()} style={{ minHeight: 44 }}>
            {busy === email.trim().toLowerCase() ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            Invite
          </Button>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No consultation editors yet. Invite someone above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.email}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{row.display_name || row.email}</span>
                    <Badge variant="outline" className={STATUS_TONE[row.status]}>
                      {STATUS_LABEL[row.status]}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{row.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Invited {fmt(row.invited_at)}
                    {row.accepted_at ? ` · Accepted ${fmt(row.accepted_at)}` : ""}
                    {row.resend_count > 0 ? ` · Resent ${row.resend_count}×` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {row.status !== "active" && row.status !== "revoked" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy === row.email}
                      onClick={() => resend(row)}
                      style={{ minHeight: 44 }}
                    >
                      {busy === row.email ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                      <span className="ml-1.5">Resend</span>
                    </Button>
                  )}
                  {row.status !== "revoked" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy === row.email}
                      onClick={() => revoke(row)}
                      style={{ minHeight: 44 }}
                      className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1.5">Revoke</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
