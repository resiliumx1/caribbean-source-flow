import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// YouTube channel handle to sync from
const YOUTUBE_HANDLE = "KAILASHLEONCE";

async function resolveChannelId(handle: string): Promise<string | null> {
  // Fetch the channel page and extract channel ID from the HTML
  const res = await fetch(`https://www.youtube.com/@${handle}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const html = await res.text();

  // Look for channel ID in meta tags or canonical URLs
  const patterns = [
    /\"externalId\":\"(UC[a-zA-Z0-9_-]+)\"/,
    /channel_id=(UC[a-zA-Z0-9_-]+)/,
    /\"channelId\":\"(UC[a-zA-Z0-9_-]+)\"/,
    /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parseXmlField(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : "";
}

function parseEntries(xml: string) {
  const entries: Array<{
    videoId: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnailUrl: string;
  }> = [];

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRegex.exec(xml)) !== null) {
    const entry = m[1];
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!videoIdMatch) continue;

    const videoId = videoIdMatch[1];
    const title = parseXmlField(entry, "title");
    // media:description or regular description
    const descMatch =
      entry.match(/<media:description>([\s\S]*?)<\/media:description>/) ||
      entry.match(/<description>([\s\S]*?)<\/description>/);
    const description = descMatch ? descMatch[1].trim() : "";
    const published = parseXmlField(entry, "published");
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    entries.push({
      videoId,
      title,
      description: description.slice(0, 500),
      publishedAt: published,
      thumbnailUrl,
    });
  }

  return entries;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Resolve channel ID from handle
    const channelId = await resolveChannelId(YOUTUBE_HANDLE);
    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "Could not resolve channel ID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch RSS feed
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const rssRes = await fetch(rssUrl);
    if (!rssRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch RSS feed", status: rssRes.status }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const xml = await rssRes.text();
    const entries = parseEntries(xml);

    // 3. Upsert into database using service role
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
            published_at: entry.publishedAt,
          })
          .eq("youtube_video_id", entry.videoId);
        updated++;
      } else {
        await supabase.from("webinar_videos").insert({
          youtube_video_id: entry.videoId,
          title: entry.title,
          description: entry.description,
          thumbnail_url: entry.thumbnailUrl,
          published_at: entry.publishedAt,
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
