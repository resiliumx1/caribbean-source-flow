import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WebinarVideo } from "@/hooks/use-webinar-videos";

const CATEGORY_META: Record<string, { label: string; emoji: string; description: string }> = {
  women: { label: "Women's Health", emoji: "🌸", description: "Fertility, hormonal balance, fibroids, PCOS, and reproductive wellness." },
  men: { label: "Men's Health", emoji: "💪", description: "Prostate health, testosterone, and men's vitality protocols." },
  nutrition: { label: "Nutrition", emoji: "🩸", description: "Blood-building, alkaline diets, fasting, and Caribbean superfoods." },
  herbal: { label: "Herbal Medicine", emoji: "🌿", description: "Bush medicine, tinctures, cupping, and plant-based healing." },
  detox: { label: "Detox", emoji: "🧹", description: "Parasite cleansing, colon health, and full-body detox protocols." },
  mental: { label: "Mental Wellness", emoji: "🧠", description: "Stress relief, sleep, anxiety, and nervous system support." },
  general: { label: "General", emoji: "🎥", description: "General wellness topics and live Q&A sessions." },
};

const SECTION_ORDER = ["women", "men", "nutrition", "herbal", "detox", "mental", "general"];

interface VideoCardProps {
  video: WebinarVideo;
  onClick: () => void;
}

function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 webinar-card-glow"
      style={{
        backgroundColor: "#18181b",
        border: "1px solid rgba(201,168,76,0.2)",
        width: "100%",
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title || ""} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#27272a" }}>
            <span className="text-4xl">🎥</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* Play icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M1 1L15 9L1 17V1Z" fill="white" />
            </svg>
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="p-4">
        <h4 className="font-cormorant font-semibold text-lg mb-1 line-clamp-2" style={{ color: "#f2ead8" }}>
          {video.title}
        </h4>
        {video.description && (
          <p className="font-jost font-light text-sm line-clamp-2 mb-3" style={{ color: "#8a8070" }}>
            {video.description}
          </p>
        )}
        <span className="font-jost text-sm" style={{ color: "#c9a84c" }}>
          Watch Now →
        </span>
      </div>
    </div>
  );
}

interface CarouselRowProps {
  category: string;
  videos: WebinarVideo[];
  onVideoClick: (v: WebinarVideo) => void;
}

function CarouselRow({ category, videos, onVideoClick }: CarouselRowProps) {
  const meta = CATEGORY_META[category];
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const isPaused = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const realCount = videos.length;

  // Determine cards per view based on container width
  useEffect(() => {
    function update() {
      const w = containerRef.current?.offsetWidth || 1200;
      if (w < 640) setCardsPerView(1);
      else if (w < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Build extended array: [last N clones] + [real] + [first N clones]
  const cloneCount = Math.min(cardsPerView, realCount);
  const extendedVideos = [
    ...videos.slice(-cloneCount),
    ...videos,
    ...videos.slice(0, cloneCount),
  ];

  const cardWidthPercent = 100 / cardsPerView;
  const gapPx = 16;

  const getTranslateX = useCallback(
    (idx: number) => {
      const offset = idx + cloneCount;
      return `calc(-${offset * cardWidthPercent}% - ${offset * gapPx}px)`;
    },
    [cloneCount, cardWidthPercent, gapPx]
  );

  // Silent jump after transition ends
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handleEnd = () => {
      if (currentIndex >= realCount) {
        track.classList.remove("animating");
        setCurrentIndex(0);
      } else if (currentIndex < 0) {
        track.classList.remove("animating");
        setCurrentIndex(realCount - 1);
      }
    };
    track.addEventListener("transitionend", handleEnd);
    return () => track.removeEventListener("transitionend", handleEnd);
  }, [currentIndex, realCount]);

  // Animate
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // If within range or exactly at boundary, animate
    if (currentIndex >= 0 && currentIndex < realCount) {
      requestAnimationFrame(() => {
        track.classList.add("animating");
      });
    }
  }, [currentIndex, realCount]);

  // Auto-scroll
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isPaused.current) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const scrollPrev = () => setCurrentIndex((p) => p - 1);
  const scrollNext = () => setCurrentIndex((p) => p + 1);

  if (realCount === 0) return null;

  // Dot count = Math.ceil(realCount / 1) but we show position modulo
  const activeDot = ((currentIndex % realCount) + realCount) % realCount;

  return (
    <div className="mb-16 webinar-reveal" ref={containerRef}>
      {/* Row header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#c9a84c" }} />
          <h3 className="font-cormorant font-semibold text-xl md:text-2xl" style={{ color: "#f2ead8" }}>
            {meta?.label || category}
          </h3>
        </div>
        <span className="font-jost text-sm cursor-pointer transition-colors hover:brightness-125" style={{ color: "#c9a84c" }}>
          View All →
        </span>
      </div>
      {meta?.description && (
        <p className="font-jost font-light text-sm mb-5" style={{ color: "#8a8070" }}>
          {meta.description}
        </p>
      )}

      {/* Carousel */}
      <div
        className="relative"
        onMouseEnter={() => { isPaused.current = true; }}
        onMouseLeave={() => { isPaused.current = false; }}
      >
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="webinar-carousel-track"
            style={{
              transform: `translateX(${getTranslateX(currentIndex)})`,
              gap: `${gapPx}px`,
            }}
          >
            {extendedVideos.map((video, i) => (
              <div
                key={`${video.id}-${i}`}
                style={{ flex: `0 0 calc(${cardWidthPercent}% - ${gapPx * (cardsPerView - 1) / cardsPerView}px)` }}
              >
                <VideoCard video={video} onClick={() => onVideoClick(video)} />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ backgroundColor: "rgba(9,9,9,0.7)", border: "1px solid rgba(201,168,76,0.3)" }}
          aria-label="Previous"
        >
          <ChevronLeft size={18} style={{ color: "#c9a84c" }} />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ backgroundColor: "rgba(9,9,9,0.7)", border: "1px solid rgba(201,168,76,0.3)" }}
          aria-label="Next"
        >
          <ChevronRight size={18} style={{ color: "#c9a84c" }} />
        </button>
      </div>

      {/* Dots */}
      {realCount > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{
                backgroundColor: i === activeDot ? "#c9a84c" : "rgba(201,168,76,0.25)",
                transform: i === activeDot ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WebinarShowcaseProps {
  videos: WebinarVideo[];
  activeFilter: string;
  onFilterChange: (f: string) => void;
  onVideoClick: (v: WebinarVideo) => void;
}

const FILTER_PILLS = [
  { label: "All", value: "all" },
  { label: "Women's Health", value: "women" },
  { label: "Men's Health", value: "men" },
  { label: "Nutrition", value: "nutrition" },
  { label: "Herbal Medicine", value: "herbal" },
  { label: "Detox", value: "detox" },
  { label: "Mental Wellness", value: "mental" },
  { label: "General", value: "general" },
];

export default function WebinarShowcase({ videos, activeFilter, onFilterChange, onVideoClick }: WebinarShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add("visible"); }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Group by category
  const videosByCategory = new Map<string, WebinarVideo[]>();
  for (const v of videos) {
    const cat = v.category || "general";
    if (!videosByCategory.has(cat)) videosByCategory.set(cat, []);
    videosByCategory.get(cat)!.push(v);
  }

  // Observe carousel rows
  useEffect(() => {
    const rows = document.querySelectorAll(".webinar-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    rows.forEach((r) => obs.observe(r));
    return () => obs.disconnect();
  }, [videos, activeFilter]);

  return (
    <section
      id="archive"
      ref={sectionRef}
      className="webinar-reveal webinar-noise relative"
      style={{ backgroundColor: "#090909" }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2
            className="font-cormorant font-bold italic mb-3"
            style={{ color: "#f2ead8", fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)" }}
          >
            Past Sessions & Replays
          </h2>
          <p className="font-jost font-light" style={{ color: "#8a8070" }}>
            Explore every topic, watch at your own pace.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {FILTER_PILLS.map((cat) => {
            const active = cat.value === activeFilter;
            return (
              <button
                key={cat.value}
                onClick={() => onFilterChange(cat.value)}
                className="font-jost text-sm px-5 py-2 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: active ? "#c9a84c" : "transparent",
                  color: active ? "#090909" : "#8a8070",
                  border: `1px solid ${active ? "#c9a84c" : "rgba(201,168,76,0.25)"}`,
                  cursor: "pointer",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Category carousels */}
        {activeFilter === "all" ? (
          SECTION_ORDER.map((cat) => {
            const catVideos = videosByCategory.get(cat);
            if (!catVideos || catVideos.length === 0) return null;
            return (
              <CarouselRow
                key={cat}
                category={cat}
                videos={catVideos}
                onVideoClick={onVideoClick}
              />
            );
          })
        ) : (
          (() => {
            const catVideos = videosByCategory.get(activeFilter);
            if (!catVideos || catVideos.length === 0) {
              return (
                <div className="text-center py-16">
                  <p className="font-jost" style={{ color: "#8a8070" }}>No webinars in this category yet.</p>
                </div>
              );
            }
            return (
              <CarouselRow
                category={activeFilter}
                videos={catVideos}
                onVideoClick={onVideoClick}
              />
            );
          })()
        )}

        {videos.length === 0 && (
          <div className="text-center py-16">
            <p className="font-jost text-lg" style={{ color: "#8a8070" }}>No webinar videos yet.</p>
            <p className="font-jost text-sm mt-2" style={{ color: "#8a8070" }}>Check back soon for new sessions.</p>
          </div>
        )}
      </div>
    </section>
  );
}
