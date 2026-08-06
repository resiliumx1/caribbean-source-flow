/** Accept-invite / set-password screen for WCE 2026 organisers.
 *  Reached from the invite email. Supabase delivers either a token hash in the
 *  query string (?token_hash=…&type=invite) or a session in the URL hash. */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";
import { LoveEmblem } from "@/components/wce/LoveEmblem";
import { FlowerOfLifeField, DiamondRule } from "@/components/wce/decor";
import "@/styles/wce.css";

type Phase = "verifying" | "ready" | "invalid" | "done";

export default function WceAdminAccept() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("verifying");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      // 1. Newer Supabase links: ?token_hash=…&type=invite|recovery
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      if (tokenHash && type) {
        const { error: vErr } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "invite" | "recovery" | "signup" | "email",
        });
        if (!active) return;
        if (vErr) {
          setError(vErr.message);
          setPhase("invalid");
          return;
        }
      }

      // 2. Classic links put the session in the URL hash; the client picks it up.
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        setPhase("invalid");
        return;
      }
      setEmail(session.user.email ?? null);
      setPhase("ready");
    })();

    return () => { active = false; };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");

    setBusy(true);
    const { data: userRes, error: upErr } = await supabase.auth.updateUser({ password });
    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }

    // Mark the invite accepted. Best-effort: organisers cannot read this table,
    // so a permission error here must never block them from getting in.
    const addr = (userRes.user?.email ?? email ?? "").toLowerCase();
    if (addr) {
      await (supabase as any)
        .from("wce_organiser_invites")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("email", addr);
    }

    setBusy(false);
    setPhase("done");
    setTimeout(() => navigate("/admin/wce", { replace: true }), 900);
  };

  return (
    <main
      className="wce-root"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(120% 90% at 50% 0%, var(--wce-forest-mid) 0%, var(--wce-forest) 62%, #08180F 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.25rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <FlowerOfLifeField opacity={0.06} />

      <section
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 452,
          background: "rgba(8, 24, 15, 0.55)",
          border: "1px solid rgba(201, 162, 39, 0.24)",
          borderRadius: 6,
          padding: "2.5rem 1.75rem 2rem",
          boxShadow: "0 30px 80px rgba(0,0,0,0.42)",
          backdropFilter: "blur(3px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
          <LoveEmblem size={168} variant="cream" />
        </div>

        <p className="wce-eyebrow" style={{ textAlign: "center", color: "var(--wce-gold-light)", marginBottom: "0.5rem" }}>
          Caribbean Wellness Experience 2026
        </p>

        <h1
          className="wce-display"
          style={{
            textAlign: "center",
            color: "var(--wce-cream)",
            fontSize: "clamp(1.75rem, 5.4vw, 2.35rem)",
            margin: 0,
          }}
        >
          {phase === "done" ? "Welcome Aboard" : "Accept Your Invitation"}
        </h1>

        <div style={{ margin: "1rem 0 1.5rem" }}>
          <DiamondRule tone="var(--wce-gold)" />
        </div>

        {error && (
          <p
            role="alert"
            style={{
              fontSize: "0.85rem",
              color: "#F3C9C9",
              background: "rgba(180, 60, 60, 0.16)",
              border: "1px solid rgba(220, 120, 120, 0.4)",
              borderRadius: 4,
              padding: "0.7rem 0.85rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </p>
        )}

        {phase === "verifying" && (
          <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem 0" }}>
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--wce-gold)" }} />
          </div>
        )}

        {phase === "invalid" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--wce-cream-body)", lineHeight: 1.6 }}>
              This invitation link is no longer valid. Invitation links expire, and each one can
              only be used once. Ask the event team to send a fresh invite.
            </p>
            <Link to="/wce-admin/login" style={{ ...linkBtn, display: "inline-block", marginTop: "1rem" }}>
              Go to organiser sign in
            </Link>
          </div>
        )}

        {phase === "done" && (
          <div style={{ textAlign: "center" }}>
            <ShieldCheck className="h-8 w-8" style={{ color: "var(--wce-gold-light)", margin: "0 auto 0.75rem" }} />
            <p style={{ fontSize: "0.9rem", color: "var(--wce-cream-body)" }}>
              Your password is set. Taking you to the organiser console…
            </p>
          </div>
        )}

        {phase === "ready" && (
          <form onSubmit={submit} style={{ display: "grid", gap: "1rem" }}>
            {email && (
              <p style={{ fontSize: "0.85rem", color: "var(--wce-cream-soft)", textAlign: "center" }}>
                Setting a password for <strong style={{ color: "var(--wce-cream)" }}>{email}</strong>
              </p>
            )}
            <div>
              <label htmlFor="wce-accept-pw" style={labelStyle}>Choose a password</label>
              <input
                id="wce-accept-pw"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div>
              <label htmlFor="wce-accept-pw2" style={labelStyle}>Confirm password</label>
              <input
                id="wce-accept-pw2"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="wce-btn wce-btn-gold"
              style={{
                minHeight: 48,
                width: "100%",
                borderRadius: 4,
                fontFamily: "var(--wce-body)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: "0.78rem",
                cursor: busy ? "wait" : "pointer",
                opacity: busy ? 0.75 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Set password &amp; continue
            </button>
          </form>
        )}

        <p
          style={{
            marginTop: "1.75rem",
            textAlign: "center",
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
            color: "var(--wce-cream-soft)",
            opacity: 0.75,
          }}
        >
          Organiser accounts are issued directly by the event team.
        </p>
      </section>
    </main>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 4,
  border: "1px solid rgba(201, 162, 39, 0.38)",
  background: "rgba(245, 239, 224, 0.06)",
  color: "var(--wce-cream)",
  padding: "0.7rem 0.9rem",
  fontFamily: "var(--wce-body)",
  fontSize: "1rem",
  outlineColor: "var(--wce-gold)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontFamily: "var(--wce-body)",
  fontSize: "0.72rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--wce-gold-light)",
};

const linkBtn: React.CSSProperties = {
  fontFamily: "var(--wce-body)",
  fontSize: "0.85rem",
  color: "var(--wce-gold-light)",
  textDecoration: "underline",
  minHeight: 44,
  lineHeight: "44px",
};
