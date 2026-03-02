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

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
}

const SCHOOL_VIDEO_CATEGORIES = [
  { value: "school", label: "School" },
  { value: "lecture", label: "Lectures" },
  { value: "other", label: "Other" },
] as const;

export function SchoolVideoGallery() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  // Use retreat_videos table filtered to school-related categories
  const { data: allVideos = [], isLoading } = useRetreatVideos(activeCategory);
  const [selectedVideo, setSelectedVideo] = useState<RetreatVideo | null>(null);

  // Filter to school-related categories only
  const videos = allVideos.filter((v) =>
    ["school", "lecture"].includes(v.category) || activeCategory
  );

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
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
    return null; // Don't render section if no school videos
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            School Videos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Watch lectures, demonstrations, and student experiences from our herbal medicine programs.
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
            {SCHOOL_VIDEO_CATEGORIES.map((cat) => (
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
            const thumbnailSrc =
              video.thumbnail_url ||
              (isYouTubeUrl(video.video_url) ? getYouTubeThumbnail(video.video_url) : null);

            return (
              <div
                key={video.id}
                className="group relative overflow-hidden rounded-xl cursor-pointer bg-background shadow-md hover:shadow-xl transition-shadow duration-300"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="aspect-video relative overflow-hidden">
                  {thumbnailSrc ? (
                    <img
                      src={thumbnailSrc}
                      alt={video.title || "School video"}
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
                      <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
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

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{selectedVideo?.title || "School Video"}</DialogTitle>
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
