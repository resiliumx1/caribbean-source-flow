import { Star, Package, Shield, Headphones } from "lucide-react";

const testimonials = [
  {
    quote: "Finally, a Caribbean supplier with proper COAs and consistent quality. Every batch matches the last.",
    author: "Sarah M.",
    role: "Sourcing Director",
    company: "US Supplement Brand",
    location: "Miami, USA",
  },
  {
    quote: "The Miami warehousing changed everything. We went from 6-week lead times to 3-day deliveries.",
    author: "James T.",
    role: "Operations Manager",
    company: "UK Wellness Retailer",
    location: "London, UK",
  },
  {
    quote: "Their documentation package is impeccable. Customs clearance has never been smoother.",
    author: "Dr. Anita R.",
    role: "Founder",
    company: "Herbal Practice",
    location: "Toronto, Canada",
  },
];

const riskReversals = [
  { icon: Package, title: "100g Sample Program", description: "Full documentation included. Test before committing to volume." },
  { icon: Shield, title: "St. Lucian Origin Guarantee", description: "Every product traceable to our certified farms." },
  { icon: Headphones, title: "English-Speaking Support", description: "Miami-based team responds within 4 hours." },
];

export const SocialProof = () => {
  return (
    <section className="py-24 md:py-28" style={{ background: "var(--site-bg-primary)", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(2rem, 4vw, 44px)", color: "var(--site-text-primary)" }}>
            Trusted by Wholesale Buyers Across 3 Continents
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="rounded-2xl p-10 transition-all duration-300"
              style={{ background: "var(--site-bg-card)", border: "1px solid var(--site-border)", boxShadow: "var(--site-shadow-card)" }}
            >
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "20px", color: "var(--site-text-primary)", marginBottom: "2px" }}>
                {testimonial.author}
              </p>
              <p style={{ fontWeight: 400, fontSize: "13px", color: "#c9a84c", marginBottom: "16px" }}>
                {testimonial.role}, {testimonial.company}
              </p>
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#c9a84c]" style={{ color: "#c9a84c" }} />
                ))}
              </div>
              
              <blockquote style={{ fontWeight: 300, fontStyle: "italic", fontSize: "15px", color: "var(--site-text-primary)", lineHeight: 1.8, marginBottom: "20px" }}>
                "{testimonial.quote}"
              </blockquote>
              
              <span className="inline-block px-3 py-1 rounded-full" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", fontSize: "12px", color: "#c9a84c", fontWeight: 300 }}>
                {testimonial.location}
              </span>
            </div>
          ))}
        </div>
        
        <div className="text-center mb-12">
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 48px)", color: "var(--site-text-primary)" }}>
            Zero-Risk Partnership
          </h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {riskReversals.map((item, index) => (
            <div 
              key={index} 
              className="rounded-2xl p-10 transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                background: "var(--site-bg-card)", 
                borderTop: "3px solid #c9a84c",
                borderLeft: "1px solid var(--site-border)",
                borderRight: "1px solid var(--site-border)",
                borderBottom: "1px solid var(--site-border)",
                boxShadow: "var(--site-shadow-card)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderTopColor = "#dfc06a")}
              onMouseLeave={(e) => (e.currentTarget.style.borderTopColor = "#c9a84c")}
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(201,168,76,0.08)" }}>
                <item.icon className="w-12 h-12" style={{ color: "#c9a84c" }} />
              </div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "22px", color: "var(--site-text-primary)", marginBottom: "8px" }}>
                {item.title}
              </h4>
              <p style={{ fontWeight: 300, fontSize: "15px", color: "var(--site-text-muted)", lineHeight: 1.7 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
