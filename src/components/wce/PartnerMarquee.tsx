/** Partner band pinned to the bottom of the hero: "POWERED BY" plus a slow,
 *  seamless right-to-left marquee of partner logo tiles. */
import { useWceReducedMotion } from "./motion";
import { useWcePartners } from "./useWceData";
import logoMountKailash from "@/assets/partner-mount-kailash-seal.png.asset.json";
import logoKamilas from "@/assets/partner-kamilas-kitchen.png.asset.json";
import logoJah9 from "@/assets/partner-jah9.png.asset.json";
import logoLifecraft from "@/assets/partner-lifecraft-jamaica.png.asset.json";
import logoUbuntu from "@/assets/partner-ubuntu-movement.png.asset.json";

export interface WcePartner {
  name: string;
  logoUrl?: string;
  /** Circular seal artwork — sized larger so it reads at the same optical weight as wordmarks. */
  round?: boolean;
  /** Partner website. When present the tile becomes a link opening in a new tab. */
  url?: string | null;
}

/** Bundled logo artwork, keyed by partner name. The organiser backend controls
 *  the list, order and website address; the artwork stays in the bundle. */
export const WCE_PARTNER_LOGOS: Record<string, { url: string; round?: boolean }> = {
  "Mount Kailash": { url: logoMountKailash.url, round: true },
  "Kamila's Kitchen": { url: logoKamilas.url },
  Jah9: { url: logoJah9.url },
  "LifeCraft in Jamaica": { url: logoLifecraft.url },
  "The Ubuntu Movement": { url: logoUbuntu.url },
};

/** Fallback list used until the partner rows load (and during prerender). */
export const WCE_PARTNERS: WcePartner[] = [
  { name: "Mount Kailash", logoUrl: logoMountKailash.url, round: true, url: "https://mountkailashslu.com" },
  { name: "Kamila's Kitchen", logoUrl: logoKamilas.url },
  { name: "Jah9", logoUrl: logoJah9.url },
  { name: "LifeCraft in Jamaica", logoUrl: logoLifecraft.url },
  { name: "The Ubuntu Movement", logoUrl: logoUbuntu.url, url: "https://theubuntumovement.org/" },
];

/** Merges the organiser-managed partner rows with the bundled logo artwork.
 *  Falls back to the static list until the rows resolve, so the hero band never
 *  renders empty (and prerendered HTML still shows the partners). */
export function usePartnerList(override?: WcePartner[]): WcePartner[] {
  const { data } = useWcePartners();
  if (override) return override;
  if (!data?.length) return WCE_PARTNERS;
  return data.map((row) => {
    const art = WCE_PARTNER_LOGOS[row.name];
    return {
      name: row.name,
      logoUrl: row.logo_url || art?.url,
      round: row.round ?? art?.round ?? false,
      url: row.url,
    };
  });
}

/** One tile: bare artwork on the bar — no border, no fill. Falls back to the name as text. */
export function WcePartnerTile({ name, logoUrl, round, url }: WcePartner) {
  const art = logoUrl ? (
    <img
      src={logoUrl}
      alt={name}
      loading="lazy"
      decoding="async"
      className={`wce-partner-logo${round ? " wce-partner-logo-round" : ""}`}
    />
  ) : (
    <span className="wce-partner-name">{name}</span>
  );

  if (url) {
    return (
      <a
        className="wce-partner-tile is-link"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={`${name} — opens in a new tab`}
        aria-label={`${name} (opens in a new tab)`}
      >
        {art}
      </a>
    );
  }

  return (
    <div className="wce-partner-tile" title={name}>
      {art}
    </div>
  );
}

export function WcePartnerMarquee({ partners }: { partners?: WcePartner[] }) {
  const reduced = useWceReducedMotion();
  const rows = usePartnerList(partners);

  return (
    <div className="wce-partner-band" aria-label="Powered by">
      <div className="wce-partner-kicker-col">
        <span className="wce-partner-kicker">Powered by</span>
      </div>
      {reduced ? (
        <div className="wce-partner-static">
          {rows.map((p) => (
            <WcePartnerTile key={p.name} {...p} />
          ))}
        </div>
      ) : (
        <div className="wce-partner-viewport">
          <div className="wce-partner-track">
            {[0, 1].map((copy) => (
              <div className="wce-partner-set" key={copy} aria-hidden={copy === 1}>
                {rows.map((p) => (
                  <WcePartnerTile key={`${copy}-${p.name}`} {...p} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}