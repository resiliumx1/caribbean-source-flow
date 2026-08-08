/** Shared shape + flyer helpers for the WCE 2026 speaker row and flyer expansion. */
export type WceSpeaker = {
  id: string;
  name: string;
  prefix?: string | null;
  title?: string | null;
  theme: string | null;
  bio?: string | null;
  session_title?: string | null;
  session_time?: string | null;
  portrait_url: string | null;
  is_featured?: boolean;
  slug?: string | null;
  og_image_url?: string | null;
};

/** How each flyer theme word breaks across lines, exactly as printed. */
const THEME_LINES: Record<string, string[]> = {
  "MIND & BODY": ["MIND", "&BODY"],
  "EVENT HOST": ["EVENT", "HOST"],
  "WELL FIT": ["WELL", "FIT"],
  "GUT HEALTH": ["GUT", "HEALTH"],
  "HISTORICAL ROOTS": ["HISTORICAL", "ROOTS"],
  "CALL TO ACTION": ["CALL", "TO", "ACTION"],
  EQ: ["EQ"],
};

export function themeLines(theme?: string | null): string[] {
  if (!theme) return [];
  const key = theme.trim().toUpperCase();
  return THEME_LINES[key] ?? key.split(/\s+/);
}

export function speakerInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]).join("");
}