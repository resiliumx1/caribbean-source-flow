import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SearchHit = {
  id: string;
  title: string;
  subtitle?: string | null;
  url: string;
  image?: string | null;
  price_usd?: number | null;
  price_xcd?: number | null;
  meta?: string | null;
};

export type SearchGroup = {
  key: string;
  label: string;
  hits: SearchHit[];
  total: number;
  seeAll: string | null;
};

/** Static route map so someone typing "wholesale" lands there directly. */
const PAGES: { title: string; subtitle: string; url: string; keywords: string }[] = [
  { title: "Shop", subtitle: "Browse every herbal formulation", url: "/shop", keywords: "shop store products herbs buy catalogue" },
  { title: "The Answer", subtitle: "The flagship botanical formulation", url: "/the-answer", keywords: "the answer flagship tonic bottle" },
  { title: "Wholesale", subtitle: "Stock Mount Kailash in your store", url: "/wholesale", keywords: "wholesale b2b bulk trade reseller stockist distributor" },
  { title: "School", subtitle: "Herbal Physician certification", url: "/school/herbal-physician", keywords: "school course herbal physician certification study training学" },
  { title: "WCE 2026", subtitle: "Caribbean Wellness Saint Lucia, 11–17 October 2026", url: "/wce-2026", keywords: "wce caribbean wellness experience 2026 saint lucia symposium retreat event" },
  { title: "Consultations", subtitle: "Book a session with our practitioners", url: "/consultations", keywords: "consultation consultations booking appointment practitioner session" },
  { title: "Retreats", subtitle: "Stay at Mount Kailash Rejuvenation Centre", url: "/retreats", keywords: "retreat retreats stay wellness immersion villa" },
  { title: "Learn", subtitle: "Articles on Caribbean wellness medicine", url: "/learn", keywords: "learn blog articles reading guides" },
  { title: "Webinars", subtitle: "Replays of past live sessions", url: "/webinars", keywords: "webinar webinars replays videos live streams" },
];

function pageGroup(q: string): SearchGroup | null {
  const needle = q.toLowerCase();
  const hits = PAGES.filter(
    (p) => p.title.toLowerCase().includes(needle) || p.keywords.includes(needle),
  )
    .slice(0, 5)
    .map((p) => ({ id: `page-${p.url}`, title: p.title, subtitle: p.subtitle, url: p.url }));
  if (!hits.length) return null;
  return { key: "pages", label: "Pages", hits, total: hits.length, seeAll: null };
}

const RECENT_KEY = "mkrc-recent-searches";
const RECENT_MAX = 6;

export function readRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string").slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(term: string) {
  const t = term.trim();
  if (t.length < 2) return;
  const next = [t, ...readRecentSearches().filter((v) => v.toLowerCase() !== t.toLowerCase())].slice(0, RECENT_MAX);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recent searches are a nicety, not a requirement */
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}

/** Debounced, single-round-trip site search. Minimum two characters. */
export function useSiteSearch(query: string) {
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const trimmed = query.trim();
  const enabled = trimmed.length >= 2;

  useEffect(() => {
    if (!enabled) {
      setGroups([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      const { data, error: fnError } = await supabase.functions.invoke("site-search", {
        body: { q: trimmed },
      });
      if (id !== requestId.current) return; // a newer keystroke already won
      if (fnError) {
        setError("Search is temporarily unavailable.");
        setGroups([]);
      } else {
        setError(null);
        const remote: SearchGroup[] = Array.isArray(data?.groups) ? data.groups : [];
        const pages = pageGroup(trimmed);
        setGroups(pages ? [...remote, pages] : remote);
      }
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [trimmed, enabled]);

  /** Flat list in render order, for arrow-key navigation. */
  const flat = useMemo(() => groups.flatMap((g) => g.hits.map((h) => ({ ...h, group: g.key }))), [groups]);

  return { groups, flat, loading, error, enabled };
}

/** Wraps every case-insensitive match of `q` in <mark>. */
export function highlightParts(text: string, q: string): { text: string; match: boolean }[] {
  const needle = q.trim();
  if (!needle) return [{ text, match: false }];
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.filter(Boolean).map((part) => ({ text: part, match: part.toLowerCase() === needle.toLowerCase() }));
}
