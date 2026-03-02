import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/mkrc/ScrollReveal";
import SectionLabel from "@/components/mkrc/SectionLabel";
import CounterAnimation from "@/components/mkrc/CounterAnimation";
import webinarImg from "@/assets/mkrc-webinar-featured.jpg";
import { useWebinarVideos, WebinarVideo } from "@/hooks/use-webinar-videos";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WEBINAR_CATEGORIES = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Women's Health", value: "women" },
  { label: "Men's Health", value: "men" },
  { label: "Nutrition", value: "nutrition" },
  { label: "Herbal Medicine", value: "herbal" },
  { label: "Detox", value: "detox" },
  { label: "Mental Wellness", value: "mental" },
  { label: "General", value: "general" },
];

const CATEGORY_META: Record<string, { emoji: string; description: string }> = {
  women: { emoji: "🌸", description: "Fertility, hormonal balance, fibroids, PCOS, and reproductive wellness." },
  men: { emoji: "💪", description: "Prostate health, testosterone, and men's vitality protocols." },
  nutrition: { emoji: "🩸", description: "Blood-building, alkaline diets, fasting, and Caribbean superfoods." },
  herbal: { emoji: "🌿", description: "Bush medicine, tinctures, cupping, and plant-based healing." },
  detox: { emoji: "🧹", description: "Parasite cleansing, colon health, and full-body detox protocols." },
  mental: { emoji: "🧠", description: "Stress relief, sleep, anxiety, and nervous system support." },
  general: { emoji: "🎥", description: "General wellness topics and live Q&A sessions." },
};

const SECTION_ORDER = ["women", "men", "detox", "herbal", "nutrition", "mental", "general"];

const HARDCODED_WEBINARS = [
  { category: "detox", icon: "🧹", title: "Detox & Parasite Cleansing: The Foundation of Health", desc: "Discover why cleansing your system of parasites and toxins is the essential first step to any healing protocol.", duration: "~75 min" },
  { category: "mental", icon: "🧠", title: "Herbal Medicine for Stress, Anxiety & Sleep", desc: "Natural approaches to calming the nervous system, improving sleep quality, and building long-term mental resilience.", duration: "~60 min" },
  { category: "men", icon: "💪", title: "Men's Vitality: Prostate Health & Natural Performance", desc: "The herbs and protocols Caribbean men have relied on for generations to maintain prostate health and vitality.", duration: "~70 min" },
  { category: "herbal", icon: "🔥", title: "Understanding Inflammation: The Root of All Disease", desc: "How chronic inflammation silently destroys your health — and the Caribbean herbal protocols that address it at the source.", duration: "~80 min" },
  { category: "nutrition", icon: "🩸", title: "Building Blood: Iron, Energy & Caribbean Superfoods", desc: "Natural strategies to combat fatigue and anemia using iron-rich Caribbean superfoods and traditional blood-building herbs.", duration: "~65 min" },
  { category: "women", icon: "🌸", title: "Fibroids, PCOS & Endometriosis: A Natural Protocol", desc: "How Caribbean herbal medicine approaches the most common reproductive conditions affecting women today.", duration: "~85 min" },
];

const WHY_CARDS = [
  { icon: "🎓", title: "Expert-Led", desc: "Over 20 years of herbal medicine expertise distilled into accessible, practical sessions." },
  { icon: "🆓", title: "100% Free", desc: "No cost. No hidden upsell. Pure education." },
  { icon: "💬", title: "Interactive", desc: "Every live session includes open Q&A." },
  { icon: "✅", title: "Actionable", desc: "Leave every session with practical steps and herbal protocols you can implement today." },
];

const JOURNEY_CARDS = [
  { icon: "📚", title: "Herbal Physician Course", desc: "10-month certification program", href: "/school/herbal-physician-course" },
  { icon: "🏔️", title: "Group Retreats", desc: "Immersive healing in Saint Lucia", href: "/retreats" },
  { icon: "🌿", title: "Shop Products", desc: "Browse our herbal collection", href: "/shop" },
  { icon: "🗣️", title: "The Answer", desc: "Our best-selling immune tincture", href: "/shop/the-answer" },
];

const HOST_CREDS = ["Based in Saint Lucia", "20+ Years Practice", "Thousands Guided", "Herbal Medicine Master"];

function isNew(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  const diff = Date.now() - new Date(publishedAt).getTime();
  return diff < 30 * 24 * 60 * 60 * 1000;
}

const INITIAL_SHOW = 6;

// ── Video Card Component ──
function VideoCard({ video, onClick, index }: { video: WebinarVideo; onClick: () => void; index: number }) {
  return (
    <ScrollReveal delay={index * 60}>
      <div className="mkrc-card h-full flex flex-col cursor-pointer group" onClick={onClick}>
        <div className="aspect-video rounded-lg overflow-hidden mb-4 relative">
          {video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt={video.title || "Webinar replay"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#242420" }}>
              <span className="text-4xl">🎥</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm" style={{ backgroundColor: "rgba(201,168,76,0.85)" }}>
              <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 1.5L20.5 13L2 24.5V1.5Z" fill="#0D0D0D" stroke="#0D0D0D" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {isNew(video.published_at) && (
            <span className="absolute top-2 right-2 mkrc-label text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3A7D53", color: "#fff", fontSize: "0.6rem" }}>New</span>
          )}
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="mkrc-label text-xs px-2 py-1 rounded" style={{ fontSize: "0.6rem", border: "1px solid rgba(201,168,76,0.12)", color: "#706858" }}>
            {video.category !== "general" ? WEBINAR_CATEGORIES.find(c => c.value === video.category)?.label || video.category : "Replay"}
          </span>
          {video.published_at && (
            <span className="text-xs" style={{ color: "#706858" }}>
              {new Date(video.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
        <h3 className="mkrc-display text-lg mb-2 flex-grow line-clamp-2">{video.title}</h3>
        {video.description && <p className="text-sm mb-4 line-clamp-2" style={{ color: "#A09888" }}>{video.description}</p>}
        <div className="flex items-center justify-end mt-auto pt-4" style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }}>
          <button className="mkrc-btn-secondary" style={{ padding: "8px 20px", fontSize: "0.75rem" }}>Watch Replay</button>
        </div>
      </div>
    </ScrollReveal>
  );
}

// ── Topic Section Component ──
function TopicSection({ category, videos, onVideoClick }: { category: string; videos: WebinarVideo[]; onVideoClick: (v: WebinarVideo) => void }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[category];
  const catLabel = WEBINAR_CATEGORIES.find(c => c.value === category)?.label || category;
  const shown = expanded ? videos : videos.slice(0, INITIAL_SHOW);
  const hasMore = videos.length > INITIAL_SHOW;

  return (
    <div className="mb-16">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{meta?.emoji}</span>
          <h3 className="mkrc-display text-2xl md:text-3xl">{catLabel}</h3>
          <span className="mkrc-label text-xs px-2 py-0.5 rounded-full" style={{ fontSize: "0.6rem", border: "1px solid rgba(201,168,76,0.2)", color: "#706858" }}>
            {videos.length} {videos.length === 1 ? "session" : "sessions"}
          </span>
        </div>
        {meta?.description && (
          <p className="text-sm mb-6" style={{ color: "#706858", maxWidth: 600 }}>{meta.description}</p>
        )}
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map((video, i) => (
          <VideoCard key={video.id} video={video} onClick={() => onVideoClick(video)} index={i} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="mkrc-btn-secondary"
            style={{ padding: "10px 28px", fontSize: "0.8rem" }}
          >
            {expanded ? "Show Less" : `Show All ${videos.length} Sessions`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Webinars() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [subscribed, setSubscribed] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WebinarVideo | null>(null);
  const { toast } = useToast();
  const { data: dbVideos = [], isLoading: dbLoading } = useWebinarVideos();

  useEffect(() => {
    document.title = "Free Wellness Webinars | Mount Kailash Rejuvenation Centre";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Join free live webinars on herbal medicine, natural health & holistic wellness with Honorable Priest Kailash. Expert-led sessions on immunity, fertility, detox & more.");
  }, []);

  const useDbData = dbVideos.length > 0;

  // Group videos by category
  const videosByCategory = new Map<string, WebinarVideo[]>();
  for (const video of dbVideos) {
    const cat = video.category || "general";
    if (!videosByCategory.has(cat)) videosByCategory.set(cat, []);
    videosByCategory.get(cat)!.push(video);
  }

  // For single-category drill-down
  const filteredDbVideos = activeFilter === "new"
    ? dbVideos.filter((v) => isNew(v.published_at))
    : dbVideos.filter((v) => v.category === activeFilter);

  // Hardcoded fallback
  const filteredHardcoded = activeFilter === "all" ? HARDCODED_WEBINARS : HARDCODED_WEBINARS.filter((w) => w.category === activeFilter);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  const isSectionalized = activeFilter === "all";
  const newCount = useDbData ? dbVideos.filter((v) => isNew(v.published_at)).length : 0;

  return (
    <div className="bg-[#0D0D0D] text-[#F5F0E8] min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ===== 1. HERO ===== */}
      <section className="flex items-center justify-center text-center" style={{ minHeight: "90vh", padding: "120px 24px 80px" }}>
        <ScrollReveal>
          <span className="mkrc-label inline-block mb-6 px-4 py-2 rounded-full text-xs" style={{ border: "1px solid #3A7D53", color: "#3A7D53" }}>
            Free Wellness Education
          </span>
          <h1 className="mkrc-display mb-6" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.1, maxWidth: 800, margin: "0 auto" }}>
            Your Healing Journey Starts With <em>Knowledge.</em>
          </h1>
          <p className="mb-8 max-w-2xl mx-auto" style={{ color: "#A09888", fontSize: "1.1rem" }}>
            Free expert-led webinars on herbal medicine, nutrition, and holistic wellness — with Honorable Priest Kailash and the MKRC wellness team.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <a href="#featured" className="mkrc-btn-green">Browse Upcoming Webinars</a>
            <a href="#archive" className="mkrc-btn-secondary">Watch Past Sessions</a>
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold"><CounterAnimation target={20} suffix="" /></div>
              <p className="text-xs mt-1" style={{ color: "#A09888" }}>Years of Expertise</p>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: "#C9A84C" }}>100%</div>
              <p className="text-xs mt-1" style={{ color: "#A09888" }}>Always Free</p>
            </div>
            <div>
              <div className="text-3xl font-bold"><CounterAnimation target={1000} prefix="" suffix="+" /></div>
              <p className="text-xs mt-1" style={{ color: "#A09888" }}>Attendees Worldwide</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== 2. FEATURED ===== */}
      <section id="featured" style={{ backgroundColor: "#141410", padding: "100px 0" }}>
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" style={{ maxWidth: 1200, padding: "0 24px" }}>
          <ScrollReveal>
            <div className="relative rounded-xl overflow-hidden">
              <img src={webinarImg} alt="Reproductive Wellness Webinar with Honorable Priest Kailash" className="w-full h-auto object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="mkrc-label text-xs px-3 py-1 rounded-full flex items-center gap-1.5" style={{ backgroundColor: "rgba(220,50,50,0.9)", color: "#fff", fontSize: "0.65rem" }}>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Upcoming Live
                </span>
                <span className="mkrc-label text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#3A7D53", color: "#fff", fontSize: "0.65rem" }}>Free</span>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <SectionLabel text="Next Live Session" />
            <p className="text-sm mb-2" style={{ color: "#706858" }}>Date TBA · ~90 min · Via Zoom</p>
            <h2 className="mkrc-display text-2xl md:text-3xl mb-4">
              Reproductive Wellness: Nature's Approach to Fertility, Hormonal Balance & Vitality
            </h2>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: "#A09888" }}>
              Your reproductive health is the foundation of your overall wellbeing. In this free live session, Honorable Priest Kailash reveals the herbal protocols and lifestyle shifts that have helped hundreds of men and women across the Caribbean restore hormonal balance, boost fertility naturally, and reclaim their vitality.
            </p>
            <ul className="mb-8 flex flex-col gap-2">
              {["The root causes of hormonal imbalance and how nature addresses them", "Caribbean herbs that support fertility, menstrual health, and reproductive function", "Daily rituals to nurture your reproductive system naturally", "Live Q&A with Honorable Priest Kailash"].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "#A09888" }}>
                  <span style={{ color: "#3A7D53" }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <a href="https://us06web.zoom.us/j/83340011876?pwd=vMrImiKGYGWbGbaioYt6RTEw2sbo0A.1" target="_blank" rel="noopener noreferrer" className="mkrc-btn-green">Register Free on Zoom</a>
              <a href="#signup" className="mkrc-btn-secondary">Get Reminded</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 3. ARCHIVE ===== */}
      <section id="archive" className="max-w-[1200px] mx-auto py-24 px-6">
        <ScrollReveal className="text-center mb-10">
          <SectionLabel text="On Demand" showLine={false} />
          <h2 className="mkrc-display text-3xl md:text-4xl mb-4">Past Sessions & Replays</h2>
          <p style={{ color: "#A09888" }}>Missed a live session? Catch up on any of our previous webinars at your own pace.</p>
        </ScrollReveal>

        {/* Category filter pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {WEBINAR_CATEGORIES.map((cat) => {
            const active = cat.value === activeFilter;
            const badgeCount = cat.value === "new" && useDbData ? newCount : null;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveFilter(cat.value)}
                className="mkrc-label text-xs px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5"
                style={{
                  fontSize: "0.7rem",
                  backgroundColor: active ? "#C9A84C" : "transparent",
                  color: active ? "#0D0D0D" : "#A09888",
                  border: active ? "1px solid #C9A84C" : "1px solid rgba(201,168,76,0.25)",
                  cursor: "pointer",
                }}
              >
                {cat.label}
                {badgeCount !== null && badgeCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: active ? "#0D0D0D" : "#C9A84C", color: active ? "#C9A84C" : "#0D0D0D", width: 18, height: 18, fontSize: "0.55rem" }}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {useDbData ? (
          isSectionalized ? (
            /* ── Sectionalized "All" view ── */
            <>
              {SECTION_ORDER.map((cat) => {
                const videos = videosByCategory.get(cat);
                if (!videos || videos.length === 0) return null;
                return <TopicSection key={cat} category={cat} videos={videos} onVideoClick={setSelectedVideo} />;
              })}
            </>
          ) : (
            /* ── Flat grid for single category / "new" ── */
            <>
              {filteredDbVideos.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg" style={{ color: "#706858" }}>No webinars in this category yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDbVideos.map((video, i) => (
                    <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} index={i} />
                  ))}
                </div>
              )}
            </>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeFilter === "all" || activeFilter === "new" ? HARDCODED_WEBINARS : filteredHardcoded).map((w, i) => (
              <ScrollReveal key={w.title} delay={i * 80}>
                <div className="mkrc-card h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="mkrc-label text-xs px-2 py-1 rounded" style={{ fontSize: "0.6rem", border: "1px solid rgba(201,168,76,0.12)", color: "#706858" }}>Replay</span>
                    <span className="mkrc-label text-xs" style={{ fontSize: "0.6rem", color: "#C9A84C" }}>{WEBINAR_CATEGORIES.find((c) => c.value === w.category)?.label || w.category}</span>
                  </div>
                  <span className="text-3xl mb-3">{w.icon}</span>
                  <h3 className="mkrc-display text-lg mb-2 flex-grow">{w.title}</h3>
                  <p className="text-sm mb-4" style={{ color: "#A09888" }}>{w.desc}</p>
                  <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }}>
                    <span className="text-xs" style={{ color: "#706858" }}>{w.duration}</span>
                    <button className="mkrc-btn-secondary" style={{ padding: "8px 20px", fontSize: "0.75rem" }}>Watch Replay</button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* ===== 4. WHY ATTEND ===== */}
      <section style={{ backgroundColor: "#141410", padding: "100px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: "0 24px" }}>
          <ScrollReveal className="text-center mb-14">
            <SectionLabel text="Why Attend" showLine={false} />
            <h2 className="mkrc-display text-3xl md:text-4xl">Wellness Education, Without the Price Tag.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CARDS.map((c, i) => (
              <ScrollReveal key={c.title} delay={i * 100}>
                <div className="mkrc-card text-center h-full">
                  <span className="text-3xl mb-3 block">{c.icon}</span>
                  <h3 className="mkrc-display text-lg mb-2">{c.title}</h3>
                  <p className="text-sm" style={{ color: "#A09888" }}>{c.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. HOST ===== */}
      <section id="host" className="max-w-[1200px] mx-auto py-24 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#242420", minHeight: 400, border: "1px solid rgba(201,168,76,0.12)" }}>
              <p className="mkrc-label text-sm" style={{ color: "#706858" }}>Host Photo</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <SectionLabel text="Your Host" />
            <h2 className="mkrc-display text-3xl mb-1">Honorable Priest Kailash</h2>
            <p className="mb-6 text-sm" style={{ color: "#706858" }}>Founder, Mount Kailash Rejuvenation Centre</p>
            <p className="leading-relaxed mb-6" style={{ color: "#A09888" }}>
              For over two decades, Honorable Priest Kailash has dedicated his life to the study and practice of herbal medicine. From the mountains of Saint Lucia, he has guided thousands on their journey to natural health through MKRC's products, retreats, courses, and consultations. His webinars bring that same depth of knowledge directly to your screen — wherever you are in the world. No jargon. No gatekeeping. Just the wisdom of nature, shared freely.
            </p>
            <div className="flex flex-wrap gap-3">
              {HOST_CREDS.map((c) => (
                <span key={c} className="mkrc-label text-xs px-3 py-1.5 rounded-full" style={{ fontSize: "0.65rem", border: "1px solid rgba(201,168,76,0.12)", color: "#706858" }}>{c}</span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 6. SIGNUP ===== */}
      <section id="signup" style={{ backgroundColor: "#141410", padding: "100px 0" }}>
        <div className="mx-auto text-center" style={{ maxWidth: 560, padding: "0 24px" }}>
          <ScrollReveal>
            <SectionLabel text="Stay Connected" showLine={false} />
            <h2 className="mkrc-display text-3xl mb-4">Never Miss a Webinar</h2>
            <p className="mb-8" style={{ color: "#A09888" }}>
              Get notified when new webinars are announced. Plus, receive exclusive herbal wellness tips delivered to your inbox.
            </p>
            {subscribed ? (
              <div className="mkrc-card text-center py-8">
                <span className="text-4xl mb-3 block">✅</span>
                <p className="mkrc-display text-xl">Subscribed!</p>
                <p className="text-sm mt-2" style={{ color: "#A09888" }}>We'll keep you in the loop.</p>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <input type="text" placeholder="Your Name" required className="rounded-lg px-4 py-3 text-sm outline-none" style={{ backgroundColor: "#1A1A16", border: "1px solid rgba(201,168,76,0.12)", color: "#F5F0E8", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                <input type="email" placeholder="Your Email" required className="rounded-lg px-4 py-3 text-sm outline-none" style={{ backgroundColor: "#1A1A16", border: "1px solid rgba(201,168,76,0.12)", color: "#F5F0E8", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                <button type="submit" className="mkrc-btn-primary w-full">Subscribe</button>
                <p className="text-xs" style={{ color: "#706858" }}>We respect your inbox. Unsubscribe anytime. No spam, ever.</p>
              </form>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 7. FINAL CTA ===== */}
      <section className="max-w-[1200px] mx-auto py-24 px-6">
        <ScrollReveal className="text-center mb-14">
          <SectionLabel text="Continue Your Journey" showLine={false} />
          <h2 className="mkrc-display text-3xl md:text-4xl mb-4">No Upcoming Webinar? Keep Exploring.</h2>
          <p style={{ color: "#A09888" }}>Your path to natural health doesn't stop here. Dive deeper with our courses, retreats, and one-on-one consultations.</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {JOURNEY_CARDS.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 100}>
              <Link to={c.href} className="mkrc-card block text-center no-underline" style={{ textDecoration: "none", color: "inherit" }}>
                <span className="text-3xl mb-3 block">{c.icon}</span>
                <h3 className="mkrc-display text-lg mb-1">{c.title}</h3>
                <p className="text-sm" style={{ color: "#A09888" }}>{c.desc}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Video playback modal */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden" style={{ backgroundColor: "#1A1A16", border: "1px solid rgba(201,168,76,0.2)" }}>
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="mkrc-display text-lg" style={{ color: "#F5F0E8" }}>{selectedVideo?.title || "Webinar Replay"}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedVideo && (
              <iframe
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
