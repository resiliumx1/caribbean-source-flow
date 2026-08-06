/** Presentation kit for the WCE 2026 organiser console. Styling lives in
 *  src/styles/wce-admin.css under the .wce-admin scope. */
import type { ReactNode } from "react";

export const ACCENTS = {
  gold: { figure: "#E4C766", tint: "rgba(201, 162, 39, 0.16)", series: "#C9A227" },
  sage: { figure: "#A7C9A2", tint: "rgba(127, 160, 122, 0.16)", series: "#7FA07A" },
  teal: { figure: "#7FC7C1", tint: "rgba(62, 140, 135, 0.18)", series: "#3E8C87" },
  terracotta: { figure: "#E7A98F", tint: "rgba(200, 122, 90, 0.16)", series: "#C87A5A" },
} as const;

export type AccentKey = keyof typeof ACCENTS;

export function StatCard({
  label,
  value,
  accent = "gold",
  trend,
  hint,
}: {
  label: string;
  value: ReactNode;
  accent?: AccentKey;
  trend?: { direction: "up" | "down" | "flat"; text: string };
  hint?: string;
}) {
  const a = ACCENTS[accent];
  const arrow = trend?.direction === "up" ? "▲" : trend?.direction === "down" ? "▼" : "—";
  return (
    <div
      className="wa-stat"
      style={{ ["--wa-tint" as string]: a.tint, ["--wa-figure" as string]: a.figure }}
    >
      <p className="wa-label" style={{ marginBottom: "0.45rem" }}>{label}</p>
      <p className="wa-stat-figure">{value}</p>
      {trend && (
        <p className="wa-trend" style={{ color: a.figure, marginTop: "0.35rem" }}>
          {arrow} {trend.text}
        </p>
      )}
      {hint && <p className="wa-muted" style={{ fontSize: "0.72rem", marginTop: "0.3rem" }}>{hint}</p>}
    </div>
  );
}

const TONES = ["new", "contacted", "qualified", "accepted", "declined"];

export function StatusPill({ status }: { status: string | null | undefined }) {
  const s = (status ?? "").toLowerCase();
  const tone = TONES.includes(s) ? s : "neutral";
  return <span className="wa-pill" data-tone={tone}>{status || "—"}</span>;
}

/** Small drawn gold ornament for empty states. */
export function EmptyOrnament({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <path d="M24 9c6 7 6 12 0 18-6-6-6-11 0-18Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M13 30c6 5 16 5 22 0" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M24 39v-6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ title, line }: { title: string; line?: string }) {
  return (
    <div className="wa-empty">
      <EmptyOrnament />
      <p className="wa-serif" style={{ fontSize: "1.15rem", color: "var(--wa-cream)" }}>{title}</p>
      {line && <p style={{ fontSize: "0.82rem", marginTop: "0.25rem" }}>{line}</p>}
    </div>
  );
}

export function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <h2 className="wa-serif" style={{ fontSize: "1.5rem", margin: 0 }}>{title}</h2>
      {sub && <p className="wa-muted" style={{ fontSize: "0.82rem", marginTop: "0.2rem" }}>{sub}</p>}
    </div>
  );
}
