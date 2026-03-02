

## Fetch All Live Streams + Auto-Categorize by Topic

### Problem
1. Only 15 videos are synced -- the current scraper only gets the first page of the YouTube /streams tab
2. All videos are categorized as "general" -- no auto-categorization logic exists
3. The page shows a flat grid with filter pills instead of organized topic sections

### Solution

#### 1. Expand the youtube-sync Edge Function to fetch ALL live streams

The current scraper parses `ytInitialData` from the /streams page but only gets the first ~30 results. YouTube provides **continuation tokens** inside that same data structure. The fix:

- After parsing the initial batch, extract the `continuationCommand.token` from the `ytInitialData` JSON
- Make follow-up POST requests to YouTube's internal `browse` endpoint (`https://www.youtube.com/youtubei/v1/browse`) with the continuation token
- Repeat until no more continuation tokens or we hit videos older than 2 years
- This requires no API key -- it uses the same public internal API that the YouTube website uses

#### 2. Auto-categorize videos by title keywords

Add a `classifyByTitle(title)` function in the edge function that maps keywords to categories:

| Keywords in title | Category |
|---|---|
| fertility, reproductive, womb, fibroids, PCOS, menstrual, hormonal, ovarian | women |
| male reproductive, prostate, men's, manhood, testosterone | men |
| detox, parasite, cleanse, cleansing, toxin, colon | detox |
| herb, herbal, cupping, tincture, bush medicine, plant medicine | herbal |
| nutrition, food, diet, blood, iron, alkaline, fasting, superfoods | nutrition |
| stress, anxiety, mental, sleep, depression, nervous system | mental |
| Everything else | general |

This runs automatically during sync so videos are pre-categorized. Admins can still override via the admin panel.

#### 3. Sectionalize the Webinars page by topic

Instead of a flat grid with filter pills, reorganize the archive section into **topic sections** -- each with a heading, description, and its own row/grid of video cards:

```text
-- Women's Health --
[card] [card] [card] ...

-- Men's Health --
[card] [card] [card] ...

-- Herbal Medicine --
[card] [card] [card] ...

(etc.)
```

- Keep an "All" view that shows the sectionalized layout
- Keep filter pills so users can drill into a single topic (shows flat grid for that topic)
- Each section shows up to 6 videos with a "Show more" toggle if there are more
- Sections with no videos are hidden
- "New" badge still appears on videos from the last 30 days

### Files to modify

| File | Change |
|---|---|
| `supabase/functions/youtube-sync/index.ts` | Add continuation token pagination + `classifyByTitle()` auto-categorization |
| `src/pages/Webinars.tsx` | Sectionalize archive by topic with section headers, keep filter pills for drill-down |
| `src/pages/AdminWebinars.tsx` | No changes needed (admin can still override categories) |

### Technical details

**Continuation token pagination** in the edge function:
- Extract `continuationEndpoint.continuationCommand.token` from `ytInitialData`
- POST to `https://www.youtube.com/youtubei/v1/browse?prettyPrint=false` with body containing the token and a standard `context` object (client name/version)
- Parse response for more `richItemRenderer` entries and the next continuation token
- Loop until no more tokens or oldest video is > 2 years old
- Estimated: should fetch 60-100+ live stream videos

**Sectionalized layout** on Webinars page:
- Group `dbVideos` by category into a `Map<string, WebinarVideo[]>`
- Render each non-empty group as a section with a heading and horizontal scroll or grid
- When a specific filter pill is active, switch to flat grid view for just that category

