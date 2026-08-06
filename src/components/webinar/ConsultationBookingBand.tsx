import { Calendar, Clock, Video, Sparkles } from "lucide-react";
import { ConsultationBookingForm } from "@/components/consultation/ConsultationBookingForm";
import { useConsultationSettings } from "@/hooks/use-consultation-settings";

export function ConsultationBookingBand() {
  const { data: settings } = useConsultationSettings();

  return (
    <section
      className="py-16 sm:py-20 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(15,40,30,0.98) 0%, rgba(10,28,22,0.98) 100%)",
        borderTop: "1px solid rgba(201,168,76,0.15)",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
      }}
    >
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{
              background: "rgba(201,168,76,0.12)",
              color: "#C9A227",
              border: "1px solid rgba(201,168,76,0.25)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Private Session
          </div>

          <h2
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              color: "#F5F1E8",
              marginBottom: "12px",
            }}
          >
            Book a 1-on-1 Consultation
          </h2>

          <p
            className="max-w-xl mx-auto"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: "16px",
              color: "rgba(245,241,232,0.75)",
              lineHeight: 1.7,
            }}
          >
            Move from education to action. Work directly with Priest Kailash to build a
            personalized protocol rooted in your history, symptoms, and goals.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 text-sm" style={{ color: "rgba(245,241,232,0.7)" }}>
          <span className="inline-flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "#C9A227" }} />
            {settings?.duration_minutes || 30} minutes
          </span>
          <span className="inline-flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: "#C9A227" }} />
            {settings?.notice_hours || 24}-hour notice
          </span>
          <span className="inline-flex items-center gap-2">
            <Video className="w-4 h-4" style={{ color: "#C9A227" }} />
            Zoom session
          </span>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(245,241,232,0.03)",
            border: "1px solid rgba(201,168,76,0.15)",
          }}
        >
          <ConsultationBookingForm settings={settings ?? null} compact />
        </div>
      </div>

      {/* Decorative watermark */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, #C9A227 0%, transparent 45%), radial-gradient(circle at 70% 50%, #C9A227 0%, transparent 45%)`,
        }}
      />
    </section>
  );
}
