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
import { Play, Video } from "lucide-react";

function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/i.test(url);
}

function getYouTubeEmbedUrl(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
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
            We're preparing beautiful videos of our retreat experience. Check back soon to see
            our ceremonies, healing sessions, and the natural beauty of St. Lucia.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-cream">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sacred Journey Videos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Watch the transformative experiences, sacred ceremonies, and healing moments from our retreats.
          </p>

          {/* Category filters */}
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

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group relative overflow-hidden rounded-xl cursor-pointer bg-background shadow-md hover:shadow-xl transition-shadow duration-300"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title || "Retreat video"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-7 h-7 text-foreground ml-1" />
                  </div>
                </div>
              </div>

              {/* Info */}
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
          ))}
        </div>
      </div>

      {/* Video playback modal */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{selectedVideo?.title || "Retreat Video"}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedVideo && isYouTubeUrl(selectedVideo.video_url) ? (
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.video_url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : selectedVideo ? (
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
