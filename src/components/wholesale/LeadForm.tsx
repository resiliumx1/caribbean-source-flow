import { useState, useEffect, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ArrowLeft, Building2, Package, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const businessTypes = [
  "Supplement Manufacturer",
  "Wellness Brand",
  "Herbal Practitioner",
  "Spa/Wellness Center",
  "Retail Store",
  "Distributor",
  "Other",
];

const roles = [
  "Owner / Founder",
  "Purchasing / Procurement",
  "Product Development",
  "Operations",
  "Other",
];

const markets = [
  "USA",
  "UK / Europe",
  "Canada",
  "Caribbean",
  "Multiple Markets",
];

const productCategories = [
  { id: "seamoss", label: "Sea Moss Products (Golden, Full Spectrum, Soaps)" },
  { id: "bush", label: "Traditional Bush Medicine (Gully Root, St. John's Bush, Soursop)" },
  { id: "clinical", label: "Clinical Formulations (The Answer, Prosperity, Fertility)" },
  { id: "herbs", label: "Single Herbs (Vervain, Bay Leaf, Patchouli, Cassia)" },
  { id: "teas", label: "Bulk Teas & Herbal Blends" },
  { id: "consult", label: "Not sure—need consultation" },
];

const volumeOptions = [
  "Sampling/R&D (1-9 units)",
  "Small scale (10-24 units)",
  "Medium (25-49 units)",
  "Large (50-99 units)",
  "Commercial (100+ units)",
  "Don't know—need guidance",
];

const timelines = [
  "Immediate need",
  "1-3 months",
  "3-6 months",
  "Future consideration",
];

const contactMethods = [
  "Email",
  "WhatsApp",
  "Phone Call",
];

const STORAGE_KEY = "mkrc_wholesale_form";

export const LeadForm = forwardRef<HTMLDivElement>((_, ref) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Load saved data from localStorage
  const loadSavedData = (): Partial<FormData> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
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

  // Save to localStorage on change
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

  const handleStep1Submit = async (data: Step1Data) => {
    setStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    setIsSubmitting(true);
    
    const fullData: FormData = {
      ...step1Form.getValues(),
      ...data,
    };

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Form submitted:", fullData);
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Request Received!",
      description: "Our sourcing team will contact you within 4 business hours.",
    });
  };

  if (isSubmitted) {
    return (
      <section ref={ref} className="py-20 md:py-28 bg-muted/50" id="quote-form">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto form-container text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4 font-serif">
              Thank You for Your Interest!
            </h2>
            <p className="text-muted-foreground mb-6">
              Our Miami-based sourcing team will review your requirements and 
              reach out within 4 business hours with custom pricing and availability.
            </p>
            <p className="text-sm text-muted-foreground">
              Need immediate assistance? Call us at{" "}
              <a href="tel:+13059429407" className="text-primary font-medium hover:underline">
                +1 (305) 942-9407
              </a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-20 md:py-28 bg-muted/50" id="quote-form">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-header">
            Request <span className="text-gradient-gold">Custom Quote</span>
          </h2>
          <p className="section-subheader mx-auto">
            Tell us about your business and product needs. All pricing is customized for your volume.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto form-container">
          {/* Progress Bar */}
          <div className="form-progress">
            <div 
              className="form-progress-bar" 
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                Business Profile
              </span>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <Package className="w-4 h-4" />
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                Product Needs
              </span>
            </div>
          </div>
          
          {/* Step 1: Business Profile */}
          {step === 1 && (
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="form-step">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Your company name"
                    {...step1Form.register("companyName")}
                    className="mt-1.5"
                  />
                  {step1Form.formState.errors.companyName && (
                    <p className="text-sm text-destructive mt-1">
                      {step1Form.formState.errors.companyName.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="website">Website *</Label>
                  <Input
                    id="website"
                    placeholder="yourcompany.com"
                    {...step1Form.register("website")}
                    className="mt-1.5"
                  />
                  {step1Form.formState.errors.website && (
                    <p className="text-sm text-destructive mt-1">
                      {step1Form.formState.errors.website.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label>Business Type *</Label>
                  <Select
                    value={step1Form.watch("businessType")}
                    onValueChange={(value) => step1Form.setValue("businessType", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {step1Form.formState.errors.businessType && (
                    <p className="text-sm text-destructive mt-1">
                      {step1Form.formState.errors.businessType.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label>Your Role *</Label>
                  <Select
                    value={step1Form.watch("role")}
                    onValueChange={(value) => step1Form.setValue("role", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {step1Form.formState.errors.role && (
                    <p className="text-sm text-destructive mt-1">
                      {step1Form.formState.errors.role.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label>Primary Market *</Label>
                  <Select
                    value={step1Form.watch("primaryMarket")}
                    onValueChange={(value) => step1Form.setValue("primaryMarket", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select your primary market" />
                    </SelectTrigger>
                    <SelectContent>
                      {markets.map((market) => (
                        <SelectItem key={market} value={market}>{market}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {step1Form.formState.errors.primaryMarket && (
                    <p className="text-sm text-destructive mt-1">
                      {step1Form.formState.errors.primaryMarket.message}
                    </p>
                  )}
                </div>
              </div>
              
              <Button type="submit" variant="submit" size="lg" className="w-full mt-8 group">
                Continue to Product Selection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          )}
          
          {/* Step 2: Product Needs */}
          {step === 2 && (
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="form-step">
              <div className="space-y-6">
                {/* Product Categories */}
                <div>
                  <Label className="mb-3 block">Products Interested In *</Label>
                  <div className="space-y-3">
                    {productCategories.map((category) => (
                      <div key={category.id} className="flex items-start gap-3">
                        <Checkbox
                          id={category.id}
                          checked={step2Form.watch("productsInterested")?.includes(category.id)}
                          onCheckedChange={(checked) => {
                            const current = step2Form.watch("productsInterested") || [];
                            if (checked) {
                              step2Form.setValue("productsInterested", [...current, category.id]);
                            } else {
                              step2Form.setValue("productsInterested", current.filter(id => id !== category.id));
                            }
                          }}
                          className="mt-0.5"
                        />
                        <Label htmlFor={category.id} className="text-sm font-normal cursor-pointer">
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {step2Form.formState.errors.productsInterested && (
                    <p className="text-sm text-destructive mt-2">
                      {step2Form.formState.errors.productsInterested.message}
                    </p>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Estimated Monthly Volume *</Label>
                    <Select
                      value={step2Form.watch("monthlyVolume")}
                      onValueChange={(value) => step2Form.setValue("monthlyVolume", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select volume" />
                      </SelectTrigger>
                      <SelectContent>
                        {volumeOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {step2Form.formState.errors.monthlyVolume && (
                      <p className="text-sm text-destructive mt-1">
                        {step2Form.formState.errors.monthlyVolume.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Timeline *</Label>
                    <Select
                      value={step2Form.watch("timeline")}
                      onValueChange={(value) => step2Form.setValue("timeline", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {timelines.map((timeline) => (
                          <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {step2Form.formState.errors.timeline && (
                      <p className="text-sm text-destructive mt-1">
                        {step2Form.formState.errors.timeline.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@yourcompany.com"
                    {...step2Form.register("email")}
                    className="mt-1.5"
                  />
                  {step2Form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {step2Form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...step2Form.register("phone")}
                      className="mt-1.5"
                    />
                    {step2Form.formState.errors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {step2Form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Preferred Contact *</Label>
                    <Select
                      value={step2Form.watch("preferredContact")}
                      onValueChange={(value) => step2Form.setValue("preferredContact", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactMethods.map((method) => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {step2Form.formState.errors.preferredContact && (
                      <p className="text-sm text-destructive mt-1">
                        {step2Form.formState.errors.preferredContact.message}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Opt-in */}
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="optIn"
                    checked={step2Form.watch("optInSpecSheets")}
                    onCheckedChange={(checked) => step2Form.setValue("optInSpecSheets", !!checked)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="optIn" className="text-sm font-normal cursor-pointer">
                    Send me the St. Lucian Bush Medicine Spec Sheets (PDF with detailed product information)
                  </Label>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="submit" 
                  size="lg" 
                  className="flex-1 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request Custom Pricing & Availability
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
});

LeadForm.displayName = "LeadForm";
