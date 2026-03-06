import { useState, useEffect, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ArrowLeft, Building2, Package, Loader2, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Email domain validation - block consumer emails
const businessEmailRegex = /^[a-zA-Z0-9._%+-]+@(?!gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com|icloud\.com|mail\.com|protonmail\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const step1Schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().url("Please enter a valid website URL").or(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/, "Please enter a valid website")),
  businessType: z.string().min(1, "Please select your business type"),
  role: z.string().min(1, "Please select your role"),
  primaryMarket: z.string().min(1, "Please select your primary market"),
});

const step2Schema = z.object({
  productsInterested: z.array(z.string()).min(1, "Please select at least one product category"),
  monthlyVolume: z.string().min(1, "Please select your estimated volume"),
  timeline: z.string().min(1, "Please select your timeline"),
  email: z.string().email("Please enter a valid email").refine(
    (email) => businessEmailRegex.test(email),
    "Please use your corporate email address (no Gmail, Yahoo, etc.)"
  ),
  phone: z.string().min(10, "Please enter a valid phone number"),
  preferredContact: z.string().min(1, "Please select your preferred contact method"),
  optInSpecSheets: z.boolean().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type FormData = Step1Data & Step2Data;

const businessTypes = ["Supplement Manufacturer", "Wellness Brand", "Herbal Practitioner", "Spa/Wellness Center", "Retail Store", "Distributor", "Other"];
const roles = ["Owner / Founder", "Purchasing / Procurement", "Product Development", "Operations", "Other"];
const markets = ["USA", "UK / Europe", "Canada", "Caribbean", "Multiple Markets"];
const productCategories = [
  { id: "seamoss", label: "Sea Moss Products (Golden, Full Spectrum, Soaps)" },
  { id: "bush", label: "Traditional Bush Medicine (Gully Root, St. John's Bush, Soursop)" },
  { id: "clinical", label: "Clinical Formulations (The Answer, Prosperity, Fertility)" },
  { id: "herbs", label: "Single Herbs (Vervain, Bay Leaf, Patchouli, Cassia)" },
  { id: "teas", label: "Bulk Teas & Herbal Blends" },
  { id: "consult", label: "Not sure—need consultation" },
];
const volumeOptions = ["Sampling/R&D (1-9 units)", "Small scale (10-24 units)", "Medium (25-49 units)", "Large (50-99 units)", "Commercial (100+ units)", "Don't know—need guidance"];
const timelines = ["Immediate need", "1-3 months", "3-6 months", "Future consideration"];
const contactMethods = ["Email", "WhatsApp", "Phone Call"];

const STORAGE_KEY = "mkrc_wholesale_form";

/* Shared inline styles */
const inputStyle: React.CSSProperties = {
  background: "var(--site-bg-card)",
  border: "1px solid var(--site-border)",
  color: "var(--site-text-primary)",
  borderRadius: "12px",
  padding: "12px 16px",
  width: "100%",
  fontFamily: "'Jost', sans-serif",
  fontWeight: 300,
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontWeight: 400,
  fontSize: "13px",
  color: "#c9a84c",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "6px",
  display: "block",
};

const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = "#c9a84c";
  e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.1)";
};

const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = "";
  e.target.style.boxShadow = "none";
};

export const LeadForm = forwardRef<HTMLDivElement>((_, ref) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const loadSavedData = (): Partial<FormData> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const savedData = loadSavedData();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      companyName: savedData.companyName || "",
      website: savedData.website || "",
      businessType: savedData.businessType || "",
      role: savedData.role || "",
      primaryMarket: savedData.primaryMarket || "",
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      productsInterested: savedData.productsInterested || [],
      monthlyVolume: savedData.monthlyVolume || "",
      timeline: savedData.timeline || "",
      email: savedData.email || "",
      phone: savedData.phone || "",
      preferredContact: savedData.preferredContact || "",
      optInSpecSheets: savedData.optInSpecSheets || false,
    },
  });

  useEffect(() => {
    const subscription = step1Form.watch((data) => {
      const current = loadSavedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }));
    });
    return () => subscription.unsubscribe();
  }, [step1Form.watch]);

  useEffect(() => {
    const subscription = step2Form.watch((data) => {
      const current = loadSavedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }));
    });
    return () => subscription.unsubscribe();
  }, [step2Form.watch]);

  const handleStep1Submit = async () => { setStep(2); };

  const handleStep2Submit = async (data: Step2Data) => {
    setIsSubmitting(true);
    const fullData: FormData = { ...step1Form.getValues(), ...data };
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Form submitted:", fullData);
    localStorage.removeItem(STORAGE_KEY);
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({ title: "Request Received!", description: "Our sourcing team will contact you within 4 business hours." });
  };

  if (isSubmitted) {
    return (
      <section ref={ref} className="py-24 md:py-28" style={{ background: "var(--site-bg-primary)", fontFamily: "'Jost', sans-serif" }} id="quote-form">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center p-12 rounded-2xl" style={{ background: "var(--site-bg-card)", border: "1px solid var(--site-border)", boxShadow: "var(--site-shadow-card)" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(201,168,76,0.1)" }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: "#c9a84c" }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "32px", color: "var(--site-text-primary)", marginBottom: "16px" }}>
              Thank You for Your Interest!
            </h2>
            <p style={{ color: "var(--site-text-muted)", fontWeight: 300, marginBottom: "16px" }}>
              Our Miami-based sourcing team will review your requirements and reach out within 4 business hours with custom pricing and availability.
            </p>
            <p style={{ fontSize: "14px", color: "var(--site-text-muted)" }}>
              Need immediate assistance? Call us at{" "}
              <a href="tel:+13059429407" style={{ color: "#c9a84c", fontWeight: 500 }}>+1 (305) 942-9407</a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-24 md:py-28" style={{ background: "var(--site-bg-primary)", fontFamily: "'Jost', sans-serif" }} id="quote-form">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(2rem, 4vw, 44px)", color: "var(--site-text-primary)", marginBottom: "12px" }}>
            Get Pricing Built Around Your Volume.
          </h2>
          <p style={{ fontWeight: 300, fontSize: "16px", color: "var(--site-text-muted)", maxWidth: "560px", margin: "0 auto" }}>
            Tell us about your business and we'll respond within 24 hours with custom pricing for your order size.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto p-8 md:p-12 rounded-2xl" style={{ background: "var(--site-bg-card)", border: "1px solid var(--site-border)", boxShadow: "var(--site-shadow-card)" }}>
          {/* Progress */}
          <div className="h-1 rounded-full mb-8" style={{ background: "rgba(201,168,76,0.15)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: step === 1 ? "50%" : "100%", background: "#c9a84c" }} />
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#c9a84c", color: "#090909" }}>
                <Building2 className="w-4 h-4" />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 400, color: "var(--site-text-primary)" }}>Business Profile</span>
            </div>
            <div className="flex-1 h-px mx-4" style={{ background: "rgba(201,168,76,0.2)" }} />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: step >= 2 ? "#c9a84c" : "rgba(201,168,76,0.15)", color: step >= 2 ? "#090909" : "var(--site-text-muted)" }}>
                <Package className="w-4 h-4" />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 400, color: step >= 2 ? "var(--site-text-primary)" : "var(--site-text-muted)" }}>Product Needs</span>
            </div>
          </div>
          
          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-5">
              <div>
                <label style={labelStyle}>Company Name *</label>
                <input placeholder="Your company name" {...step1Form.register("companyName")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                {step1Form.formState.errors.companyName && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{step1Form.formState.errors.companyName.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Website *</label>
                <input placeholder="yourcompany.com" {...step1Form.register("website")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                {step1Form.formState.errors.website && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{step1Form.formState.errors.website.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Business Type *</label>
                <select value={step1Form.watch("businessType")} onChange={(e) => step1Form.setValue("businessType", e.target.value)} style={{ ...inputStyle, appearance: "auto" as any }} onFocus={handleFocus as any} onBlur={handleBlur as any}>
                  <option value="">Select your business type</option>
                  {businessTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {step1Form.formState.errors.businessType && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{step1Form.formState.errors.businessType.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Your Role *</label>
                <select value={step1Form.watch("role")} onChange={(e) => step1Form.setValue("role", e.target.value)} style={{ ...inputStyle, appearance: "auto" as any }} onFocus={handleFocus as any} onBlur={handleBlur as any}>
                  <option value="">Select your role</option>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {step1Form.formState.errors.role && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{step1Form.formState.errors.role.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Primary Market *</label>
                <select value={step1Form.watch("primaryMarket")} onChange={(e) => step1Form.setValue("primaryMarket", e.target.value)} style={{ ...inputStyle, appearance: "auto" as any }} onFocus={handleFocus as any} onBlur={handleBlur as any}>
                  <option value="">Select your primary market</option>
                  {markets.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {step1Form.formState.errors.primaryMarket && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{step1Form.formState.errors.primaryMarket.message}</p>}
              </div>
              
              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 mt-8 rounded-full transition-all hover:brightness-110"
                style={{ background: "#c9a84c", color: "#090909", fontWeight: 500, fontSize: "16px", padding: "18px" }}
              >
                Continue to Product Selection
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}
          
          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
              <div>
                <label style={labelStyle}>Products Interested In *</label>
                <div className="space-y-3 mt-2">
                  {productCategories.map((category) => (
                    <div key={category.id} className="flex items-start gap-3">
                      <Checkbox
                        id={category.id}
                        checked={step2Form.watch("productsInterested")?.includes(category.id)}
                        onCheckedChange={(checked) => {
                          const current = step2Form.watch("productsInterested") || [];
                          step2Form.setValue("productsInterested", checked ? [...current, category.id] : current.filter(id => id !== category.id));
                        }}
                        className="mt-0.5"
                      />
                      <label htmlFor={category.id} className="cursor-pointer" style={{ fontSize: "14px", color: "var(--site-text-primary)", fontWeight: 300 }}>
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
                {step2Form.formState.errors.productsInterested && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px" }}>{step2Form.formState.errors.productsInterested.message}</p>}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Estimated Monthly Volume *</label>
                  <select value={step2Form.watch("monthlyVolume")} onChange={(e) => step2Form.setValue("monthlyVolume", e.target.value)} style={{ ...inputStyle, appearance: "auto" as any }} onFocus={handleFocus as any} onBlur={handleBlur as any}>
                    <option value="">Select volume</option>
                    {volumeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Timeline *</label>
                  <select value={step2Form.watch("timeline")} onChange={(e) => step2Form.setValue("timeline", e.target.value)} style={{ ...inputStyle, appearance: "auto" as any }} onFocus={handleFocus as any} onBlur={handleBlur as any}>
                    <option value="">Select timeline</option>
                    {timelines.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label style={labelStyle}>Business Email *</label>
                <input type="email" placeholder="you@yourcompany.com" {...step2Form.register("email")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                {step2Form.formState.errors.email && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{step2Form.formState.errors.email.message}</p>}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input type="tel" placeholder="+1 (555) 123-4567" {...step2Form.register("phone")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  {step2Form.formState.errors.phone && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{step2Form.formState.errors.phone.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Preferred Contact *</label>
                  <select value={step2Form.watch("preferredContact")} onChange={(e) => step2Form.setValue("preferredContact", e.target.value)} style={{ ...inputStyle, appearance: "auto" as any }} onFocus={handleFocus as any} onBlur={handleBlur as any}>
                    <option value="">Select method</option>
                    {contactMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "rgba(201,168,76,0.05)" }}>
                <Checkbox
                  id="optIn"
                  checked={step2Form.watch("optInSpecSheets")}
                  onCheckedChange={(checked) => step2Form.setValue("optInSpecSheets", !!checked)}
                  className="mt-0.5"
                />
                <label htmlFor="optIn" className="cursor-pointer" style={{ fontSize: "14px", color: "var(--site-text-primary)", fontWeight: 300 }}>
                  Send me specification sheets and batch availability updates
                </label>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all"
                  style={{ border: "1px solid var(--site-border)", color: "var(--site-text-primary)", fontWeight: 400, fontSize: "15px" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ background: "#c9a84c", color: "#090909", fontWeight: 500, fontSize: "16px", padding: "18px" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
});
