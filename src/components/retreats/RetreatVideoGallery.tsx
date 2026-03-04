import { useState } from "react";
import { useRetreatVideos, RETREAT_VIDEO_CATEGORIES, RetreatVideo } from "@/hooks/use-retreat-videos";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Video, ExternalLink } from "lucide-react";

function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/i.test(url);
}

function isStreamableUrl(url: string) {
  return /streamable\.com/i.test(url);
}

function isTikTokUrl(url: string) {
  return /tiktok\.com/i.test(url);
}

function isEmbeddableUrl(url: string) {
  return isYouTubeUrl(url) || isStreamableUrl(url);
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

  // Streamable
  const streamMatch = url.match(/streamable\.com\/([a-zA-Z0-9]+)/);
  if (streamMatch) return `https://streamable.com/e/${streamMatch[1]}?autoplay=1`;

  return null;
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
}

function getStreamableThumbnail(url: string): string | null {
  const match = url.match(/streamable\.com\/([a-zA-Z0-9]+)/);
  return match ? `https://cdn-cf-east.streamable.com/image/${match[1]}.jpg` : null;
}

function getThumbnail(url: string): string | null {
  return getYouTubeThumbnail(url) || getStreamableThumbnail(url);
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export function RetreatVideoGallery() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const { data: videos = [], isLoading } = useRetreatVideos(activeCategory);
  const [selectedVideo, setSelectedVideo] = useState<RetreatVideo | null>(null);

  if (isLoading) {
    return (
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4 text-center">
          <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Videos Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're preparing beautiful videos of our retreat experience. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  const handleVideoClick = (video: RetreatVideo) => {
    const embedUrl = getEmbedUrl(video.video_url);
    const isDirect = isDirectVideo(video.video_url);

    if (embedUrl || isDirect) {
      setSelectedVideo(video);
    } else {
      // For non-embeddable URLs (TikTok, Jumpshare, etc.), open in new tab
      window.open(video.video_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="py-20 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sacred Journey Videos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Watch the transformative experiences, sacred ceremonies, and healing moments from our retreats.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={activeCategory === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(undefined)}
              className="rounded-full"
            >
              All
            </Button>
            {RETREAT_VIDEO_CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className="rounded-full"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const thumbnailSrc = video.thumbnail_url || getThumbnail(video.video_url);
            const canEmbed = isEmbeddableUrl(video.video_url) || isDirectVideo(video.video_url);

            return (
              <div
                key={video.id}
                className="group relative overflow-hidden rounded-xl cursor-pointer bg-background shadow-md hover:shadow-xl transition-shadow duration-300"
                onClick={() => handleVideoClick(video)}
              >
                <div className="aspect-video relative overflow-hidden">
                  {thumbnailSrc ? (
                    <img
                      src={thumbnailSrc}
                      alt={video.title || "Retreat video"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Video className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-primary/85 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      {canEmbed ? (
                        <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
                      ) : (
                        <ExternalLink className="w-7 h-7 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {(video.title || video.description) && (
                  <div className="p-4">
                    {video.title && (
                      <h3 className="font-serif font-semibold text-foreground text-lg line-clamp-1">
                        {video.title}
                      </h3>
                    )}
                    {video.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                        {video.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Video playback modal */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => { if (!open) setSelectedVideo(null); }}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden [&>button]:z-50">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{selectedVideo?.title || "Retreat Video"}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedVideo && (() => {
              const embedUrl = getEmbedUrl(selectedVideo.video_url);
              if (embedUrl) {
                return (
                  <iframe
                    key={selectedVideo.id}
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    title={selectedVideo.title || "Retreat Video"}
                  />
                );
              }
              if (isDirectVideo(selectedVideo.video_url)) {
                return (
                  <video
                    key={selectedVideo.id}
                    src={selectedVideo.video_url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                );
              }
              return null;
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
