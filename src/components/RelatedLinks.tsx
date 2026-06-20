import { Link } from "react-router-dom";
import { getRelated, type LinkNodeId } from "@/lib/internal-links";

interface RelatedLinksProps {
  /** The current page's node id — its related entries are rendered. */
  nodeId: LinkNodeId;
  /** Optional heading override. */
  heading?: string;
  className?: string;
}

/**
 * Renders the canonical "Explore also" block of internal links for a page.
 * Pulls from the central internal-links map so anchors stay in sync with
 * the BreadcrumbList JSON-LD emitted by <SEOHead>.
 */
export function RelatedLinks({ nodeId, heading = "Explore also", className }: RelatedLinksProps) {
  const related = getRelated(nodeId);
  if (related.length === 0) return null;

  return (
    <nav aria-label={heading} className={className ?? "related-links border-t border-border/40 py-12 px-6"}>
      <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">{heading}</h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {related.map((node) => (
          <li key={node.id}>
            <Link
              to={node.path}
              className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              <span className="block font-serif text-xl text-foreground group-hover:underline">
                {node.name}
              </span>
              <span className="block text-sm text-muted-foreground mt-1">{node.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}