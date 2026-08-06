/** Statically imported speaker portraits, resolved by a slug matched from the
 *  speaker's name. A bad or empty database value can therefore never produce a
 *  broken image — the bundled asset always wins, with initials as the fallback. */
import kailash from "@/assets/portrait-kailash.jpg.asset.json";
import jah9 from "@/assets/portrait-jah9.jpg.asset.json";
import kamila from "@/assets/portrait-kamila-mcdonald.jpg.asset.json";
import bobby from "@/assets/portrait-bobby-price.jpg.asset.json";
import karlyn from "@/assets/portrait-karlyn-percil.jpg.asset.json";
import wayne from "@/assets/portrait-wayne-rose.jpg.asset.json";
import rizza from "@/assets/portrait-rizza-islam.jpg.asset.json";

export const SPEAKER_PORTRAITS: Record<string, string> = {
  kailash: kailash.url,
  jah9: jah9.url,
  "kamila-mcdonald": kamila.url,
  "bobby-price": bobby.url,
  "karlyn-percil": karlyn.url,
  "wayne-rose": wayne.url,
  "rizza-islam": rizza.url,
};

/** Name fragments → portrait slug. Order matters only for uniqueness. */
const NAME_TO_SLUG: [RegExp, string][] = [
  [/kailash/i, "kailash"],
  [/jah\s*9/i, "jah9"],
  [/kamila/i, "kamila-mcdonald"],
  [/bobby/i, "bobby-price"],
  [/karlyn|percil/i, "karlyn-percil"],
  [/wayne|rose/i, "wayne-rose"],
  [/rizza/i, "rizza-islam"],
];

export function speakerSlug(name: string): string | null {
  for (const [re, slug] of NAME_TO_SLUG) if (re.test(name)) return slug;
  return null;
}

/** Bundled portrait for this speaker, or null when the slug is unmatched. */
export function speakerPortrait(name: string, dbUrl?: string | null): string | null {
  const slug = speakerSlug(name || "");
  if (slug && SPEAKER_PORTRAITS[slug]) return SPEAKER_PORTRAITS[slug];
  // Graceful fallback: only trust the database value if it looks like a URL.
  const raw = (dbUrl ?? "").trim();
  return /^(https?:)?\/\//.test(raw) || raw.startsWith("/") ? raw : null;
}
