import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// YouTube channel handle to sync from
const YOUTUBE_HANDLE = "KAILASHLEONCE";

async function resolveChannelId(handle: string): Promise<string | null> {
  const res = await fetch(`https://www.youtube.com/@${handle}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
  });
  const html = await res.text();

  const patterns = [
    /"externalId":"(UC[a-zA-Z0-9_-]+)"/,
    /channel_id=(UC[a-zA-Z0-9_-]+)/,
    /"channelId":"(UC[a-zA-Z0-9_-]+)"/,
    /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface VideoEntry {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
}

async function fetchLiveStreamVideos(handle: string): Promise<VideoEntry[]> {
  // Fetch the /streams tab to get only live stream videos
  const res = await fetch(`https://www.youtube.com/@${handle}/streams`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const html = await res.text();

  // Extract the ytInitialData JSON from the page
  const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s);
  if (!dataMatch) {
    console.log("Could not find ytInitialData");
    return [];
  }

  let ytData: any;
  try {
    ytData = JSON.parse(dataMatch[1]);
  } catch {
    console.log("Failed to parse ytInitialData");
    return [];
  }

  const entries: VideoEntry[] = [];

  // Navigate the ytInitialData structure to find video renderers
  const tabs = ytData?.contents?.twoColumnBrowseResultsRenderer?.tabs;
  if (!tabs) return entries;

  for (const tab of tabs) {
    const tabContent = tab?.tabRenderer?.content;
    if (!tabContent) continue;

    const richGrid = tabContent?.richGridRenderer;
    if (!richGrid) continue;

    for (const item of richGrid.contents || []) {
      const renderer = item?.richItemRenderer?.content?.videoRenderer;
      if (!renderer) continue;

      const videoId = renderer.videoId;
      if (!videoId) continue;

      const title = renderer.title?.runs?.[0]?.text || renderer.title?.simpleText || "";
      const desc = renderer.descriptionSnippet?.runs?.map((r: any) => r.text).join("") || "";
      
      // Try to get publish date from the page data
      const publishedText = renderer.publishedTimeText?.simpleText || "";
      
      entries.push({
        videoId,
        title,
        description: desc.slice(0, 500),
        publishedAt: "", // Will be enriched via oEmbed or left for RSS fallback
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      });
    }
  }

  return entries;
}

async function enrichWithPublishDates(entries: VideoEntry[]): Promise<void> {
  // Use oEmbed to get basic metadata (no API key needed)
  for (const entry of entries) {
    if (!entry.publishedAt) {
      try {
        // Try RSS feed as a backup for publish dates
        // oEmbed doesn't provide dates, so we'll leave empty and let DB handle it
      } catch {
        // Ignore errors
      }
    }
  }
}

// Fallback: also try RSS feed to enrich publish dates
async function enrichFromRss(channelId: string, entries: VideoEntry[]): Promise<void> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const rssRes = await fetch(rssUrl);
    if (!rssRes.ok) return;
    
    const xml = await rssRes.text();
    const videoIdToDate = new Map<string, string>();
    
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    while ((m = entryRegex.exec(xml)) !== null) {
      const entryXml = m[1];
      const vidMatch = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const pubMatch = entryXml.match(/<published>([^<]+)<\/published>/);
      if (vidMatch && pubMatch) {
        videoIdToDate.set(vidMatch[1], pubMatch[1]);
      }
    }
    
    for (const entry of entries) {
      const date = videoIdToDate.get(entry.videoId);
      if (date) entry.publishedAt = date;
    }
  } catch {
    // Ignore RSS errors
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Resolve channel ID
    const channelId = await resolveChannelId(YOUTUBE_HANDLE);
    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "Could not resolve channel ID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch live stream videos from the /streams tab
    const entries = await fetchLiveStreamVideos(YOUTUBE_HANDLE);
    
    // 3. Enrich with publish dates from RSS
    await enrichFromRss(channelId, entries);

    // 4. Upsert into database using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let inserted = 0;
    let updated = 0;

    for (const entry of entries) {
      const { data: existing } = await supabase
        .from("webinar_videos")
        .select("id")
        .eq("youtube_video_id", entry.videoId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("webinar_videos")
          .update({
            title: entry.title,
            description: entry.description,
            thumbnail_url: entry.thumbnailUrl,
            ...(entry.publishedAt ? { published_at: entry.publishedAt } : {}),
          })
          .eq("youtube_video_id", entry.videoId);
        updated++;
      } else {
        await supabase.from("webinar_videos").insert({
          youtube_video_id: entry.videoId,
          title: entry.title,
          description: entry.description,
          thumbnail_url: entry.thumbnailUrl,
          ...(entry.publishedAt ? { published_at: entry.publishedAt } : {}),
        });
        inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        channelId,
        totalFound: entries.length,
        inserted,
        updated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
