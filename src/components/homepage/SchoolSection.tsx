import { ArrowRight, GraduationCap, Award, Users, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import schoolFaculty from "@/assets/school-faculty-ceremony.webp";

const features = [
  { icon: GraduationCap, text: "6 months online + 3 weeks in-person immersion" },
  { icon: Award, text: "Government-recognized certification" },
  { icon: Users, text: "Clinical training & patient management" },
  { icon: CreditCard, text: "50 students per cohort (application required)" },
];

const trustItems = [
  "Next cohort: March 2026",
  "Only 50 spots",
  "Acceptance by application",
];

export function SchoolSection() {
  return (
    <section
      className="py-20 px-4"
      style={{ background: "var(--site-bg-primary, #F5F1E8)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block mb-2"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--site-gold, #9A6B3F)",
            }}
          >
            CERTIFICATION PROGRAM
          </span>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
              color: "var(--site-text-primary, #0F281E)",
              marginBottom: "12px",
            }}
          >
            Mount Kailash School of Herbal Medicine
          </h2>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: "16px",
              color: "var(--site-text-secondary, #4A4A4A)",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            Complete practitioner training from foundation to clinical certification
          </p>
        </div>

        {/* Single Featured Card */}
        <Link
          to="/school/herbal-physician"
          className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          style={{
            background: "var(--site-bg-card, #FFFFFF)",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.12)",
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left — Image (60%) */}
            <div className="md:w-[60%] h-64 md:h-auto">
              <img
                src={schoolFaculty}
                alt="Three herbal medicine practitioners in traditional ceremonial red sashes during certification ceremony"
                className="w-full h-full object-cover"
                loading="lazy"
                width={720}
                height={480}
              />
            </div>

            {/* Right — Content (40%) */}
            <div className="md:w-[40%] p-8 md:p-10 flex flex-col justify-center">
              <span
                className="inline-block self-start px-3 py-1.5 rounded-full mb-4"
                style={{
                  background: "rgba(188,138,95,0.12)",
                  color: "var(--site-gold, #9A6B3F)",
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  letterSpacing: "0.05em",
                }}
              >
                6-Month Program + Immersion
              </span>

              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  fontSize: "clamp(1.5rem, 3vw, 1.75rem)",
                  color: "var(--site-text-primary, #0F281E)",
                  marginBottom: "8px",
                }}
              >
                Herbal Physician Certification
              </h3>


              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f.text} className="flex items-start gap-3">
                    <f.icon
                      className="w-5 h-5 mt-0.5 shrink-0"
                      style={{ color: "var(--site-gold, #9A6B3F)" }}
                    />
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontWeight: 400,
                        fontSize: "15px",
                        color: "var(--site-text-secondary, #4A4A4A)",
                        lineHeight: 1.5,
                      }}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <span
                className="inline-flex items-center gap-2 self-start px-8 py-4 rounded-full font-semibold transition-all duration-300 group-hover:brightness-110"
                style={{
                  background: "var(--site-gold, #BC8A5F)",
                  color: "#0F281E",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "16px",
                }}
              >
                Explore the Full Program
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>

              <p
                className="mt-3"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 300,
                  fontSize: "12px",
                  color: "var(--site-text-secondary, #4A4A4A)",
                  fontStyle: "italic",
                }}
              >
                Applications reviewed on a rolling basis. Next immersion: March 2026.
              </p>
            </div>
          </div>
        </Link>

        {/* Trust Bar */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
          {trustItems.map((item, i) => (
            <div key={item} className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--site-gold, #9A6B3F)" }}
              />
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                  fontSize: "13px",
                  color: "var(--site-text-secondary, #4A4A4A)",
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
