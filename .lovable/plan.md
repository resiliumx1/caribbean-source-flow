

## YouTube Channel Sync and Professional Video Galleries (No API Key Required)

### Overview
Two improvements: (1) auto-populate webinars from your YouTube channel's public RSS feed, and (2) make retreat/school video galleries look professional by hiding YouTube branding.

---

### Part 1: YouTube Channel RSS Sync for Webinars

YouTube exposes a free public RSS feed at `https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`. No API key needed. It returns the latest ~15 videos with titles, descriptions, thumbnails, and publish dates.

**Step 1 -- Create `youtube-sync` edge function**
- Fetch `https://www.youtube.com/feeds/videos.xml?channel_id=UC...` (will resolve your channel ID from `@KAILASHLEONCE`)
- Parse the XML to extract: video ID, title, description, published date, thumbnail URL
- Upsert into a new `webinar_videos` database table (matching on `youtube_video_id` to avoid duplicates)
- No API key secret needed

**Step 2 -- Create `webinar_videos` database table**
```text
webinar_videos
- id (uuid, PK)
- youtube_video_id (text, unique)
- title (text)
- description (text)
- thumbnail_url (text)
- published_at (timestamptz)
- category (text, default 'general')
- is_featured (boolean, default false)
- display_order (integer, default 0)
- created_at (timestamptz)
```
RLS: anyone can SELECT, admins can INSERT/UPDATE/DELETE.

**Step 3 -- Update `src/pages/Webinars.tsx`**
- Create a `useWebinarVideos` hook to fetch from the new table
- Replace the hardcoded `WEBINARS` array in the "Past Sessions & Replays" section with real data from the database
- Each card shows the clean YouTube thumbnail, title, description, and publish date
- "Watch Replay" button opens a modal with the YouTube embed (same pattern as retreat videos -- no redirect to YouTube)
- Keep the existing hero, featured section, and other page sections intact

**Step 4 -- Add "Sync from YouTube" button to admin**
- Add a button on the admin panel that calls the `youtube-sync` function
- Shows sync status/results

---

### Part 2: Professional Video Display (No YouTube Branding)

**Problem**: When a YouTube video is added to the retreat gallery without a custom thumbnail, it shows a generic placeholder instead of using YouTube's clean thumbnail image.

**Fix in `RetreatVideoGallery.tsx`**:
- Add a helper function `getYouTubeThumbnail(url)` that extracts the video ID and returns `https://img.youtube.com/vi/{ID}/maxresdefault.jpg`
- In the thumbnail rendering logic: if `thumbnail_url` is null AND `video_url` is a YouTube URL, auto-use the clean YouTube thumbnail instead of the generic placeholder
- These thumbnails have NO YouTube play button or branding -- just a clean image
- The custom play button overlay (already implemented) handles the rest

**New `SchoolVideoGallery` component**:
- Create `src/components/school/SchoolVideoGallery.tsx` using the same pattern as `RetreatVideoGallery`
- Can reuse the same `retreat_videos` table with a new category value (e.g., "school"), or create a separate table
- Add it to `src/pages/School.tsx`
- Same professional thumbnail behavior -- auto-extract clean YouTube thumbnails

---

### Files to Create/Modify

| File | Action |
|------|--------|
| Database migration | Create `webinar_videos` table with RLS |
| `supabase/functions/youtube-sync/index.ts` | New edge function to fetch RSS and upsert |
| `src/hooks/use-webinar-videos.ts` | New hook for fetching webinar videos |
| `src/pages/Webinars.tsx` | Replace hardcoded array with DB data + modal playback |
| `src/components/retreats/RetreatVideoGallery.tsx` | Add auto YouTube thumbnail fallback |
| `src/components/school/SchoolVideoGallery.tsx` | New component (same pattern) |
| `src/pages/School.tsx` | Add SchoolVideoGallery section |
| `supabase/config.toml` | Register youtube-sync function |

### Limitations
- RSS feeds only return the latest ~15 videos. For a full archive, you would eventually need the YouTube Data API.
- Category assignment for webinars will default to "general" on sync -- you can recategorize from the admin panel afterward.

