import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/site-config";
import ogDefaultAsset from "@/assets/og-default.jpg.asset.json";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

const BASE_URL = SITE_URL;
const DEFAULT_OG = `${BASE_URL}${ogDefaultAsset.url}`;

/** Ensure an OG image URL is absolute (crawlers reject protocol-relative or root-relative paths). */
function toAbsolute(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
}

export function SEOHead({ title, description, path, ogImage }: SEOHeadProps) {
  const url = `${BASE_URL}${path}`;
  const image = toAbsolute(ogImage || DEFAULT_OG);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
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
    </Helmet>
  );
}
