import { useState, forwardRef } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const businessTypes = [
  "Wellness Clinic / Practitioner",
  "Herbal Apothecary / Store",
  "Retail Boutique / Brick & Mortar",
  "E-commerce / Online Retail",
  "White Label / Private Brand",
  "Distributor / Reseller",
  "Other",
];

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
    if (!form.companyName || !form.email || !form.businessType || !form.needs) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({ title: "Inquiry Received", description: "Our partnership team will be in touch within 24 hours." });
  };

  if (isSubmitted) {
    return (
      <section
        ref={ref}
        id="quote-form"
        className="py-16 md:py-24"
        style={{ background: "#0a1f0a" }}
      >
        <div className="container mx-auto px-4">
          <div
            className="max-w-[600px] mx-auto text-center rounded-2xl p-10 md:p-12"
            style={{
              background: "#F5F5F0",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(212,175,55,0.12)" }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: "#D4AF37" }} />
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "30px",
                color: "#0a1f0a",
                marginBottom: "16px",
              }}
            >
              Thank You
            </h2>
            <p
              style={{
                color: "#0a1f0a",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: "16px",
                lineHeight: 1.7,
                opacity: 0.85,
              }}
            >
              Our partnership team will contact you within 24 hours.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id="quote-form"
      className="py-16 md:py-24"
      style={{ background: "#0a1f0a" }}
    >
      <div className="container mx-auto px-4">
        {/* Headline block */}
        <div className="max-w-[600px] mx-auto text-center mb-10 md:mb-14">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 42px)",
              color: "#D4AF37",
              lineHeight: 1.15,
            }}
          >
            Partner With Mount Kailash
          </h2>
          <p
            className="mt-4"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(16px, 2.5vw, 20px)",
              color: "#F5F5DC",
              lineHeight: 1.6,
            }}
          >
            Wholesale &amp; white-label access to Caribbean botanical formulations.
          </p>
          <p
            className="mt-3"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "16px",
              color: "rgba(245,245,220,0.9)",
              lineHeight: 1.6,
            }}
          >
            Custom supply solutions for clinics, apothecaries, and conscious retailers.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="max-w-[600px] mx-auto rounded-2xl"
          style={{
            background: "#F5F5F0",
            padding: "clamp(1.75rem, 4vw, 2.5rem)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          <div className="space-y-5">
            {/* Field 1 */}
            <div>
              <label
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#0a1f0a",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Business / Practice Name *
              </label>
              <input
                placeholder="Your business name"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
                className="wholesale-form-input"
              />
            </div>

            {/* Field 2 */}
            <div>
              <label
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#0a1f0a",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Email *
              </label>
              <input
                type="email"
                placeholder="your@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="wholesale-form-input"
              />
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "13px",
                  color: "#6B7280",
                  marginTop: "4px",
                  fontWeight: 300,
                }}
              >
                Preferably your business domain
              </p>
            </div>

            {/* Field 3 */}
            <div>
              <label
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#0a1f0a",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Business Type *
              </label>
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                required
                className="wholesale-form-input"
                style={{ appearance: "auto" }}
              >
                <option value="">Select your business type</option>
                {businessTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 4 */}
            <div>
              <label
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#0a1f0a",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Tell Us What You're Looking For *
              </label>
              <textarea
                placeholder="Specific formulations, monthly volume estimates, white-label requirements, or questions about our supply process..."
                value={form.needs}
                onChange={(e) => setForm({ ...form, needs: e.target.value })}
                rows={5}
                required
                className="wholesale-form-input"
                style={{ minHeight: "120px", resize: "vertical" }}
              />
            </div>
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full sm:w-auto sm:mx-auto sm:flex sm:px-12 flex items-center justify-center gap-2 rounded-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: "#D4AF37",
              color: "#0a1f0a",
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              letterSpacing: "0.05em",
              padding: "18px 32px",
              minHeight: "56px",
              display: "flex",
            }}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Request Wholesale Access
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Trust footer */}
          <p
            className="mt-6 text-center"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "14px",
              color: "#0a1f0a",
              opacity: 0.7,
              lineHeight: 1.6,
            }}
          >
            Our partnership team responds to all inquiries within 24 business hours.
            <br />
            21 years of documented formulations.
          </p>
        </form>
      </div>
    </section>
  );
});

LeadForm.displayName = "LeadForm";
