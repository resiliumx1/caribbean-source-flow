

# Add Retreat Video Gallery Section

## Overview
Create a new `retreat_videos` database table and a `RetreatVideoGallery` component that displays retreat videos in a dedicated section, visually separate from the existing photo gallery on the Retreats page.

## Database

**New table: `retreat_videos`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, default gen_random_uuid() |
| title | TEXT | Video title |
| description | TEXT | Optional caption |
| video_url | TEXT | NOT NULL, public URL from storage or external link (e.g. YouTube) |
| thumbnail_url | TEXT | Optional poster/thumbnail image |
| category | TEXT | DEFAULT 'experience' (same categories as photos) |
| display_order | INTEGER | DEFAULT 0 |
| is_featured | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

RLS: public SELECT for all users (videos are public content). INSERT/UPDATE/DELETE restricted to authenticated admin users (same pattern as `retreat_gallery`).

**Storage:** Use the existing `retreat-images` bucket for thumbnails; video files can be uploaded there too or linked externally (YouTube embeds).

## New Files

### `src/hooks/use-retreat-videos.ts`
- `useRetreatVideos(category?)` -- fetches from `retreat_videos` table, ordered by `display_order`
- `useRetreatVideoMutations()` -- upload, update, delete mutations (same pattern as `use-retreat-gallery.ts`)
- Export `RETREAT_VIDEO_CATEGORIES` (same set: Experience, Healing, Food, Other)

### `src/components/retreats/RetreatVideoGallery.tsx`
- Renders below the existing photo gallery section
- Header: "Sacred Journey Videos" with subtitle
- Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop
- Each video card shows:
  - Thumbnail with a centered play button overlay
  - Title and description below
  - Click opens a Dialog/modal with an embedded video player (`<video>` tag for direct files, or iframe for YouTube)
- Loading skeleton state and empty "Videos Coming Soon" state (same pattern as photo gallery)
- Category filter tabs matching the photo gallery filters

## Modified Files

### `src/pages/Retreats.tsx`
- Import and add `<RetreatVideoGallery />` directly after `<RetreatGallery />`

### `src/pages/AdminRetreatDates.tsx` (or new admin page)
- Add a "Videos" tab/section to the retreat admin for uploading and managing retreat videos (title, description, category, file upload or URL input, thumbnail, display order)

## Technical Details

- Videos are rendered using the native HTML5 `<video>` element inside a Dialog modal for direct uploads
- For YouTube/external links, detect the URL pattern and render an iframe embed instead
- Thumbnails are auto-generated if not provided (show a gradient placeholder with a Play icon)
- Video files uploaded to storage are stored in the `retreat-images` bucket (or a new `retreat-videos` bucket if preferred)
- The section uses the same visual language as the photo gallery (rounded corners, hover effects, cream background) but is clearly separated with its own heading

