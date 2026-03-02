import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const YOUTUBE_HANDLE = "KAILASHLEONCE";
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

// ── Auto-categorization by title keywords ──

const CATEGORY_RULES: { category: string; keywords: RegExp }[] = [
  { category: "women", keywords: /fertil|reproductive|womb|fibroid|pcos|menstrual|hormonal|ovarian|endometri|pregnan|period|vaginal|cervic|breast|women'?s\s*health/i },
  { category: "men", keywords: /male\s*reproduc|prostate|men'?s|manhood|testosterone|erecti|sperm|men'?s\s*health/i },
  { category: "detox", keywords: /detox|parasite|cleanse|cleansing|toxin|colon|purge|purif|liver\s*cleanse|kidney\s*cleanse|bowel/i },
  { category: "herbal", keywords: /\bherb|herbal|cupping|tincture|bush\s*medicine|plant\s*medicine|seamoss|sea\s*moss|moringa|soursop|turmeric/i },
  { category: "nutrition", keywords: /nutrition|food|diet|blood|iron|alkaline|fasting|superfood|vitamin|mineral|eat|juice|juicing/i },
  { category: "mental", keywords: /stress|anxiety|mental|sleep|depression|nervous\s*system|insomnia|meditation|mind/i },
];

function classifyByTitle(title: string): string {
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.test(title)) return rule.category;
  }
  return "general";
}

// ── YouTube scraping helpers ──

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function resolveChannelId(handle: string): Promise<string | null> {
  const res = await fetch(`https://www.youtube.com/@${handle}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  const html = await res.text();
  const patterns = [
    /"externalId":"(UC[a-zA-Z0-9_-]+)"/,
    /channel_id=(UC[a-zA-Z0-9_-]+)/,
    /"channelId":"(UC[a-zA-Z0-9_-]+)"/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
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

// Extract video entries from richGridRenderer contents array
function extractVideos(contents: any[]): VideoEntry[] {
  const entries: VideoEntry[] = [];
  for (const item of contents) {
    const renderer = item?.richItemRenderer?.content?.videoRenderer;
    if (!renderer?.videoId) continue;
    const title = renderer.title?.runs?.[0]?.text || renderer.title?.simpleText || "";
    const desc = renderer.descriptionSnippet?.runs?.map((r: any) => r.text).join("") || "";
    entries.push({
      videoId: renderer.videoId,
      title,
      description: desc.slice(0, 500),
      publishedAt: "",
      thumbnailUrl: `https://img.youtube.com/vi/${renderer.videoId}/maxresdefault.jpg`,
    });
  }
  return entries;
}

// Extract continuation token from contents or response actions
function findContinuationToken(data: any): string | null {
  // Try from richGridRenderer contents (initial page)
  const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs;
  if (tabs) {
    for (const tab of tabs) {
      const contents = tab?.tabRenderer?.content?.richGridRenderer?.contents;
      if (!contents) continue;
      for (const item of contents) {
        const token = item?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
        if (token) return token;
      }
    }
  }
  // Try from continuation response (onResponseReceivedActions)
  const actions = data?.onResponseReceivedActions;
  if (actions) {
    for (const action of actions) {
      const items = action?.appendContinuationItemsAction?.continuationItems;
      if (!items) continue;
      for (const item of items) {
        const token = item?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
        if (token) return token;
      }
    }
  }
  return null;
}

// Extract videos from continuation response
function extractContinuationVideos(data: any): VideoEntry[] {
  const entries: VideoEntry[] = [];
  const actions = data?.onResponseReceivedActions;
  if (!actions) return entries;
  for (const action of actions) {
    const items = action?.appendContinuationItemsAction?.continuationItems;
    if (!items) continue;
    entries.push(...extractVideos(items));
  }
  return entries;
}

const INNERTUBE_CONTEXT = {
  client: {
    clientName: "WEB",
    clientVersion: "2.20240101.00.00",
    hl: "en",
    gl: "US",
  },
};

async function fetchAllLiveStreams(handle: string): Promise<VideoEntry[]> {
  // 1. Get initial page
  const res = await fetch(`https://www.youtube.com/@${handle}/streams`, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
  });
  const html = await res.text();
  const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s);
  if (!dataMatch) {
    console.log("Could not find ytInitialData");
    return [];
  }

  let ytData: any;
  try { ytData = JSON.parse(dataMatch[1]); } catch { return []; }

  // Extract initial videos
  const allEntries: VideoEntry[] = [];
  const tabs = ytData?.contents?.twoColumnBrowseResultsRenderer?.tabs;
  if (tabs) {
    for (const tab of tabs) {
      const contents = tab?.tabRenderer?.content?.richGridRenderer?.contents;
      if (contents) allEntries.push(...extractVideos(contents));
    }
  }
  console.log(`Initial batch: ${allEntries.length} videos`);

  // 2. Paginate with continuation tokens
  let continuationToken = findContinuationToken(ytData);
  let page = 0;
  const MAX_PAGES = 20; // safety limit

  while (continuationToken && page < MAX_PAGES) {
    page++;
    console.log(`Fetching continuation page ${page}...`);
    try {
      const contRes = await fetch(
        "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
          body: JSON.stringify({
            context: INNERTUBE_CONTEXT,
            continuation: continuationToken,
          }),
        }
      );
      if (!contRes.ok) { console.log(`Continuation request failed: ${contRes.status}`); break; }
      const contData = await contRes.json();
      const newVideos = extractContinuationVideos(contData);
      console.log(`Page ${page}: ${newVideos.length} videos`);
      if (newVideos.length === 0) break;
      allEntries.push(...newVideos);
      continuationToken = findContinuationToken(contData);
    } catch (err) {
      console.log(`Continuation error: ${err}`);
      break;
    }
  }

  console.log(`Total scraped: ${allEntries.length} videos`);
  return allEntries;
}

// Enrich publish dates from RSS feed
async function enrichFromRss(channelId: string, entries: VideoEntry[]): Promise<void> {
  try {
    const rssRes = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (!rssRes.ok) return;
    const xml = await rssRes.text();
    const videoIdToDate = new Map<string, string>();
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    while ((m = entryRegex.exec(xml)) !== null) {
      const vidMatch = m[1].match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const pubMatch = m[1].match(/<published>([^<]+)<\/published>/);
      if (vidMatch && pubMatch) videoIdToDate.set(vidMatch[1], pubMatch[1]);
    }
    for (const entry of entries) {
      const date = videoIdToDate.get(entry.videoId);
      if (date) entry.publishedAt = date;
    }
  } catch { /* ignore */ }
}

// ── Main handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const channelId = await resolveChannelId(YOUTUBE_HANDLE);
    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "Could not resolve channel ID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const entries = await fetchAllLiveStreams(YOUTUBE_HANDLE);
    await enrichFromRss(channelId, entries);

    // Filter out videos older than 2 years (where we have dates)
    const cutoff = Date.now() - TWO_YEARS_MS;
    const filtered = entries.filter((e) => {
      if (!e.publishedAt) return true; // keep if no date
      return new Date(e.publishedAt).getTime() > cutoff;
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let inserted = 0;
    let updated = 0;

    for (const entry of filtered) {
      const category = classifyByTitle(entry.title);

      const { data: existing } = await supabase
        .from("webinar_videos")
        .select("id, category")
        .eq("youtube_video_id", entry.videoId)
        .maybeSingle();

      if (existing) {
        // Only update category if it's still "general" (don't override admin edits)
        const categoryUpdate = existing.category === "general" ? { category } : {};
        await supabase
          .from("webinar_videos")
          .update({
            title: entry.title,
            description: entry.description,
            thumbnail_url: entry.thumbnailUrl,
            ...(entry.publishedAt ? { published_at: entry.publishedAt } : {}),
            ...categoryUpdate,
          })
          .eq("youtube_video_id", entry.videoId);
        updated++;
      } else {
        await supabase.from("webinar_videos").insert({
          youtube_video_id: entry.videoId,
          title: entry.title,
          description: entry.description,
          thumbnail_url: entry.thumbnailUrl,
          category,
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
        afterFilter: filtered.length,
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
