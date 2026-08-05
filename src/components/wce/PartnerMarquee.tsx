/** Partner band pinned to the bottom of the hero: "POWERED BY" plus a slow,
 *  seamless right-to-left marquee of partner logo tiles. */
import { useWceReducedMotion } from "./motion";

export interface WcePartner {
  name: string;
  logoUrl?: string;
}

export const WCE_PARTNERS: WcePartner[] = [
  { name: "Mount Kailash" },
  { name: "Kamila's Kitchen" },
  { name: "Jah9" },
  { name: "LifeCraft in Jamaica" },
  { name: "The Ubuntu Movement" },
];

/** One tile: renders the supplied logo when present, a gold-outlined placeholder otherwise. */
export function WcePartnerTile({ name, logoUrl }: WcePartner) {
  return (
    <div className="wce-partner-tile" title={name}>
      {logoUrl ? (
        <img src={logoUrl} alt={name} loading="lazy" decoding="async" className="wce-partner-logo" />
      ) : (
        <span className="wce-partner-name">{name}</span>
      )}
    </div>
  );
}

export function WcePartnerMarquee({ partners = WCE_PARTNERS }: { partners?: WcePartner[] }) {
  const reduced = useWceReducedMotion();

  return (
    <div className="wce-partner-band" aria-label="Powered by">
      <span className="wce-partner-kicker">Powered by</span>
      {reduced ? (
        <div className="wce-partner-static">
          {partners.map((p) => (
            <WcePartnerTile key={p.name} {...p} />
          ))}
        </div>
      ) : (
        <div className="wce-partner-viewport">
          <div className="wce-partner-track">
            {[0, 1].map((copy) => (
              <div className="wce-partner-set" key={copy} aria-hidden={copy === 1}>
                {partners.map((p) => (
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