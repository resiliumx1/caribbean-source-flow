/**
 * Centralized site configuration.
 *
 * To switch the production domain (e.g. after DNS cutover), update SITE_URL
 * here and also update the hardcoded URLs in:
 *   - index.html (canonical, og:url, JSON-LD url, noscript link)
 *   - public/sitemap.xml (all <loc> entries)
 *   - public/robots.txt (Sitemap line)
 *
 * Those static files cannot read this constant at build time.
 */
export const SITE_URL = "https://caribbean-source-flow.lovable.app";

export const CONTACT_EMAIL = "goddessitopia@mountkailashslu.com";