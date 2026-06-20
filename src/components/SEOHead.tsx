import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/site-config";
import ogDefaultAsset from "@/assets/og-default.jpg.asset.json";

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export interface Breadcrumb {
  name: string;
  path: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  /** When true, the page is excluded from search indexes (use for account / order / login routes). */
  noindex?: boolean;
  /** Page-specific JSON-LD schema (Product, Course, Article, etc.). Stacks with the default WebPage. */
  schema?: JsonLd;
  /** Breadcrumb trail rendered as BreadcrumbList JSON-LD. Omit Home — it's prepended automatically. */
  breadcrumbs?: Breadcrumb[];
}

const BASE_URL = SITE_URL;
const DEFAULT_OG = `${BASE_URL}${ogDefaultAsset.url}`;

/** Ensure an OG image URL is absolute (crawlers reject protocol-relative or root-relative paths). */
function toAbsolute(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
}

/**
 * Normalize a route path into a canonical form:
 *  - strip query string and hash (canonical points at the resource, not the view state)
 *  - collapse duplicate slashes
 *  - lowercase
 *  - strip trailing slash except for the root
 */
function canonicalPath(input: string): string {
  let p = input || "/";
  // strip query + hash
  p = p.split("?")[0].split("#")[0];
  // ensure leading slash
  if (!p.startsWith("/")) p = `/${p}`;
  // collapse duplicate slashes
  p = p.replace(/\/{2,}/g, "/");
  // lowercase
  p = p.toLowerCase();
  // strip trailing slash (but keep root "/")
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

export function SEOHead({
  title,
  description,
  path,
  ogImage,
  noindex,
  schema,
  breadcrumbs,
}: SEOHeadProps) {
  const canonical = canonicalPath(path);
  const url = `${BASE_URL}${canonical}`;
  const image = toAbsolute(ogImage || DEFAULT_OG);

  // Default WebPage schema — every page gets a baseline content schema so crawlers
  // always have structured context, even when callers don't pass a richer type.
  const webPageSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Mount Kailash Rejuvenation Centre",
      url: BASE_URL,
    },
    primaryImageOfPage: { "@type": "ImageObject", url: image },
  };

  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
            ...breadcrumbs.map((b, i) => ({
              "@type": "ListItem",
              position: i + 2,
              name: b.name,
              item: `${BASE_URL}${canonicalPath(b.path)}`,
            })),
          ],
        }
      : null;

  const extraSchemas: Record<string, unknown>[] = schema
    ? Array.isArray(schema)
      ? (schema as Record<string, unknown>[])
      : [schema as Record<string, unknown>]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {extraSchemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
}
