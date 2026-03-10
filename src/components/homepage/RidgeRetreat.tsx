import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import retreatHero from "@/assets/retreat-hero-yoga.webp";

const features = [
  "Daily one-on-one consultations",
  "Harvest-to-bottle workshops",
  "90-day post-retreat protocol included",
  "Next cohort: March 2025",
];

export function RidgeRetreat() {
  return (
    <section style={{ background: "var(--site-bg-primary)" }} className="py-24 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Image */}
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={retreatHero}
              alt="Immersive retreat in the volcanic rainforest of Saint Lucia"
              className="w-full h-auto object-cover"
              style={{ minHeight: "500px" }}
              loading="lazy"
              width={800}
              height={600}
            />
            {/* Badge */}
            <div
              className="absolute top-4 left-4 px-4 py-2 rounded-md text-sm font-semibold"
              style={{
                background: "var(--site-gold)",
                color: "#0F281E",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              12 Guests Maximum
            </div>
          </div>

          {/* Right — Content */}
          <div>
            <span
              className="inline-block mb-3"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--site-gold)",
              }}
            >
              IMMERSIVE
            </span>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 3.5vw, 40px)",
                color: "var(--site-text-primary)",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              The Ridge Retreat
            </h2>
            <h3
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 400,
                fontSize: "18px",
                color: "var(--site-text-secondary)",
                marginBottom: "24px",
              }}
            >
              7-Day Clinical Immersion in St. Lucia
            </h3>

            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: "16px",
                color: "var(--site-text-secondary)",
                lineHeight: 1.7,
                marginBottom: "24px",
              }}
            >
              Admittance by application. Work directly with Priest Kailash in
              the volcanic rainforest. Develop your personalized protocol
              through daily clinical sessions, harvest walks, and formulation
              workshops.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 400,
                    fontSize: "15px",
                    color: "var(--site-text-primary)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "var(--site-gold)" }}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <p
              className="mb-6"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "var(--site-gold)",
              }}
            >
              Current waitlist: 3 months
            </p>

            <Link
              to="/retreats"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md font-medium transition-all hover:brightness-110"
              style={{
                background: "var(--site-gold)",
                color: "#0F281E",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "15px",
              }}
            >
              Request Application <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
