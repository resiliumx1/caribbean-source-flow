import { useState, forwardRef } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const businessTypes = ["Retailer", "Practitioner", "Manufacturer", "Distributor"];

export const LeadForm = forwardRef<HTMLDivElement>((_, ref) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    companyName: "",
    email: "",
    businessType: "",
    needs: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.email || !form.businessType) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    console.log("Wholesale lead:", form);
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({ title: "Request Received!", description: "Our sourcing team will contact you within 4 business hours." });
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--site-bg-card)",
    border: "1px solid var(--site-border)",
    color: "var(--site-text-primary)",
    borderRadius: "12px",
    padding: "14px 16px",
    width: "100%",
    fontFamily: "'Jost', sans-serif",
    fontWeight: 300,
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Jost', sans-serif",
    fontWeight: 400,
    fontSize: "12px",
    color: "var(--site-gold)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "6px",
    display: "block",
  };

  if (isSubmitted) {
    return (
      <section ref={ref} id="quote-form" className="py-24 md:py-28" style={{ background: "var(--site-bg-primary)", fontFamily: "'Jost', sans-serif" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center p-12 rounded-2xl" style={{ background: "var(--site-bg-card)", border: "1px solid var(--site-border)", boxShadow: "var(--site-shadow-card)" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(188,138,95,0.1)" }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: "var(--site-gold)" }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "32px", color: "var(--site-text-primary)", marginBottom: "16px" }}>
              Thank You!
            </h2>
            <p style={{ color: "var(--site-text-muted)", fontWeight: 300 }}>
              Our Miami-based sourcing team will review your requirements and reach out within 4 business hours.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="quote-form" className="py-24 md:py-28" style={{ background: "var(--site-bg-primary)", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="mb-3" style={{ fontSize: "12px", fontWeight: 400, color: "var(--site-gold)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Start the Conversation
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 44px)", color: "var(--site-text-primary)" }}>
            Request a Custom Quote
          </h2>
          <p className="mt-3" style={{ color: "var(--site-text-muted)", fontWeight: 300, fontSize: "16px", maxWidth: "480px", margin: "12px auto 0" }}>
            Tell us about your business and we'll build a solution around your needs.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto p-8 md:p-10 rounded-2xl space-y-5"
          style={{ background: "var(--site-bg-card)", border: "1px solid var(--site-border)", boxShadow: "var(--site-shadow-card)" }}
        >
          <div>
            <label style={labelStyle}>Company Name *</label>
            <input
              placeholder="Your company name"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              placeholder="you@yourcompany.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Business Type *</label>
            <select
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value })}
              style={{ ...inputStyle, appearance: "auto" as const }}
              required
            >
              <option value="">Select your business type</option>
              {businessTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>What Are You Looking For?</label>
            <textarea
              placeholder="Tell us about your product needs and volume..."
              value={form.needs}
              onChange={(e) => setForm({ ...form, needs: e.target.value })}
              rows={4}
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" as const }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-full transition-all hover:brightness-110"
            style={{ background: "var(--site-gold)", color: "#0F281E", fontWeight: 600, fontSize: "16px", padding: "18px", minHeight: "56px" }}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Request Custom Quote
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
});

LeadForm.displayName = "LeadForm";
