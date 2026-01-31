import { Award, BookOpen, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const whatsappNumber = "+17582855195";

export function PriestKailashBio() {
  const whatsappMessage = encodeURIComponent(
    "Hello, I would like to schedule a discovery call with Priest Kailash to discuss a retreat consultation."
  );

  return (
    <section className="py-20 md:py-28 bg-secondary text-secondary-foreground">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Placeholder */}
          <div className="relative">
            <div className="aspect-[4/5] bg-secondary-foreground/10 rounded-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 rounded-full bg-secondary-foreground/20 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-serif font-bold text-secondary-foreground/60">
                    PK
                  </span>
                </div>
                <p className="text-secondary-foreground/60 text-sm">
                  Photo coming soon
                </p>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-4 border-accent rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-6">
              Your Guide
            </span>

            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Right Honourable Priest Kailash Kay Leonce
            </h2>
            <p className="text-secondary-foreground/80 text-lg mb-8">
              Master Herbalist & Founder, Mount Kailash Rejuvenation Centre
            </p>

            {/* Credentials */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-secondary-foreground/5 rounded-xl">
                <Calendar className="w-6 h-6 text-accent" />
                <div>
                  <div className="font-semibold">21+ Years</div>
                  <div className="text-sm text-secondary-foreground/70">
                    Clinical Practice
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary-foreground/5 rounded-xl">
                <BookOpen className="w-6 h-6 text-accent" />
                <div>
                  <div className="font-semibold">500+</div>
                  <div className="text-sm text-secondary-foreground/70">
                    Herbalists Trained
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary-foreground/5 rounded-xl col-span-2">
                <Award className="w-6 h-6 text-accent" />
                <div>
                  <div className="font-semibold">
                    Featured by St. Lucia Tourism Authority
                  </div>
                  <div className="text-sm text-secondary-foreground/70">
                    Official Cultural Heritage Partner
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="relative pl-6 border-l-4 border-accent mb-8">
              <p className="text-xl italic leading-relaxed mb-3">
                "Western medicine treats symptoms. Bush medicine addresses
                terrain—the cellular environment where disease takes root. We
                don't fight the body; we restore its intelligence."
              </p>
            </blockquote>

            {/* CTA */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Schedule Discovery Call
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
