/**
 * Internal linking map.
 *
 * Single source of truth for:
 *  - canonical node titles and paths
 *  - BreadcrumbList trails (passed to <SEOHead breadcrumbs={...} />)
 *  - related-article / related-page links rendered by <RelatedLinks />
 *
 * Why centralize this: BreadcrumbList JSON-LD must match the visible related-link
 * anchors so Google reads one coherent site graph. Drifting copies across pages
 * causes inconsistent breadcrumbs in SERPs and weakens topical clustering.
 *
 * To add a page, register a node here and pass `getBreadcrumbs(nodeId)` /
 * `getRelated(nodeId)` into <SEOHead> and <RelatedLinks>.
 */

export type LinkNodeId =
  | "home"
  | "shop"
  | "the-answer"
  | "school"
  | "retreats"
  | "webinars"
  | "wholesale";

export interface LinkNode {
  id: LinkNodeId;
  /** Display label used in breadcrumbs and related-link anchors. */
  name: string;
  /** Canonical route path. Must match the route in src/App.tsx. */
  path: string;
  /** One-line description rendered under related-link anchors. */
  blurb: string;
  /** Breadcrumb trail leading to this node (Home is prepended automatically). */
  trail: LinkNodeId[];
  /** Topically related nodes — surfaces as "Explore also" anchors at the bottom of the page. */
  related: LinkNodeId[];
}

export const LINK_NODES: Record<LinkNodeId, LinkNode> = {
  home: {
    id: "home",
    name: "Mount Kailash",
    path: "/",
    blurb: "Caribbean clinical bush medicine from Saint Lucia.",
    trail: [],
    related: ["shop", "the-answer", "retreats"],
  },
  shop: {
    id: "shop",
    name: "Shop the Caribbean Herbal Apothecary",
    path: "/shop",
    blurb: "Browse wildcrafted Saint Lucia tinctures, capsules, teas, and raw bush medicine.",
    trail: ["shop"],
    related: ["the-answer", "wholesale", "school"],
  },
  "the-answer": {
    id: "the-answer",
    name: "The Answer — Caribbean Immune Elixir",
    path: "/the-answer",
    blurb: "Read the story behind our oak-aged immune tincture of Anamu, Vervain, and Soursop.",
    trail: ["shop", "the-answer"],
    related: ["shop", "retreats", "school"],
  },
  school: {
    id: "school",
    name: "Herbal Physician Certification — School of Bush Medicine",
    path: "/school/herbal-physician",
    blurb: "Train as a certified herbal physician in Saint Lucia under Priest Kailash.",
    trail: ["school"],
    related: ["the-answer", "retreats", "webinars"],
  },
  retreats: {
    id: "retreats",
    name: "Wellness Retreats in Saint Lucia",
    path: "/retreats",
    blurb: "Spend a week in the volcanic highlands on a guided bush medicine immersion.",
    trail: ["retreats"],
    related: ["the-answer", "school", "webinars"],
  },
  webinars: {
    id: "webinars",
    name: "Bush Medicine Webinars with Priest Kailash",
    path: "/webinars",
    blurb: "Watch live and recorded teachings on clinical herbal protocols and case studies.",
    trail: ["webinars"],
    related: ["school", "the-answer", "shop"],
  },
  wholesale: {
    id: "wholesale",
    name: "Wholesale Caribbean Botanicals",
    path: "/wholesale",
    blurb: "Source practitioner-grade Saint Lucia botanicals for your clinic or dispensary.",
    trail: ["wholesale"],
    related: ["shop", "the-answer"],
  },
};

/** Breadcrumb shape consumed by <SEOHead breadcrumbs={...} />. */
export interface BreadcrumbEntry {
  name: string;
  path: string;
}

/** Build the BreadcrumbList trail for a node (Home is added by SEOHead). */
export function getBreadcrumbs(nodeId: LinkNodeId): BreadcrumbEntry[] {
  return LINK_NODES[nodeId].trail.map((id) => ({
    name: LINK_NODES[id].name,
    path: LINK_NODES[id].path,
  }));
}

/** Related-link nodes for a given page, in display order. */
export function getRelated(nodeId: LinkNodeId): LinkNode[] {
  return LINK_NODES[nodeId].related.map((id) => LINK_NODES[id]);
}