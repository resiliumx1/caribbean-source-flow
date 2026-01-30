import { Star, Quote, Package, Shield, Headphones } from "lucide-react";

const testimonials = [
  {
    quote: "Finally, a Caribbean supplier with proper COAs and consistent quality. Every batch matches the last.",
    author: "Sarah M.",
    role: "Sourcing Director",
    company: "US Supplement Brand",
  },
  {
    quote: "The Miami warehousing changed everything. We went from 6-week lead times to 3-day deliveries.",
    author: "James T.",
    role: "Operations Manager",
    company: "UK Wellness Retailer",
  },
  {
    quote: "Their documentation package is impeccable. Customs clearance has never been smoother.",
    author: "Dr. Anita R.",
    role: "Founder",
    company: "Herbal Practice",
  },
];

const riskReversals = [
  {
    icon: Package,
    title: "100g Sample Program",
    description: "Full documentation included. Test before committing to volume.",
  },
  {
    icon: Shield,
    title: "St. Lucian Origin Guarantee",
    description: "Every product traceable to our certified farms.",
  },
  {
    icon: Headphones,
    title: "English-Speaking Support",
    description: "Miami-based team responds within 4 hours.",
  },
];

export const SocialProof = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="section-header mb-4">
            What Wholesale Buyers <span className="text-gradient-gold">Say</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl p-6 border border-border relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-accent/30" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              
              <blockquote className="text-foreground mb-6 font-medium">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Risk Reversals */}
        <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-center mb-8 font-serif">
            Zero-Risk Partnership
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {riskReversals.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
