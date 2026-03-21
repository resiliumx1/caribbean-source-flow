import { Link } from "react-router-dom";
import { ArrowRight, FileCheck, TrendingDown, Tag } from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "COA Documentation",
    description: "Full certificates of analysis for every batch",
  },
  {
    icon: TrendingDown,
    title: "Volume Pricing",
    description: "Tiered pricing from 50 units. Miami warehouse for 3-day US delivery.",
  },
  {
    icon: Tag,
    title: "Private Labeling",
    description: "Your brand, our formulations. White-label ready.",
  },
];

export function WholesaleAuthority() {
  return (
    <section
      className="relative py-24 md:py-28 overflow-hidden"
      style={{ background: "#0F281E" }}
    >
      {/* Background watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(200px, 30vw, 400px)",
          color: "rgba(245,241,232,0.03)",
          lineHeight: 1,
        }}
      >
        500+
      </div>

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="text-center mb-16">
          <h2
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 44px)",
              color: "#F5F1E8",
              marginBottom: "16px",
            }}
          >
            For Practitioners & Retailers
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: "18px",
              color: "#A8B5A0",
            }}
          >
            Clinical documentation. Volume pricing. Private labeling.
          </p>
        </div>

        {/* 3-Column Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="text-center p-8 rounded-lg"
                style={{
                  background: "#1B4332",
                  border: "1px solid #2D6A4F",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(212,163,115,0.12)" }}
                >
                  <Icon className="w-6 h-6" style={{ color: "#D4A373" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#F5F1E8",
                    marginBottom: "8px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "#A8B5A0",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Social Proof */}
        <div
          className="rounded-lg p-8 mb-12 text-center max-w-3xl mx-auto"
          style={{ background: "rgba(245,241,232,0.04)", border: "1px solid #2D6A4F" }}
        >
          <blockquote
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "18px",
              color: "#F5F1E8",
              lineHeight: 1.6,
              marginBottom: "16px",
            }}
          >
            "The consistency of potency is what my patients notice within two
            weeks. I've been sourcing from Mount Kailash for 8 years and the
            quality has never wavered."
          </blockquote>
          <cite
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              color: "#D4A373",
              fontStyle: "normal",
            }}
          >
            — Dr. Mariana Vega, Naturopathic Physician
          </cite>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/wholesale"
            className="inline-flex items-center gap-2 px-12 py-5 rounded-md font-medium transition-all hover:brightness-110"
            style={{
              background: "#D4A373",
              color: "#0F281E",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            Access Wholesale Portal <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            className="inline-flex items-center gap-2 px-8 py-5 rounded-md font-medium transition-all hover:brightness-110"
            style={{
              background: "transparent",
              border: "1px solid #2D6A4F",
              color: "#A8B5A0",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: "14px",
            }}
          >
            Download Price Sheet (PDF)
          </button>
        </div>
      </div>
    </section>
  );
}
