import { Award, BookOpen, Calendar, MessageCircle, Leaf, Heart, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const whatsappNumber = "+17582855195";

const experiencePoints = [
  "Personalized herbal protocol based on your unique constitution",
  "Daily one-on-one guidance and support throughout your journey",
  "Traditional bush medicine wisdom passed down through generations",
  "Integration practices to carry your transformation forward",
  "Connection to the healing power of St. Lucia's volcanic landscape",
];

export function PriestKailashBio() {
  const whatsappMessage = encodeURIComponent(
    "Hello, I would like to schedule a discovery call with Priest Kailash to discuss a retreat consultation."
  );

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background with gradient that adapts to dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-background to-primary/5" />
      
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-[4/5] bg-card rounded-2xl border border-border flex items-center justify-center overflow-hidden shadow-soft">
              <div className="text-center p-8">
                <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-4xl font-serif font-bold text-primary">
                    PK
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Photo coming soon
                </p>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-4 border-accent rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-6">
              <Leaf className="w-4 h-4" />
              Your Guide
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-serif">
              Right Honourable Priest Kailash Kay Leonce
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Master Herbalist & Founder, Mount Kailash Rejuvenation Centre
            </p>

            {/* Credentials Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">21+ Years</div>
                  <div className="text-sm text-muted-foreground">
                    Clinical Practice
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">
                    Herbalists Trained
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border col-span-2">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    Featured by St. Lucia Tourism Authority
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Official Cultural Heritage Partner
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="relative pl-6 border-l-4 border-accent mb-8">
              <p className="text-lg md:text-xl italic leading-relaxed text-foreground mb-3">
                "Western medicine treats symptoms. Bush medicine addresses
                terrain—the cellular environment where disease takes root. We
                don't fight the body; we restore its intelligence."
              </p>
            </blockquote>

            {/* What You'll Experience */}
            <div className="bg-card rounded-xl border border-border p-5 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" />
                What You'll Experience
              </h3>
              <ul className="space-y-3">
                {experiencePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Schedule Discovery Call
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
