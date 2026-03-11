import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

const BASE_URL = "https://caribbean-source-flow.lovable.app";
const DEFAULT_OG = "https://storage.googleapis.com/gpt-engineer-file-uploads/KBVCYBIRlWQKYPcd76HHSztmFF13/social-images/social-1770013953420-KHALASH LOGO.jpeg";

export function SEOHead({ title, description, path, ogImage }: SEOHeadProps) {
  const url = `${BASE_URL}${path}`;
  const image = ogImage || DEFAULT_OG;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
