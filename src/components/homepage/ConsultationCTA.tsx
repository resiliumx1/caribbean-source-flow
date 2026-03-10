import { Link } from "react-router-dom";
import { ArrowRight, User } from "lucide-react";

export function ConsultationCTA() {
  return (
    <section
      className="py-24 md:py-28"
      style={{
        background: "var(--site-bg-primary)",
      }}
    >
      <div className="max-w-[700px] mx-auto px-4 text-center">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{
            background: "linear-gradient(135deg, var(--site-gold), var(--site-gold-dark))",
          }}
        >
          <User className="w-9 h-9" style={{ color: "#0F281E" }} />
        </div>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 44px)",
            color: "var(--site-text-primary)",
            marginBottom: "8px",
          }}
        >
          Private Consultation
        </h2>
        <h3
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 400,
            fontSize: "18px",
            color: "var(--site-gold)",
            marginBottom: "24px",
          }}
        >
          With Priest Kailash Leyonce
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
          Bring your labs or your symptoms. Leave with a protocol tailored to
          your cellular terrain. Limited to 20 sessions monthly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <div
            className="px-4 py-2 rounded-md"
            style={{
              background: "var(--site-bg-secondary)",
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              color: "var(--site-text-primary)",
            }}
          >
            From $300 per session
          </div>
          <div
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              color: "var(--site-text-secondary)",
            }}
          >
            Current booking: 8 weeks out
          </div>
        </div>

        <Link
          to="/retreats"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-md font-medium transition-all hover:brightness-110 mb-4"
          style={{
            background: "var(--site-gold)",
            color: "#0F281E",
            fontFamily: "'Jost', sans-serif",
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          Schedule Assessment <ArrowRight className="w-4 h-4" />
        </Link>

        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm"
            style={{
              color: "var(--site-text-secondary)",
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
            }}
          >
            Not ready?{" "}
            <span style={{ color: "var(--site-gold)" }}>
              Explore the Apothecary →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
