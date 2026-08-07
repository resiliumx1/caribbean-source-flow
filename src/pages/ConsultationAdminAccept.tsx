/** Accept-invite / set-password screen for consultation editors.
 *  Reached from the invite email. Supabase delivers either a token hash in the
 *  query string (?token_hash=…&type=invite) or a session in the URL hash.
 *  Modelled on WceAdminAccept.tsx. */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Phase = "verifying" | "ready" | "invalid" | "done";

export default function ConsultationAdminAccept() {
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
    const { error: upErr } = await supabase.auth.updateUser({ password });
    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }

    // Mark the invite accepted through a security-definer helper: editors have
    // no read access to the invites table, so a direct update cannot be
    // verified client-side. It refuses invitations older than 12 hours or
    // already revoked.
    const { data: accepted, error: rpcErr } = await (supabase as any).rpc("consultation_accept_own_invite");
    if (!rpcErr && accepted === false) {
      await supabase.auth.signOut();
      setBusy(false);
      setError(
        "This invitation has expired or was withdrawn. Invitation links are valid for 12 hours — ask a site administrator to resend yours.",
      );
      setPhase("invalid");
      return;
    }

    setBusy(false);
    setPhase("done");
    setTimeout(() => navigate("/admin/consultations", { replace: true }), 900);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #204435 0%, #1a3a2e 62%, #0d1f17 100%)" }}
    >
      <section
        className="w-full max-w-md rounded-lg border p-8"
        style={{
          background: "rgba(8, 24, 15, 0.55)",
          borderColor: "rgba(184,137,61,0.28)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        }}
      >
        <p className="text-center text-xs uppercase tracking-[0.2em]" style={{ color: "#d9b976" }}>
          Mount Kailash Consultations
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold" style={{ color: "#faf6ef" }}>
          {phase === "done" ? "Welcome Aboard" : "Accept Your Invitation"}
        </h1>
        <div className="my-5 h-px w-full" style={{ background: "rgba(184,137,61,0.35)" }} />

        {error && (
          <p
            role="alert"
            className="mb-4 rounded border px-3 py-2 text-sm"
            style={{ color: "#f3c9c9", background: "rgba(180,60,60,0.16)", borderColor: "rgba(220,120,120,0.4)" }}
          >
            {error}
          </p>
        )}

        {phase === "verifying" && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#b8893d" }} />
          </div>
        )}

        {phase === "invalid" && (
          <div className="text-center">
            <p className="text-sm leading-relaxed" style={{ color: "rgba(250,246,239,0.85)" }}>
              This invitation link is no longer valid. Invitation links expire, and each one can
              only be used once. Ask a site administrator to send a fresh invite.
            </p>
            <Link
              to="/admin/login"
              className="mt-4 inline-block rounded px-4 py-3 text-sm font-semibold"
              style={{ minHeight: 44, background: "#b8893d", color: "#1a3a2e" }}
            >
              Go to admin sign in
            </Link>
          </div>
        )}

        {phase === "done" && (
          <div className="text-center">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8" style={{ color: "#d9b976" }} />
            <p className="text-sm" style={{ color: "rgba(250,246,239,0.85)" }}>
              Your password is set. Taking you to the consultations console…
            </p>
          </div>
        )}

        {phase === "ready" && (
          <form onSubmit={submit} className="grid gap-4">
            {email && (
              <p className="text-center text-sm" style={{ color: "rgba(250,246,239,0.75)" }}>
                Setting a password for <strong style={{ color: "#faf6ef" }}>{email}</strong>
              </p>
            )}
            <div>
              <Label htmlFor="consult-accept-pw" style={{ color: "rgba(250,246,239,0.85)" }}>
                Choose a password
              </Label>
              <Input
                id="consult-accept-pw"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                style={{ minHeight: 44 }}
              />
            </div>
            <div>
              <Label htmlFor="consult-accept-pw2" style={{ color: "rgba(250,246,239,0.85)" }}>
                Confirm password
              </Label>
              <Input
                id="consult-accept-pw2"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1"
                style={{ minHeight: 44 }}
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full"
              style={{ minHeight: 44, background: "#b8893d", color: "#1a3a2e" }}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set password &amp; continue
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
