# WCE 2026 Visitor Report — Last 30 Days

Produce a downloadable, branded visitor report for the WCE 2026 page covering 26 Jul – 24 Aug 2026, built from the site's own analytics (the numbers shown in the More info / Analytics panel) plus the first-party WCE page event data.

## What the report will contain

1. **Headline summary** — site visitors (4,830), page views (8,626), views per visit (1.79), average visit duration (2m 17s), bounce rate (68%), and the WCE page's share of all traffic (/wce-2026 = 3,539 page visits, the site's most-viewed page by a wide margin).
2. **Daily trend** — visitors and page views per day for all 30 days, as a chart plus a full data table, highlighting the two demand spikes (13–19 Aug, peaking 499 visitors; and 24 Aug at 914 visitors) against the ~40/day baseline.
3. **Where visitors came from** — Facebook mobile (2,102), direct (1,209), Facebook web (647), Instagram (619), Google (340), and the rest, grouped into channels (social / direct / organic search) with share percentages.
4. **Devices** — mobile 4,492, desktop 764, tablet 23, with shares and a note on what that means for creative and page weight.
5. **Locations** — Saint Lucia 2,376, United States 1,096, Antigua & Barbuda 654, Jamaica 295, plus the rest of the top ten with full country names and shares.
6. **Top pages** — where WCE traffic goes next (home, shop, retreats, product pages, checkout).
7. **On-page engagement for WCE** — from the WCE event data already stored on the site: sections read, CTA clicks by button, flyer opens and shares, referral codes, application starts and submissions.
8. **Read-out for the marketer** — plain-language observations and recommended next actions (best posting days/hours, mobile-first creative, retargeting windows around the spikes, weakest funnel step).

Every figure will be labelled with its source (site analytics vs. WCE page tracking) and the exact date range, and caveats will be stated where the two sources measure differently.

## Deliverable

A polished PDF in the documents area, styled with the Mount Kailash / WCE palette (deep botanical green, gold accents, Cormorant Garamond headings, DM Sans body), plus a CSV of the daily numbers for spreadsheet work.

## Technical notes

- Data sources: the platform analytics read for 2026-07-26 → 2026-08-24 (already retrieved) and a read-only query against `wce_page_events` for the same window.
- The report is generated as a one-off artifact (HTML → PDF) written to the documents area; no application code or database changes are involved.
- Every rendered page will be checked as an image before delivery to confirm no clipped text, broken charts, or blank pages.
