

# Launch Readiness Audit — Mount Kailash

Here's a complete checklist of what's working, what needs fixing, and what to request from the client before going live on the real domain.

---

## 1. What's Working ✅

- **Routing & pages**: All 14 live routes resolve, lazy-loaded with proper SPA fallback.
- **Cart flow**: `/shop → /cart → /checkout` is wired end-to-end.
- **Backend**: Lovable Cloud connected; 5 edge functions deployed (`woo-order`, `woo-sync`, `concierge-chat`, `guest-orders`, `youtube-sync`).
- **WooCommerce sync**: Product sync + order creation hits live Woo store via `WOO_STORE_URL` + consumer key/secret (already set as secrets).
- **Customer order lookup**: `/account` page uses `guest-orders` edge function (service-role, RLS-safe).
- **Admin panel**: `/admin/login` + product/order/retreat/review/webinar management.
- **AI chat**: Concierge widget uses `LOVABLE_API_KEY` (no client key needed).
- **SEO**: `SEOHead`, `sitemap.xml`, `robots.txt`, JSON-LD all in place.
- **Three contact numbers**: Display correctly in light + dark mode across all footers.

---

## 2. Critical Issues to Fix Before Launch 🔴

### A. Checkout requires login but there's no signup/login UI for shoppers
`src/pages/Checkout.tsx` line 58 blocks checkout if no auth session — but the storefront has **no login page or signup flow** exposed to customers. Result: every shopper sees "Please log in" and is stuck.

**Fix options** (need your decision — see questions below).

### B. Hardcoded preview domain in 6+ places
The string `caribbean-source-flow.lovable.app` is hardcoded in:
- `index.html` (canonical, OG URL, JSON-LD, noscript)
- `public/sitemap.xml` (all 8 URLs)
- `public/robots.txt` (sitemap line)
- `src/components/SEOHead.tsx` (BASE_URL)
- `src/pages/TrinityHomepage.tsx` (canonical)
- `src/pages/GoddessCard.tsx` (vCard URL)

All must be replaced with the real production domain at launch.

### C. Stale email address
`src/components/ComingSoon.tsx` uses `info@mtkailash.com` — every other file uses `goddessitopia@mountkailashslu.com` or `blessedlove@mountkailashslu.com`. Confirm and unify.

### D. Payment redirect points back to WooCommerce
`woo-order` edge function returns a `payment_url` like `https://[woo-store]/checkout/order-pay/...`. Customers leave the new site to pay on the existing WooCommerce checkout. This works, but the WooCommerce store must:
- Accept that domain in CORS / referrer rules
- Have payment gateways (Stripe/PayPal) live and tested
- Successfully redirect back after payment (currently no return URL is set — buyer ends on Woo's "thank you" page, not yours)

---

## 3. What to Request From the Client

### Domain & DNS
1. **Registrar login** (GoDaddy, Namecheap, etc.) OR ability to set DNS records, so we can:
   - Add A record `@ → 185.158.133.1`
   - Add A record `www → 185.158.133.1`
   - Add TXT verification record (Lovable provides)
2. **Final domain to use** (e.g. `mountkailashslu.com`, `mtkailash.com`, etc.) and whether `www` or root is primary.
3. **Existing MX records** — preserve these so email keeps working.
4. **If using Cloudflare or any proxy** — let us know (changes the connection method).

### WooCommerce / Payments
5. Confirm **WooCommerce store URL** (`WOO_STORE_URL` secret) is the production store, not staging.
6. Confirm payment gateways (Stripe/PayPal/etc.) are **live mode**, not sandbox, on the WooCommerce side.
7. **Test order**: place one real low-value order end-to-end after launch.
8. Decide whether to offer **guest checkout** or require accounts (drives Fix A above).

### Email
9. Final inbox(es) for:
   - Order notifications
   - Wholesale inquiries
   - General contact / footer
10. Decide if you want **Lovable Emails** (branded transactional emails — order confirmations, account emails) set up. This needs DNS access too.

### Content & Assets
11. **Final OG/social share image** (currently using a Google Cloud Storage URL — should be self-hosted).
12. Twitter/X handle confirmation (`@MountKailash` is in `index.html` — verify it exists).
13. Google Analytics / Meta Pixel / TikTok Pixel IDs if tracking is wanted.
14. Google Search Console + Bing Webmaster verification codes (to submit sitemap after launch).

### Legal
15. Privacy Policy + Terms of Service pages — currently not present in routes.
16. Cookie consent banner — currently none.

---

## 4. Decisions I Need From You

I'll ask these in a follow-up so we can lock the plan and execute.

---

## Technical Implementation (when you approve)

1. **Centralize the production URL** — replace hardcoded preview URLs with a single constant or environment variable, then update sitemap, robots, SEO head, JSON-LD.
2. **Fix checkout auth gate** — either add a guest checkout path in `woo-order` (drop the JWT check, validate inputs server-side), or add a proper customer signup/login UI.
3. **Add return-URL handling** in `woo-order` so post-payment Woo redirects back to `/account` or a new `/order-confirmed` page.
4. **Update `ComingSoon.tsx`** email to match the canonical address.
5. **Add Privacy + Terms** routes + footer links.
6. **Optional: scaffold Lovable Emails** for branded order receipts.
7. **Connect custom domain** in Project Settings → Domains once DNS is ready, then re-publish.

