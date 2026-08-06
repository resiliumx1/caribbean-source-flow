/** Event-branded admin shell for WCE organisers. Deliberately contains no
 *  navigation to the store admin, and mentions nothing they cannot reach. */
import { ReactNode } from "react";
import { LoveEmblem } from "@/components/wce/LoveEmblem";
import "@/styles/wce.css";

export function WceAdminShell({
  email,
  onSignOut,
  children,
}: {
  email: string;
  onSignOut: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header
        className="wce-root sticky top-0 z-50"
        style={{
          background: "linear-gradient(180deg, var(--wce-forest-mid), var(--wce-forest))",
          borderBottom: "1px solid rgba(201, 162, 39, 0.34)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <LoveEmblem size={92} variant="cream" />
              <div className="leading-tight min-w-0">
                <div
                  className="wce-display truncate"
                  style={{ color: "var(--wce-cream)", fontSize: "1.05rem" }}
                >
                  Caribbean Wellness Experience 2026
                </div>
                <div
                  className="wce-eyebrow"
                  style={{ color: "var(--wce-gold-light)", fontSize: "0.6rem" }}
                >
                  Organiser Console
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className="hidden sm:inline truncate max-w-[190px]"
                style={{ color: "var(--wce-cream-soft)", fontSize: "0.75rem" }}
              >
                {email}
              </span>
              <button
                onClick={onSignOut}
                className="min-h-[44px] px-4 rounded"
                style={{
                  border: "1px solid var(--wce-gold)",
                  color: "var(--wce-gold-light)",
                  background: "transparent",
                  fontSize: "0.72rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}