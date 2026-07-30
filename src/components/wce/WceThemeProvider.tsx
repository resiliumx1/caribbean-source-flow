import "@/styles/wce.css";

/** Scopes the Caribbean Wellness Experience palette + typography to this route only. */
export function WceThemeProvider({ children }: { children: React.ReactNode }) {
  return <div className="wce-root">{children}</div>;
}
