/** Partner band pinned to the bottom of the hero: "POWERED BY" plus a slow,
 *  seamless right-to-left marquee of partner logo tiles. */
import { useWceReducedMotion } from "./motion";
import logoMountKailash from "@/assets/partner-mount-kailash.png.asset.json";
import logoKamilas from "@/assets/partner-kamilas-kitchen.png.asset.json";
import logoJah9 from "@/assets/partner-jah9.png.asset.json";
import logoLifecraft from "@/assets/partner-lifecraft-jamaica.png.asset.json";
import logoUbuntu from "@/assets/partner-ubuntu-movement.png.asset.json";

export interface WcePartner {
  name: string;
  logoUrl?: string;
}

export const WCE_PARTNERS: WcePartner[] = [
  { name: "Mount Kailash", logoUrl: logoMountKailash.url },
  { name: "Kamila's Kitchen", logoUrl: logoKamilas.url },
  { name: "Jah9", logoUrl: logoJah9.url },
  { name: "LifeCraft in Jamaica", logoUrl: logoLifecraft.url },
  { name: "The Ubuntu Movement", logoUrl: logoUbuntu.url },
];

/** One tile: bare artwork on the bar — no border, no fill. Falls back to the name as text. */
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
      <div className="wce-partner-kicker-col">
        <span className="wce-partner-kicker">Powered by</span>
      </div>
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