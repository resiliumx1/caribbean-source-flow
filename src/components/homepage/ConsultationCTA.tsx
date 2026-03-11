import { Link } from "react-router-dom";
import { ArrowRight, Leaf } from "lucide-react";
import priestPhoto from "@/assets/priest-kailash-host.webp";

export function ConsultationCTA() {
  return (
    <section
      className="py-20 px-4"
      style={{ background: "var(--site-bg-primary, #F5F1E8)" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Portrait */}
        <div className="mb-8 flex justify-center">
          <img
            src={priestPhoto}
            alt="Priest Kailash Leyonce, Master Herbalist"
            className="rounded-full object-cover transition-transform duration-500 hover:scale-105"
            style={{
              width: "220px",
              height: "220px",
              border: "3px solid var(--site-gold, #BC8A5F)",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
            }}
            loading="lazy"
            width={220}
            height={220}
          />
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
            color: "var(--site-text-primary, #0F281E)",
            marginBottom: "12px",
          }}
        >
          Private Healing Consultation
        </h2>

        <h3
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 400,
            fontSize: "18px",
            color: "var(--site-gold, #9A6B3F)",
            marginBottom: "24px",
          }}
        >
          With Priest Kailash Leyonce
        </h3>

        {/* Body */}
        <p
          className="px-4 sm:px-6"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            fontSize: "16px",
            color: "var(--site-text-secondary, #4A4A4A)",
            lineHeight: 1.7,
            marginBottom: "32px",
          }}
        >
          For those ready to move beyond symptom management into true cellular
          healing. Each session addresses the root patterns beneath your
          condition, creating a personalized protocol that aligns with your
          body's innate intelligence.
        </p>

        {/* Scarcity Badge */}
        <div
          className="inline-flex flex-col items-center gap-1 mb-8 px-5 py-3 rounded-full"
          style={{
            background: "rgba(188,138,95,0.08)",
            border: "1px solid rgba(188,138,95,0.2)",
          }}
        >
          <span className="flex items-center gap-2">
            <Leaf
              className="w-4 h-4 animate-pulse"
              style={{ color: "var(--site-gold, #9A6B3F)" }}
            />
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "var(--site-text-primary, #0F281E)",
              }}
            >
              Limited to 20 sessions monthly
            </span>
          </span>
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: "12px",
              color: "var(--site-text-secondary, #4A4A4A)",
            }}
          >
            Each protocol requires 3-4 hours of dedicated preparation
          </span>
        </div>

        {/* Primary CTA */}
        <div className="mb-4">
          <Link
            to="/retreats"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:brightness-110 w-full sm:w-auto justify-center"
            style={{
              background: "var(--site-gold, #BC8A5F)",
              color: "#0F281E",
              fontFamily: "'Jost', sans-serif",
              fontSize: "16px",
            }}
          >
            Begin Your Healing Journey
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Secondary Link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm transition-colors hover:underline underline-offset-4"
          style={{
            color: "var(--site-gold, #9A6B3F)",
            fontFamily: "'Jost', sans-serif",
            fontWeight: 400,
          }}
        >
          Not ready? Explore the Apothecary →
        </Link>
      </div>
    </section>
  );
}
