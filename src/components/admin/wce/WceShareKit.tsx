/** Share Assets — the campaign share kit: every OG image with its dimensions and
 *  size, plus copyable shareable links for the page and each speaker. */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, Copy, Download, ExternalLink, Info } from "lucide-react";
import { wceToast, CardsSkeleton } from "./kit";
import { SITE_URL } from "@/lib/site-config";

type Asset = {
  label: string;
  path: string;
  kind: "landscape" | "square";
  width?: number;
  height?: number;
  bytes?: number;
};

const BASE_ASSETS: Asset[] = [
  { label: "Main share card (landscape)", path: "/og/wce-2026.jpg", kind: "landscape" },
  { label: "Main share card (square)", path: "/og/wce-2026-square.jpg", kind: "square" },
];

function fmtBytes(n?: number) {
  if (!n) return "—";
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(2)} MB` : `${Math.round(n / 1024)} KB`;
}

function CopyBtn({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      wceToast({ title: "Could not copy", description: value, tone: "error" });
      return;
    }
    setDone(true);
    window.setTimeout(() => setDone(false), 1800);
  };
  return (
    <button type="button" onClick={copy} className="wa-btn wa-btn-ghost gap-2"
      style={{ minHeight: 44 }} aria-label={`${label}: ${value}`}>
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span style={{ fontSize: "0.8rem" }}>{done ? "Copied" : label}</span>
    </button>
  );
}

export default function WceShareKit() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [links, setLinks] = useState<Array<{ name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_speakers")
        .select("name,slug,og_image_url,display_order")
        .eq("published", true)
        .order("display_order");
      if (error) wceToast({ title: "Could not load speakers", description: error.message, tone: "error" });

      const rows = (data ?? []).filter((s) => s.slug);
      const speakerAssets: Asset[] = rows
        .filter((s) => s.og_image_url)
        .map((s) => ({ label: `${s.name} share card`, path: s.og_image_url as string, kind: "landscape" as const }));

      const all = [...BASE_ASSETS, ...speakerAssets];

      // Measure each image so the organiser can confirm dimensions and weight.
      const measured = await Promise.all(
        all.map(async (a) => {
          const meta: Asset = { ...a };
          try {
            const res = await fetch(a.path, { method: "HEAD" });
            const len = res.headers.get("content-length");
            if (len) meta.bytes = Number(len);
          } catch { /* ignore */ }
          await new Promise<void>((done) => {
            const img = new Image();
            img.onload = () => { meta.width = img.naturalWidth; meta.height = img.naturalHeight; done(); };
            img.onerror = () => done();
            img.src = a.path;
          });
          return meta;
        }),
      );

      setAssets(measured);
      setLinks(rows.map((s) => ({ name: s.name, slug: s.slug as string })));
      setLoading(false);
    })();
  }, []);

  if (loading) return <CardsSkeleton count={3} lines={4} />;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="flex items-start gap-2" style={{ fontSize: "0.84rem" }}>
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Facebook and Instagram cache link previews. After changing an image or any text,
            re-scrape the URL in the{" "}
            <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noreferrer"
              style={{ textDecoration: "underline" }}>Facebook Sharing Debugger</a>{" "}
            or the old preview keeps showing. WhatsApp caches per URL for roughly seven days —
            to test a change sooner, add a query string such as <code>?v=2</code> to the link.
          </span>
        </p>
      </div>

      <section>
        <h3 className="wa-h3" style={{ fontSize: "0.95rem" }}>Share images ({assets.length})</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => {
            const url = `${SITE_URL}${a.path}`;
            return (
              <div key={a.path} className="rounded-lg border border-border bg-card p-3">
                <img src={a.path} alt={a.label} loading="lazy" decoding="async"
                  className="w-full rounded" style={{ aspectRatio: a.kind === "square" ? "1/1" : "1200/630", objectFit: "cover" }} />
                <p className="mt-2" style={{ fontSize: "0.86rem", fontWeight: 600 }}>{a.label}</p>
                <p className="wa-muted" style={{ fontSize: "0.76rem" }}>
                  {a.width && a.height ? `${a.width}×${a.height}` : "—"} · {fmtBytes(a.bytes)}
                </p>
                <p className="wa-muted" style={{ fontSize: "0.72rem", wordBreak: "break-all" }}>{a.path}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <a className="wa-btn wa-btn-ghost gap-2" style={{ minHeight: 44 }}
                    href={a.path} download aria-label={`Download ${a.label}`}>
                    <Download className="h-4 w-4" /><span style={{ fontSize: "0.8rem" }}>Download</span>
                  </a>
                  <CopyBtn value={url} label="Copy URL" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="wa-h3" style={{ fontSize: "0.95rem" }}>Shareable links</h3>
        <div className="mt-3 space-y-2">
          {[{ name: "Main event page", slug: "" }, ...links].map((l) => {
            const url = l.slug ? `${SITE_URL}/wce-2026/speakers/${l.slug}` : `${SITE_URL}/wce-2026`;
            return (
              <div key={url} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
                <div className="min-w-0">
                  <p style={{ fontSize: "0.88rem", fontWeight: 600 }}>{l.name}</p>
                  <p className="wa-muted" style={{ fontSize: "0.76rem", wordBreak: "break-all" }}>{url}</p>
                </div>
                <div className="flex items-center gap-1">
                  <a className="wa-btn wa-btn-ghost gap-2" style={{ minHeight: 44 }}
                    href={url.replace(SITE_URL, "")} target="_blank" rel="noreferrer" aria-label={`Open ${l.name}`}>
                    <ExternalLink className="h-4 w-4" /><span style={{ fontSize: "0.8rem" }}>Open</span>
                  </a>
                  <CopyBtn value={url} label="Copy link" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}