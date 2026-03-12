import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Finally a Caribbean supplier with proper COAs and consistent quality. Every batch matches the last.",
    author: "Sarah L.",
    role: "Operations Manager",
  },
  {
    quote: "Their documentation package is impeccable. Customs clearance has never been smoother.",
    author: "Dr. Anita R.",
    role: "Naturopathic Practitioner",
  },
  {
    quote: "The Miami warehousing changed everything. We went from 6-week lead times to quick deliveries.",
    author: "James T.",
    role: "Purchasing Director",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 md:py-28" style={{ background: "#0F281E", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p
            className="mb-3"
            style={{ fontSize: "12px", fontWeight: 400, color: "var(--site-gold)", textTransform: "uppercase", letterSpacing: "0.15em" }}
          >
            Partner Testimonials
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 44px)", color: "#F5F1E8" }}>
            Trusted Across 3 Continents
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-8"
              style={{ background: "rgba(27,67,50,0.6)", border: "1px solid rgba(188,138,95,0.2)" }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4" style={{ color: "var(--site-gold)", fill: "var(--site-gold)" }} />
                ))}
              </div>
              <blockquote
                className="mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontStyle: "italic", fontSize: "18px", color: "#F5F1E8", lineHeight: 1.6 }}
              >
                "{t.quote}"
              </blockquote>
              <p style={{ fontWeight: 500, fontSize: "15px", color: "#F5F1E8" }}>{t.author}</p>
              <p style={{ fontWeight: 300, fontSize: "13px", color: "#A8B5A0" }}>{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
