import { Link } from "react-router-dom";
import { Clock, Leaf, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNextConsultationSlot } from "@/hooks/use-consultations";
import { detectTimezone, fullMoment, moneyUsd } from "@/lib/consultation-utils";

/**
 * Webinar-page band inviting viewers into a private consultation.
 * Lives on the permanently dark webinar page, so colours are set locally.
 */
export function ConsultationBookingBand() {
  const { data } = useNextConsultationSlot();
  const nextSlot = data?.slots?.[0]?.start;
  const priceUsd = data?.service?.price_usd;
  const duration = data?.service?.duration_minutes ?? 60;
  const zone = detectTimezone();

  return (
    <section className="py-16 px-4" style={{ background: "linear-gradient(180deg,#0B1F15,#0F281E)" }}>
      <div
        className="max-w-4xl mx-auto rounded-3xl p-7 sm:p-10 text-center"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(188,138,95,0.28)",
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D8B074",
            marginBottom: "10px",
          }}
        >
          Go deeper, one to one
        </p>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            lineHeight: 1.14,
            color: "#F5F1E8",
          }}
        >
          Book a private hour with Rt. Hon. Priest Kailash
        </h2>
        <p
          className="mt-4 mx-auto"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: "16px",
            lineHeight: 1.8,
            color: "rgba(245,241,232,0.78)",
            maxWidth: "36rem",
          }}
        >
          The webinars are the teaching. A consultation is your own protocol, built around your
          history and the pattern beneath your condition.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
          {[
            { icon: Clock, label: `${duration} minutes` },
            { icon: Leaf, label: priceUsd ? `${moneyUsd(priceUsd)} USD` : "USD 300" },
            { icon: Video, label: "Online or in Saint Lucia" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#F5F1E8" }}
            >
              <Icon className="w-4 h-4" style={{ color: "#D8B074" }} />
              {label}
            </span>
          ))}
        </div>

        {nextSlot && (
          <p
            className="mt-5"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#D8B074" }}
          >
            Next opening: {fullMoment(nextSlot, zone)}
          </p>
        )}

        <div className="mt-7">
          <Button
            asChild
            className="min-h-[48px] px-8"
            style={{ background: "#C9A227", color: "#0B1F15" }}
          >
            <Link to="/consultations#book">Reserve your session</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
