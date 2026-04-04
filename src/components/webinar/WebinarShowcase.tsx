import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, Clock, Calendar } from "lucide-react";
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

/* Branded thumbnail card */
function VideoCard({ video, onClick }: { video: WebinarVideo; onClick: () => void }) {
  const isNew = video.published_at
    ? (Date.now() - new Date(video.published_at).getTime()) < 30 * 24 * 60 * 60 * 1000
    : false;

  const categoryMeta = CATEGORY_META[video.category || "general"];
  const formattedDate = video.published_at
    ? new Date(video.published_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  // Clean up title: remove "Copy of", truncate
  const cleanTitle = (video.title || "Webinar Session")
    .replace(/^Copy of\s*/i, "")
    .replace(/Priest Kailash Student Testi.*/i, "Student Testimony");

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] webinar-card-glow group"
      style={{
        backgroundColor: "var(--site-bg-deep)",
        border: "1px solid rgba(201,168,76,0.15)",
        width: "100%",
      }}
    >
      {/* Branded thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={cleanTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0d 100%)" }}>
            <span className="font-cormorant font-bold text-xl text-center px-6" style={{ color: "var(--site-text-primary)" }}>{cleanTitle}</span>
          </div>
        )}

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />


        {/* New badge */}
        {isNew && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-jost font-medium" style={{ backgroundColor: "var(--site-gold)", color: "#090909" }}>
            New
          </div>
        )}

        {/* Category tag on thumbnail */}
        {categoryMeta && (
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-jost backdrop-blur-sm" style={{ backgroundColor: "rgba(9,9,9,0.7)", color: "var(--site-gold)", border: "1px solid rgba(201,168,76,0.2)" }}>
            {categoryMeta.emoji} {categoryMeta.label}
          </div>
        )}

        {/* Date badge */}
        {formattedDate && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-jost" style={{ backgroundColor: "rgba(9,9,9,0.7)", color: "var(--site-text-secondary)" }}>
            {formattedDate}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h4 className="font-cormorant font-semibold text-lg mb-1 line-clamp-2" style={{ color: "var(--site-text-primary)" }}>
          {cleanTitle}
        </h4>
        {video.description && (
          <p className="font-jost font-light text-sm line-clamp-2 mb-3" style={{ color: "var(--site-text-secondary)" }}>
            {video.description}
          </p>
        )}
        <span className="font-jost text-sm font-medium" style={{ color: "var(--site-gold)" }}>
          Watch Now →
        </span>
      </div>
    </div>
  );
}

/* Carousel Row */
function CarouselRow({ category, videos, onVideoClick }: { category: string; videos: WebinarVideo[]; onVideoClick: (v: WebinarVideo) => void }) {
  const meta = CATEGORY_META[category];
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [showAll, setShowAll] = useState(false);
  const isPaused = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const realCount = videos.length;

  useEffect(() => {
    function update() {
      requestAnimationFrame(() => {
        const w = containerRef.current?.offsetWidth || 1200;
        if (w < 640) setCardsPerView(1);
        else if (w < 1024) setCardsPerView(2);
        else setCardsPerView(3);
      });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (currentIndex >= 0 && currentIndex < realCount) {
      requestAnimationFrame(() => {
        track.classList.add("animating");
      });
    }
  }, [currentIndex, realCount]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isPaused.current && !showAll) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [showAll]);

  if (realCount === 0) return null;

  const activeDot = ((currentIndex % realCount) + realCount) % realCount;

  return (
    <div className="mb-16 webinar-reveal" ref={containerRef}>
      {/* Row header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--site-gold)" }} />
          <h3 className="font-cormorant font-semibold text-xl md:text-2xl" style={{ color: "var(--site-text-primary)" }}>
            {meta?.label || category}
          </h3>
          <span className="font-jost text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "var(--site-gold)" }}>
            {realCount} sessions
          </span>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="font-jost text-sm font-medium cursor-pointer transition-colors hover:brightness-125"
          style={{ color: "var(--site-gold)", background: "none", border: "none" }}
        >
          {showAll ? "Show Carousel ←" : "View All →"}
        </button>
      </div>
      {meta?.description && (
        <p className="font-jost font-light text-sm mb-5" style={{ color: "var(--site-text-secondary)" }}>
          {meta.description}
        </p>
      )}

      {showAll ? (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} onClick={() => onVideoClick(video)} />
          ))}
        </div>
      ) : (
        /* Carousel view */
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

          {/* Navigation arrows — always visible */}
          <button
            onClick={() => setCurrentIndex((p) => p - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ backgroundColor: "rgba(9,9,9,0.8)", border: "1px solid rgba(201,168,76,0.4)" }}
            aria-label="Previous"
          >
            <ChevronLeft size={18} style={{ color: "var(--site-gold)" }} />
          </button>
          <button
            onClick={() => setCurrentIndex((p) => p + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ backgroundColor: "rgba(9,9,9,0.8)", border: "1px solid rgba(201,168,76,0.4)" }}
            aria-label="Next"
          >
            <ChevronRight size={18} style={{ color: "var(--site-gold)" }} />
          </button>
        </div>
      )}

      {/* Dots */}
      {!showAll && realCount > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{
                backgroundColor: i === activeDot ? "var(--site-gold)" : "rgba(201,168,76,0.25)",
                transform: i === activeDot ? "scale(1.5)" : "scale(1)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* Filter pills */
const FILTER_PILLS = [
  { label: "All", value: "all" },
  { label: "Most Popular", value: "popular" },
  { label: "Women's Health", value: "women" },
  { label: "Men's Health", value: "men" },
  { label: "Nutrition", value: "nutrition" },
  { label: "Herbal Medicine", value: "herbal" },
  { label: "Detox", value: "detox" },
  { label: "Mental Wellness", value: "mental" },
  { label: "General", value: "general" },
];

interface WebinarShowcaseProps {
  videos: WebinarVideo[];
  activeFilter: string;
  onFilterChange: (f: string) => void;
  onVideoClick: (v: WebinarVideo) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function WebinarShowcase({ videos, activeFilter, onFilterChange, onVideoClick, searchQuery, onSearchChange }: WebinarShowcaseProps) {
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
      style={{ backgroundColor: "var(--site-bg-primary)" }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2
            className="font-cormorant font-bold italic mb-3"
            style={{ color: "var(--site-text-primary)", fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)" }}
          >
            Past Sessions & Replays
          </h2>
          <p className="font-jost font-light" style={{ color: "var(--site-text-secondary)" }}>
            Explore every topic, watch at your own pace.
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--site-text-secondary)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by concern: fertility, detox, blood pressure..."
              className="w-full rounded-full pl-10 pr-5 py-3 text-sm font-jost outline-none transition-all duration-200"
              style={{
                backgroundColor: "var(--site-bg-deep)",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "var(--site-text-primary)",
              }}
            />
          </div>
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
                  backgroundColor: active ? "var(--site-gold)" : "transparent",
                  color: active ? "#090909" : "#8a8070",
                  border: `1px solid ${active ? "var(--site-gold)" : "rgba(201,168,76,0.25)"}`,
                  fontWeight: active ? 500 : 300,
                  cursor: "pointer",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Category carousels */}
        {activeFilter === "all" || activeFilter === "popular" ? (
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
                  <p className="font-jost" style={{ color: "var(--site-text-secondary)" }}>No webinars in this category yet.</p>
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

        {videos.length === 0 && !searchQuery && (
          <div className="text-center py-16">
            <p className="font-jost text-lg" style={{ color: "var(--site-text-secondary)" }}>No webinar videos yet.</p>
            <p className="font-jost text-sm mt-2" style={{ color: "var(--site-text-secondary)" }}>Check back soon for new sessions.</p>
          </div>
        )}

        {videos.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <p className="font-jost text-lg mb-2" style={{ color: "var(--site-text-primary)" }}>No results for "{searchQuery}"</p>
            <p className="font-jost text-sm" style={{ color: "var(--site-text-secondary)" }}>Try searching for a different topic or browse categories above.</p>
          </div>
        )}
      </div>
    </section>
  );
}
