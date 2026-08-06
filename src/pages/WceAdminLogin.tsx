/** Organiser access for the Caribbean Wellness Experience 2026 team.
 *  Dressed in the event identity, not the store admin's. No sign-up: accounts are
 *  created by a full admin. Failure messages are deliberately generic so the form
 *  cannot be used to discover which addresses exist or which have access. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { LoveEmblem } from "@/components/wce/LoveEmblem";
import { FlowerOfLifeField, DiamondRule } from "@/components/wce/decor";
import "@/styles/wce.css";

const GENERIC_FAIL = "Those details do not match an organiser account.";

export default function WceAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "request-reset" | "set-password">("signin");
  const [checking, setChecking] = useState(true);

  // Recovery links land back here with a recovery hash.
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      setMode("set-password");
      setChecking(false);
      return;
    }
    // If an organiser is already signed in, send them straight through.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return setChecking(false);
      const { data } = await (supabase.rpc as any)("has_wce_access", { _user_id: session.user.id });
      if (data) navigate("/admin/wce", { replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !signInData.user) {
      setError(GENERIC_FAIL);
      setBusy(false);
      return;
    }

    const { data: allowed } = await (supabase.rpc as any)("has_wce_access", {
      _user_id: signInData.user.id,
    });

    if (!allowed) {
      // Never leave them half-authenticated.
      await supabase.auth.signOut();
      setError(GENERIC_FAIL);
      setBusy(false);
      return;
    }

    navigate("/admin/wce", { replace: true });
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/wce-admin/login`,
    });
    // Always the same response, regardless of whether the address exists.
    setNotice("If that address belongs to an organiser account, a reset link is on its way.");
    setBusy(false);
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: upErr } = await supabase.auth.updateUser({ password });
    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }
    await supabase.auth.signOut();
    setMode("signin");
    setPassword("");
    setNotice("Password updated. Please sign in.");
    setBusy(false);
    window.location.hash = "";
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 46,
    borderRadius: 4,
    border: "1px solid rgba(201, 162, 39, 0.38)",
    background: "rgba(245, 239, 224, 0.06)",
    color: "var(--wce-cream)",
    padding: "0.7rem 0.9rem",
    fontFamily: "var(--wce-body)",
    fontSize: "0.95rem",
    outlineColor: "var(--wce-gold)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontFamily: "var(--wce-body)",
    fontSize: "0.68rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "var(--wce-gold-light)",
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

        <p
          className="wce-eyebrow"
          style={{ textAlign: "center", color: "var(--wce-gold-light)", marginBottom: "0.5rem" }}
        >
          Caribbean Wellness Experience 2026
        </p>

        <h1
          className="wce-display"
          style={{
            textAlign: "center",
            color: "var(--wce-cream)",
            fontSize: "clamp(1.9rem, 6vw, 2.5rem)",
            margin: 0,
          }}
        >
          {mode === "set-password" ? "Set a New Password" : "Organiser Access"}
        </h1>

        <div style={{ margin: "1rem 0 1.5rem" }}>
          <DiamondRule tone="var(--wce-gold)" />
        </div>

        {notice && (
          <p
            role="status"
            style={{
              fontSize: "0.85rem",
              color: "var(--wce-cream-body)",
              background: "rgba(201, 162, 39, 0.12)",
              border: "1px solid rgba(201, 162, 39, 0.3)",
              borderRadius: 4,
              padding: "0.7rem 0.85rem",
              marginBottom: "1rem",
            }}
          >
            {notice}
          </p>
        )}

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

        {checking ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem 0" }}>
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--wce-gold)" }} />
          </div>
        ) : mode === "set-password" ? (
          <form onSubmit={submitNewPassword} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label htmlFor="wce-new-password" style={labelStyle}>New password</label>
              <input
                id="wce-new-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <SubmitButton busy={busy} label="Update password" />
          </form>
        ) : mode === "request-reset" ? (
          <form onSubmit={submitReset} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label htmlFor="wce-reset-email" style={labelStyle}>Email</label>
              <input
                id="wce-reset-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <SubmitButton busy={busy} label="Send reset link" />
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              style={linkBtn}
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={submitSignIn} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label htmlFor="wce-email" style={labelStyle}>Email</label>
              <input
                id="wce-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div>
              <label htmlFor="wce-password" style={labelStyle}>Password</label>
              <input
                id="wce-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <SubmitButton busy={busy} label="Sign in" />
            <button
              type="button"
              onClick={() => { setMode("request-reset"); setError(null); setNotice(null); }}
              style={linkBtn}
            >
              Forgot your password?
            </button>
          </form>
        )}

        <p
          style={{
            marginTop: "1.75rem",
            textAlign: "center",
            fontSize: "0.72rem",
            letterSpacing: "0.04em",
            color: "var(--wce-cream-soft)",
            opacity: 0.7,
          }}
        >
          Organiser accounts are issued directly by the event team.
        </p>
      </section>
    </main>
  );
}

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "0.5rem",
  minHeight: 44,
  fontFamily: "var(--wce-body)",
  fontSize: "0.8rem",
  color: "var(--wce-gold-light)",
  textDecoration: "underline",
  cursor: "pointer",
};

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
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
      {label}
    </button>
  );
}