/** Full admins only: invite, revoke and re-invite WCE 2026 organisers.
 *  Every privileged operation runs through the `wce-invite-organiser` edge
 *  function, which re-checks full-admin status server-side. A wce_admin never
 *  sees this section (AdminWCE omits it from the navigation entirely). */
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, ShieldCheck, Send, RotateCcw, Mail } from "lucide-react";
import { SectionHeading, StatCard } from "./ui";
import {
  wceToast, useConfirm, InfoTip, TipLabel, CardsSkeleton, StatsSkeleton,
  GuidedEmpty, SaveBadge, useSaveState, Expander,
} from "./kit";

type Row = {
  email: string;
  display_name: string | null;
  user_id: string | null;
  role_id: string | null;
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

/** "expires in 7h 20m" / "expired 2h ago" for a pending invitation window. */
function expiryLabel(expiresAt: string | null) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  const mins = Math.round(Math.abs(diff) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const span = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return diff > 0 ? `Expires in ${span}` : `Expired ${span} ago`;
}

function isExpired(expiresAt: string | null) {
  return Boolean(expiresAt) && new Date(expiresAt as string).getTime() <= Date.now();
}

export default function WceOrganisers() {
  const confirm = useConfirm();
  const { state, message, run } = useSaveState();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  // Re-render each minute so the countdown and expiry pills stay truthful.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, invitesRes] = await Promise.all([
        db.from("user_roles").select("id, user_id, created_at").eq("role", "wce_admin"),
        db.from("wce_organiser_invites")
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
          user_id: null,
          role_id: null,
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
          user_id: r.user_id,
          role_id: r.id,
          invited_at: prior?.invited_at ?? r.created_at,
          accepted_at: prior?.accepted_at ?? null,
          expires_at: prior?.expires_at ?? null,
          resend_count: prior?.resend_count ?? 0,
          // Holding the role means access is live, whatever the invite says.
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
      wceToast({ title: "Could not load organisers", description: e?.message, tone: "error" });
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const call = async (
    action: "invite" | "resend" | "revoke",
    payload: { email: string; display_name?: string | null },
  ) => {
    const { data, error } = await supabase.functions.invoke("wce-invite-organiser", {
      body: {
        action,
        email: payload.email,
        display_name: payload.display_name ?? null,
        redirect_to: `${window.location.origin}/wce-admin/accept`,
      },
    });
    if (error) {
      // Edge errors carry the JSON body in the response.
      let msg = error.message;
      try {
        const body = await (error as any).context?.json?.();
        if (body?.error) msg = body.error;
      } catch { /* keep the transport message */ }
      throw new Error(msg);
    }
    if (data?.error) throw new Error(data.error);
    return data as { already_existed?: boolean; email_sent?: boolean; expires_at?: string | null };
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.trim().toLowerCase();
    if (!target) return;
    setBusy(target);
    await run({
      label: "Invitation",
      write: async () => {
        const res = await call("invite", { email: target, display_name: name.trim() || null });
        wceToast({
          title: res?.already_existed
            ? "Existing account granted organiser access"
            : "Invitation sent",
          description: res?.already_existed
            ? `${target} already had an account here, so they now hold organiser access. A set-password email has been sent.`
            : `${target} will receive an email with a link to set their password. The link is valid for ${INVITE_TTL_HOURS} hours.`,
        });
        setEmail("");
        setName("");
      },
      onDone: () => { void load(); },
    });
    setBusy(null);
  };

  const resend = async (row: Row) => {
    setBusy(row.email);
    const snapshot = rows;
    const optimisticExpiry = new Date(Date.now() + INVITE_TTL_HOURS * 3600_000).toISOString();
    await run({
      label: "Invitation",
      optimistic: () =>
        setRows((p) =>
          p.map((r) =>
            r.email === row.email
              ? {
                  ...r,
                  status: "pending",
                  invited_at: new Date().toISOString(),
                  accepted_at: null,
                  expires_at: optimisticExpiry,
                  resend_count: r.resend_count + 1,
                }
              : r,
          ),
        ),
      rollback: () => setRows(snapshot),
      write: async () => {
        await call("resend", { email: row.email, display_name: row.display_name });
        wceToast({
          title: "Invitation resent",
          description: `A fresh link is on its way to ${row.email}. Any earlier link stops working, and this one is valid for ${INVITE_TTL_HOURS} hours.`,
        });
      },
      onDone: () => { void load(); },
    });
    setBusy(null);
  };

  const revoke = async (row: Row) => {
    const ok = await confirm({
      title: "Revoke organiser access?",
      item: row.email,
      body: "They will immediately lose access to the WCE organiser console. Their account stays, but signing in will no longer let them in.",
      confirmLabel: "Revoke access",
    });
    if (!ok) return;
    setBusy(row.email);
    const snapshot = rows;
    await run({
      label: "Access change",
      optimistic: () => setRows((p) => p.map((r) => (r.email === row.email ? { ...r, status: "revoked", role_id: null } : r))),
      rollback: () => setRows(snapshot),
      write: async () => {
        await call("revoke", { email: row.email });
        wceToast({ title: "Organiser access revoked", description: row.email });
      },
      onDone: () => { void load(); },
    });
    setBusy(null);
  };

  const counts = useMemo(() => ({
    active: rows.filter((r) => r.status === "active").length,
    pending: rows.filter((r) => r.status === "pending").length,
    expired: rows.filter((r) => r.status === "expired").length,
    revoked: rows.filter((r) => r.status === "revoked").length,
  }), [rows]);

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Organisers"
        sub="Invite the event team by email. Organisers see this console and WCE orders only — never the rest of the store admin, and they cannot invite anyone themselves."
      />

      {loading ? <StatsSkeleton count={3} /> : (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Active organisers" value={counts.active} accent="sage" hint="Can sign in right now" />
          <StatCard label="Awaiting acceptance" value={counts.pending} accent="gold" hint="Invited, password not set" />
          <StatCard label="Revoked" value={counts.revoked} accent="terracotta" hint="Access removed" />
        </div>
      )}

      {/* Invite form */}
      <form onSubmit={invite} className="wa-panel" style={{ display: "grid", gap: "0.9rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <h3 className="wa-serif" style={{ fontSize: "1.2rem", margin: 0 }}>
            <ShieldCheck className="h-4 w-4" aria-hidden style={{ display: "inline", marginRight: 6, color: "var(--wa-gold)" }} />
            Invite an organiser
          </h3>
          <SaveBadge state={state} message={message} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <TipLabel htmlFor="wce-inv-email" tip="We email this address a one-time link. They choose their own password — you never see or set it. Only addresses you invite here gain organiser access.">
              Email address
            </TipLabel>
            <input
              id="wce-inv-email"
              type="email"
              required
              placeholder="organiser@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="wa-field-label" htmlFor="wce-inv-name">Name (optional)</label>
            <input
              id="wce-inv-name"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <p className="wa-hint">
          If the address already has an account on this site, we simply add organiser access to it and email them a
          set-password link instead of a new invitation.
        </p>

        <div>
          <button type="submit" className="wa-btn wa-btn-primary" disabled={busy !== null}>
            {busy && state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            Send invitation
          </button>
        </div>
      </form>

      {/* Organisers & invites */}
      {loading ? (
        <CardsSkeleton count={3} lines={2} />
      ) : rows.length === 0 ? (
        <div className="wa-panel">
          <GuidedEmpty
            title="No organisers yet"
            line="Invite your first team member using the form above. They will receive an email with a link to set a password, then land straight in this console."
          />
        </div>
      ) : (
        <div className="wa-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Invited</th>
                <th>Accepted</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email}>
                  <td data-label="Email">
                    <div className="wa-strong" style={{ wordBreak: "break-word" }}>{r.email}</div>
                    {r.display_name && <div className="wa-muted" style={{ fontSize: "0.8rem" }}>{r.display_name}</div>}
                  </td>
                  <td data-label="Status">
                    <span
                      className="wa-pill"
                      data-tone={r.status === "active" ? "accepted" : r.status === "pending" ? "new" : "declined"}
                    >
                      {r.status === "active" ? "Active" : r.status === "pending" ? "Pending" : "Revoked"}
                    </span>
                  </td>
                  <td data-label="Invited" className="whitespace-nowrap">{fmt(r.invited_at)}</td>
                  <td data-label="Accepted" className="whitespace-nowrap">{fmt(r.accepted_at)}</td>
                  <td data-label="Actions">
                    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {r.status !== "active" && (
                        <button
                          type="button"
                          className="wa-btn wa-btn-ghost"
                          style={{ padding: "0 0.75rem", fontSize: "0.72rem" }}
                          disabled={busy === r.email}
                          onClick={() => void resend(r)}
                        >
                          {busy === r.email ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <RotateCcw className="h-3.5 w-3.5" aria-hidden />}
                          {r.status === "revoked" ? "Re-invite" : "Resend"}
                        </button>
                      )}
                      {r.status !== "revoked" && (
                        <button
                          type="button"
                          className="wa-btn wa-btn-danger"
                          style={{ padding: "0 0.75rem", fontSize: "0.72rem" }}
                          disabled={busy === r.email}
                          onClick={() => void revoke(r)}
                          aria-label={`Revoke organiser access for ${r.email}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden /> Revoke
                        </button>
                      )}
                      <InfoTip label="Revoking access">
                        Removes their organiser role at once, so the console and WCE orders become unreachable for them.
                        Their login still exists and nothing they entered is deleted — you can re-invite them later.
                      </InfoTip>
                    </div>
                    <Expander label="What they can see">
                      <p className="wa-hint">
                        This console only: leads, WCE orders, referral codes, pathways, speakers, media, FAQs and
                        event settings. No products, customers, store orders or payments.
                      </p>
                    </Expander>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="wa-hint" style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <Mail className="h-4 w-4" aria-hidden style={{ color: "var(--wa-gold)", flex: "none", marginTop: 2 }} />
        Invitation links expire and can be used once. If someone says the link no longer works, use Resend.
      </p>
    </div>
  );
}
