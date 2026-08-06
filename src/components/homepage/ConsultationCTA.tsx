import { Leaf } from "lucide-react";
import priestPhoto from "@/assets/priest-kailash-host.webp";
import { VineVariationA } from "@/components/decorative/BotanicalVine";
import { ConsultationBookingForm } from "@/components/consultation/ConsultationBookingForm";
import { useConsultationSettings } from "@/hooks/use-consultation-settings";

export function ConsultationCTA() {
  const { data: settings } = useConsultationSettings();

  return (
    <section
      className="py-20 px-4 relative"
      style={{ background: "var(--site-bg-primary, #F5F1E8)", overflow: "visible" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          {/* Portrait */}
          <div className="mb-8 flex justify-center">
            <img
              src={priestPhoto}
              alt="Priest Kailash Leonce, Master Herbalist"
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
              fontFamily: "'DM Sans', sans-serif",
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
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: "18px",
              color: "var(--site-gold, #9A6B3F)",
              marginBottom: "24px",
            }}
          >
            With Priest Kailash Leonce
          </h3>

          {/* Body */}
          <p
            className="px-4 sm:px-6 max-w-2xl mx-auto"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: "16px",
              color: "var(--site-text-secondary, #4A4A4A)",
              lineHeight: 1.7,
              marginBottom: "24px",
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
                  fontFamily: "'DM Sans', sans-serif",
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
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: "12px",
                color: "var(--site-text-secondary, #4A4A4A)",
              }}
            >
              Each protocol requires 3-4 hours of dedicated preparation
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <div
          className="bg-white/60 backdrop-blur-sm rounded-2xl border p-6 sm:p-8 shadow-sm"
          style={{ borderColor: "rgba(188,138,95,0.18)" }}
        >
          <ConsultationBookingForm settings={settings ?? null} />
        </div>
      </div>
      <VineVariationA />
    </section>
  );
}
