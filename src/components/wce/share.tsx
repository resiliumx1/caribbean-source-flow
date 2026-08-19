/** WCE 2026 share utilities and the gold outline share row used on the speaker
 *  flyer and beside the final CTA band. */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Link as LinkIcon, Share2 } from "lucide-react";
import { dataLayerPush } from "@/lib/tracking";
import { SITE_URL } from "@/lib/site-config";
import type { WceSpeaker } from "./speaker-utils";
import { trackWceEvent } from "./analytics";

export const WCE_PAGE_PATH = "/wce-2026";
export const WCE_PAGE_URL = `${SITE_URL}${WCE_PAGE_PATH}`;

export function speakerPath(slug: string) {
  return `${WCE_PAGE_PATH}/speakers/${slug}`;
}

export function speakerShareUrl(slug: string) {
  return `${SITE_URL}${speakerPath(slug)}`;
}

/** "{prefix} {name} — Caribbean Wellness Saint Lucia 2026" */
export function speakerOgTitle(s: Pick<WceSpeaker, "name" | "prefix">) {
  const prefix = s.prefix?.trim();
  return `${prefix ? `${prefix} ` : ""}${s.name} — Caribbean Wellness Saint Lucia 2026`;
}

/** Theme + session title where present, else the first sentence of the bio. Under 200 chars. */
export function speakerOgDescription(
  s: Pick<WceSpeaker, "theme" | "session_title" | "bio">,
): string {
  const theme = s.theme?.trim();
  const session = s.session_title?.trim();
  let text = "";
  if (theme || session) text = [theme, session].filter(Boolean).join(" — ");
  if (!text) {
    const bio = (s.bio ?? "").replace(/\s+/g, " ").trim();
    const m = bio.match(/^.*?[.!?](\s|$)/);
    text = (m?.[0] ?? bio).trim();
  }
  if (!text) text = "Caribbean Wellness Saint Lucia 2026 · 11–17 October";
  if (text.length > 197) text = `${text.slice(0, 196).trimEnd()}…`;
  return text;
}

type Channel = "native" | "whatsapp" | "facebook" | "x" | "linkedin" | "copy";

function trackShare(channel: Channel, slug: string) {
  dataLayerPush("wce_share", { share_channel: channel, speaker_slug: slug, event_id: "wce-2026" });
  trackWceEvent("flyer_share", slug, { channel });
}

const ICONS: Record<Exclude<Channel, "native" | "copy">, JSX.Element> = {
  whatsapp: (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.2c5.44 0 9.84-4.4 9.84-9.84C21.88 6.4 17.48 2 12.04 2Zm0 17.86c-1.5 0-2.98-.4-4.26-1.16l-.3-.18-3.18.84.84-3.1-.2-.32a8.02 8.02 0 0 1-1.24-4.3c0-4.44 3.62-8.06 8.06-8.06s8.04 3.62 8.04 8.06-3.6 8.22-7.76 8.22Zm4.5-5.98c-.24-.12-1.44-.7-1.66-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.38.1-.5.12-.12.26-.3.38-.46.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.7 4.12 3.68 2.02.8 2.42.64 2.86.6.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.86.24-1.45 1.48-1.45H17V4.44C16.72 4.4 15.78 4.3 14.7 4.3c-2.26 0-3.8 1.38-3.8 3.9v2.3H8.3v3h2.6V21h2.6Z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M17.9 3h3.3l-7.2 8.24L22 21h-6.2l-4.32-5.66L6.5 21H3.2l7.5-8.58L2.6 3h6.36l4.04 5.34L17.9 3Zm-1.16 16h1.83L7.36 4.9H5.4L16.74 19Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M6.94 8.5V20H3.6V8.5h3.34ZM5.27 3.4c1.06 0 1.92.86 1.92 1.92S6.33 7.25 5.27 7.25 3.35 6.38 3.35 5.32 4.21 3.4 5.27 3.4ZM20.4 20h-3.34v-6.06c0-1.52-.55-2.56-1.9-2.56-1.04 0-1.66.7-1.93 1.38-.1.24-.13.58-.13.92V20H9.76s.05-9.6 0-10.6h3.34v1.5c.44-.68 1.24-1.66 3.02-1.66 2.2 0 3.86 1.44 3.86 4.54V20Z" />
    </svg>
  ),
};

/** Standard share intents. All take an absolute URL. */
function intents(url: string, text: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  };
}

export function WceShareRow({
  url,
  title,
  text,
  slug,
  label = "Share",
  align = "center",
}: {
  url: string;
  title: string;
  text: string;
  /** Speaker slug, or "main" for the landing page itself. Sent with the dataLayer event. */
  slug: string;
  label?: string;
  align?: "center" | "start";
}) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, []);

  const flash = useCallback(() => {
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  }, []);

  const copy = useCallback(async () => {
    trackShare("copy", slug);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    flash();
  }, [flash, slug, url]);

  const native = useCallback(async () => {
    trackShare("native", slug);
    try {
      await navigator.share({ title, text, url });
    } catch {
      /* user dismissed — nothing to do */
    }
  }, [slug, text, title, url]);

  const links = intents(url, text);

  return (
    <div className="wce-share" data-align={align}>
      <span className="wce-share-label">{label}</span>
      <div className="wce-share-actions">
        {canNative ? (
          <button type="button" className="wce-share-btn is-wide" onClick={native}>
            <Share2 aria-hidden="true" width={15} height={15} />
            <span>Share</span>
          </button>
        ) : (
          (["whatsapp", "facebook", "x", "linkedin"] as const).map((c) => (
            <a
              key={c}
              className="wce-share-btn"
              href={links[c]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${c === "x" ? "X" : c[0].toUpperCase() + c.slice(1)}`}
              onClick={() => trackShare(c, slug)}
            >
              {ICONS[c]}
            </a>
          ))
        )}
        <button
          type="button"
          className="wce-share-btn is-wide"
          onClick={copy}
          aria-label="Copy link"
        >
          {copied ? <Check aria-hidden="true" width={15} height={15} /> : <LinkIcon aria-hidden="true" width={15} height={15} />}
          <span>{copied ? "Copied" : "Copy link"}</span>
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">{copied ? "Link copied to clipboard" : ""}</span>
    </div>
  );
}