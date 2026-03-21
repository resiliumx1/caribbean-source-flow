import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import retreatHero from "@/assets/retreat-hero-yoga.webp";

const features = [
"Daily one-on-one consultations",
"Complete daily workshops",
"90-day post-retreat protocol included",
"All inclusive amenities"];


export function RidgeRetreat() {
  return (
    <section style={{ background: "#0F281E" }} className="py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — Image */}
          <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/5" }}>
            <img
              src={retreatHero}
              alt="Clinical immersion group at The Ridge, St. Lucia"
              className="w-full h-full object-cover"
              loading="lazy"
              width={800}
              height={1000} />
            
            {/* Badge */}
            <div
              className="absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold"
              style={{
                background: "#BC8A5F",
                color: "#0F281E",
                fontFamily: "'DM Sans', sans-serif"
              }}>
              
              25 Guests Maximum
            </div>
          </div>

          {/* Right — Content */}
          <div>
            <span
              className="inline-block mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#BC8A5F"
              }}>
              
              IMMERSIVE
            </span>

            <h2
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 48px)",
                color: "#F5F1E8",
                marginBottom: "12px",
                lineHeight: 1.15
              }}>The Holistic Retreat


            </h2>
            <h3
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: "20px",
                color: "rgba(245,241,232,0.9)",
                marginBottom: "24px"
              }}>
              
              7-Day Clinical Immersion in St. Lucia
            </h3>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: "16px",
                color: "rgba(245,241,232,0.8)",
                lineHeight: 1.7,
                marginBottom: "28px"
              }}>
              
              Admittance by application. Work directly with Priest Kailash in
              the volcanic rainforest. Develop your personalized protocol
              through daily clinical sessions, harvest walks, and formulation
              workshops.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((f) =>
              <li
                key={f}
                className="flex items-center gap-3"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: "15px",
                  color: "#F5F1E8"
                }}>
                
                  <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#BC8A5F" }} />
                
                  {f}
                </li>
              )}
            </ul>

            <p
              className="mb-6"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#BC8A5F"
              }}>
              
              Limited to 25 guests for personalized attention
            </p>

            <Link
              to="/retreats"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all hover:brightness-110 w-full md:w-auto"
              style={{
                background: "#BC8A5F",
                color: "#0F281E",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "15px"
              }}>
              
              Request Application <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Group Retreat CTA */}
            <div
              className="mt-6 pt-6"
              style={{ borderTop: "1px solid rgba(245,241,232,0.2)" }}>
              
              <p
                className="mb-3"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  color: "rgba(245,241,232,0.7)"
                }}>
                
                Bringing a group or organization?
              </p>
              <Link
                to="/retreats#calendar"
                className="group inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-300 w-full md:w-auto hover:text-[#0F281E]"
                style={{
                  background: "transparent",
                  border: "2px solid #BC8A5F",
                  color: "#BC8A5F",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#BC8A5F";
                  e.currentTarget.style.color = "#0F281E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#BC8A5F";
                }}>
                
                Schedule Group Retreat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p
                className="mt-2"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: "12px",
                  color: "rgba(245,241,232,0.5)",
                  fontStyle: "italic"
                }}>
                
                Private bookings for 8–25 guests available year-round
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>);

}