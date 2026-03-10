import { useRef, useEffect } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { WebinarVideo } from "@/hooks/use-webinar-videos";

const TESTIMONIALS = [
  {
    initials: "A.L.",
    quote: "The Food of 7 Fertility session gave me the courage to stop my hormone therapy. Three months later, I'm pregnant. Best decision I ever made.",
    name: "A.L.",
    location: "Atlanta, GA",
    sessionTitle: "Food of 7: Fertility Protocol",
    flag: "🇺🇸",
  },
  {
    initials: "D.R.",
    quote: "I came for the detox webinar, stayed for the community. Priest Kailash doesn't just teach — he makes you believe your body already knows how to heal.",
    name: "D.R.",
    location: "Toronto, Canada",
    sessionTitle: "Full Body Detox Protocol",
    flag: "🇨🇦",
  },
  {
    initials: "N.B.",
    quote: "My husband watched the prostate health session and started The Answer the same week. His PSA levels dropped at his next checkup. We're believers.",
    name: "N.B.",
    location: "Brixton, London",
    sessionTitle: "Men's Prostate Wellness",
    flag: "🇬🇧",
  },
];

interface Props {
  onVideoClick: (v: WebinarVideo) => void;
}

export default function WebinarCommunity({ onVideoClick }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add("visible"); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="webinar-reveal" style={{ backgroundColor: "#090909" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="font-jost text-xs tracking-[0.2em] uppercase mb-3 block" style={{ color: "#c9a84c" }}>
            Community Wisdom
          </span>
          <h2
            className="font-cormorant font-bold italic mb-3"
            style={{ color: "#f2ead8", fontSize: "clamp(1.6rem, 3vw, 2.5rem)" }}
          >
            Stories From the Sessions
          </h2>
          <p className="font-jost font-light max-w-lg mx-auto" style={{ color: "#8a8070" }}>
            Real transformations from real attendees. These webinars change lives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: "#111111",
                border: "1px solid rgba(201,168,76,0.15)",
                borderTop: "3px solid #c9a84c",
              }}
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.3)" }}
                >
                  {t.flag}
                </div>
                <div>
                  <p className="font-jost font-medium text-sm" style={{ color: "#f2ead8" }}>{t.name}</p>
                  <p className="font-jost text-xs flex items-center gap-1" style={{ color: "#c9a84c" }}>
                    <MapPin size={10} /> {t.location}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <p className="font-jost font-light text-sm leading-relaxed mb-4" style={{ color: "rgba(242,234,216,0.8)" }}>
                "{t.quote}"
              </p>

              {/* Session link */}
              <a
                href="#archive"
                className="font-jost text-xs flex items-center gap-1 transition-colors hover:brightness-125"
                style={{ color: "#c9a84c" }}
              >
                Watch the session that helped {t.name} <ArrowRight size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
