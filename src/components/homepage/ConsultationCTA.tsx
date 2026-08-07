import { Link } from "react-router-dom";
import { Clock, Leaf, MapPin, Video } from "lucide-react";
import priestPhoto from "@/assets/priest-kailash-host.webp";
import { VineVariationA } from "@/components/decorative/BotanicalVine";
import { Button } from "@/components/ui/button";
import { useNextConsultationSlot } from "@/hooks/use-consultations";
import { fullMoment, detectTimezone, moneyUsd } from "@/lib/consultation-utils";

export function ConsultationCTA() {
  const { data } = useNextConsultationSlot();
  const nextSlot = data?.slots?.[0]?.start;
  const priceUsd = data?.service?.price_usd;
  const duration = data?.service?.duration_minutes ?? 60;
  const zone = detectTimezone();

  return (
    <section
      className="py-20 px-4 relative"
      style={{ background: "var(--site-bg-primary, #F5F1E8)", overflow: "visible" }}
    >
      <div className="max-w-5xl mx-auto">
        <div
          className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-center rounded-3xl p-6 sm:p-10"
          style={{
            background: "rgba(255,255,255,0.62)",
            border: "1px solid rgba(188,138,95,0.2)",
            backdropFilter: "blur(6px)",
          }}
        >
          {/* Portrait */}
          <div className="flex justify-center">
            <img
              src={priestPhoto}
              alt="Rt. Hon. Priest Kailash, herbal physician and founder of Mount Kailash Rejuvenation Centre"
              className="rounded-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              style={{
                width: "230px",
                height: "230px",
                border: "3px solid var(--site-gold, #BC8A5F)",
                boxShadow: "0 16px 38px -22px rgba(15,40,30,0.45)",
              }}
              loading="lazy"
              width={230}
              height={230}
            />
          </div>

          {/* Copy */}
          <div className="text-center lg:text-left">
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--site-gold, #9A6B3F)",
                marginBottom: "10px",
              }}
            >
              Private practice
            </p>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
                lineHeight: 1.12,
                color: "var(--site-text-primary, #0F281E)",
              }}
            >
              An hour with Rt. Hon. Priest Kailash
            </h2>

            <p
              className="mt-4 mx-auto lg:mx-0"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: "16px",
                lineHeight: 1.8,
                color: "var(--site-text-secondary, #4A4A4A)",
                maxWidth: "38rem",
              }}
            >
              Four options: a single wellness consultation, a five session package, a follow-on
              session for anyone already holding a package, and a business consultation. All are
              one to one and online, and only times he has open appear in the calendar.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5">
              {[
                { icon: Clock, label: `${duration} minutes, one to one` },
                { icon: Leaf, label: `From ${priceUsd ? moneyUsd(priceUsd) : "300"} USD` },
                { icon: Video, label: "Online" },
                { icon: MapPin, label: "Saint Lucia practice" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "15px",
                    color: "var(--site-text-primary, #0F281E)",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--site-gold, #9A6B3F)" }} />
                  {label}
                </span>
              ))}
            </div>

            {nextSlot && (
              <p
                className="mt-5"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  color: "var(--site-gold, #9A6B3F)",
                }}
              >
                Next opening: {fullMoment(nextSlot, zone)}
              </p>
            )}

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button asChild className="min-h-[48px] px-7">
                <Link to="/consultations#book">Book a consultation</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-[48px] px-7">
                <Link to="/consultations">Times, fees and formats</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <VineVariationA />
    </section>
  );
}
