import { useEffect, useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useWebinarVideos, WebinarVideo } from "@/hooks/use-webinar-videos";
import "@/styles/webinar.css";

import WebinarHero from "@/components/webinar/WebinarHero";
import WebinarFeatured from "@/components/webinar/WebinarFeatured";
import WebinarCommunity from "@/components/webinar/WebinarCommunity";
import WebinarShowcase from "@/components/webinar/WebinarShowcase";
import WebinarTrust from "@/components/webinar/WebinarTrust";
import WebinarHost from "@/components/webinar/WebinarHost";
import WebinarSignup from "@/components/webinar/WebinarSignup";
import WebinarExplore from "@/components/webinar/WebinarExplore";
import WebinarFooter from "@/components/webinar/WebinarFooter";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Webinars() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<WebinarVideo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dbVideos = [] } = useWebinarVideos();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  // Filter videos by search query
  const filteredVideos = searchQuery.trim()
    ? dbVideos.filter(v =>
        (v.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.category || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dbVideos;

  return (
    <div style={{ backgroundColor: "var(--site-bg-primary)", color: "var(--site-text-primary)" }}>
      <SEOHead title="Free Herbal Medicine Webinars | Priest Kailash | Mount Kailash" description="Join free live webinars on herbal medicine, natural health and holistic wellness with Priest Kailash. Expert-led sessions on immunity, fertility, detox and more." path="/webinars" />
      <WebinarHero />
      <WebinarFeatured />
      <WebinarCommunity onVideoClick={setSelectedVideo} />
      <WebinarShowcase
        videos={filteredVideos}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onVideoClick={setSelectedVideo}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <WebinarTrust />
      <WebinarHost />
      <WebinarSignup />
      <WebinarExplore />
      <WebinarFooter />

      {/* Video playback lightbox */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent
          className="sm:max-w-4xl p-0 overflow-hidden"
          style={{ backgroundColor: "#111111", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="font-cormorant text-lg" style={{ color: "#f2ead8" }}>
              {selectedVideo?.title || "Webinar Replay"}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedVideo && (
              <iframe
                key={selectedVideo.id}
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_video_id}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
