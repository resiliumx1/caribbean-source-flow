import { Link } from "react-router-dom";

const LINKS = [
  {
    to: "/retreats",
    name: "Healing retreats in Saint Lucia",
    blurb: "Seven-day wellness immersions at Mount Kailash Rejuvenation Centre, run year round.",
  },
  {
    to: "/shop",
    name: "The apothecary",
    blurb: "Wildcrafted Saint Lucia tinctures, sea moss, teas and capsules, shipped worldwide.",
  },
  {
    to: "/school/herbal-physician",
    name: "School of Wellness Medicine",
    blurb: "Train as a clinical herbal physician with Rt. Hon. Priest Kailash K. Leonce.",
  },
];

/**
 * Internal-link block near the bottom of /wce-2026 — the page receives most of the
 * site's traffic, so it must pass authority on to the core business lines.
 */
export function WceExploreLinks() {
  return (
    <section className="wce-explore" aria-labelledby="wce-explore-heading">
      <div className="wce-explore__inner">
        <h2 id="wce-explore-heading" className="wce-explore__heading">
          More from Mount Kailash Rejuvenation Centre, Saint Lucia
        </h2>
        <ul className="wce-explore__list">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="wce-explore__link">
                <span className="wce-explore__name">{l.name}</span>
                <span className="wce-explore__blurb">{l.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
