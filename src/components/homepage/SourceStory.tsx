import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import herbProcessing from "@/assets/herb-processing.jpg";

export function SourceStory() {
  return (
    <section style={{ background: "var(--site-bg-primary)" }}>
      <div className="container mx-auto max-w-6xl px-4 py-24 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Image with overlapping stat */}
          <div className="relative">
            <div className="rounded-lg overflow-hidden">
              <img
                src={herbProcessing}
                alt="Harvesting medicinal herbs on the volcanic ridge at dawn"
                className="w-full h-auto object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
            {/* Overlapping stat card */}
            <div
              className="absolute -bottom-6 -right-4 md:right-8 rounded-lg px-6 py-4 text-center"
              style={{
                background: "var(--site-bg-card)",
                border: "1px solid var(--site-gold)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                minWidth: "180px",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  fontSize: "36px",
                  color: "var(--site-gold)",
                  lineHeight: 1,
                }}
              >
                40%
              </div>
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 400,
                  fontSize: "13px",
                  color: "var(--site-text-secondary)",
                  marginTop: "4px",
                }}
              >
                Higher Sulfur Content
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div>
            <span
              className="inline-block mb-4"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--site-gold)",
              }}
            >
              THE PROTOCOL
            </span>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 3.5vw, 40px)",
                color: "var(--site-text-primary)",
                marginBottom: "24px",
                lineHeight: 1.2,
              }}
            >
              From Volcanic Soil to Cellular Terrain
            </h2>

            <div
              className="space-y-4 mb-10"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: "16px",
                color: "var(--site-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              <p>
                Sulfur-rich ash increases alkaloid potency. Our wildcrafters
                harvest at dawn when concentrations peak. Each batch is processed
                by hand in our St. Lucia facility—delivered to practitioners and
                patients worldwide.
              </p>
            </div>

            {/* Quote */}
            <div
              className="rounded-lg p-6 mb-8"
              style={{
                background: "var(--site-bg-secondary)",
                borderLeft: "3px solid var(--site-gold)",
              }}
            >
              <blockquote
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: "italic",
                  fontSize: "20px",
                  color: "var(--site-text-primary)",
                  lineHeight: 1.5,
                  marginBottom: "12px",
                }}
              >
                "Western medicine treats symptoms. We address terrain—the
                cellular environment where disease takes root."
              </blockquote>
              <cite
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  color: "var(--site-gold)",
                  fontStyle: "normal",
                }}
              >
                — Priest Kailash Leyonce
              </cite>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md font-medium transition-all hover:brightness-110"
              style={{
                background: "var(--site-gold)",
                color: "#0F281E",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "15px",
              }}
            >
              Explore Our Formulations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
