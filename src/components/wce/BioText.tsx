/** Renders a speaker bio, turning organiser-configured phrases into links.
 *  Generic on purpose: any speaker can carry bio_links, so no partner or
 *  organisation is special-cased in the component. */
import { Fragment, type ReactNode } from "react";
import { parseBioLinks, type WceBioLink } from "./speaker-utils";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function renderBioWithLinks(bio: string, rawLinks: unknown): ReactNode {
  const links: WceBioLink[] = parseBioLinks(rawLinks);
  if (!links.length) return bio;

  const pattern = new RegExp(`(${links.map((l) => escapeRegExp(l.phrase)).join("|")})`, "g");
  const parts = bio.split(pattern);

  return parts.map((part, i) => {
    const match = links.find((l) => l.phrase === part);
    if (!match) return <Fragment key={i}>{part}</Fragment>;
    return (
      <a
        key={i}
        className="wce-bio-link"
        href={match.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${match.phrase} (opens in a new tab)`}
      >
        {part}
      </a>
    );
  });
}

export function WceBioText({ bio, links }: { bio: string; links?: unknown }) {
  return <>{renderBioWithLinks(bio, links)}</>;
}
