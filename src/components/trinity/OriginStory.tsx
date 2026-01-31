import { useState } from "react";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import herbProcessing from "@/assets/herb-processing.jpg";
import seamossHarvest from "@/assets/seamoss-harvest.jpg";

export function OriginStory() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Images - Documentary Style */}
          <div className="relative">
            <div className="grid grid-cols-5 gap-4">
              {/* Main Image */}
              <div className="col-span-3 relative">
                <img
                  src={herbProcessing}
                  alt="Traditional herb processing at Mount Kailash"
                  className="w-full h-80 object-cover rounded-2xl shadow-lg"
                />
                {/* Video Play Button */}
                <button
                  onClick={() => setVideoOpen(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Play video"
                >
                  <div className="w-20 h-20 rounded-full bg-background/90 flex items-center justify-center shadow-xl group-hover:bg-accent group-hover:scale-110 transition-all">
                    <Play className="w-8 h-8 text-foreground group-hover:text-accent-foreground ml-1" />
                  </div>
                </button>
              </div>

              {/* Secondary Image */}
              <div className="col-span-2">
                <img
                  src={seamossHarvest}
                  alt="Sea moss harvest in St. Lucia"
                  className="w-full h-80 object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-4 border-accent rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
              From Volcanic Soil
            </span>

            <h2 className="section-header mb-6">
              Where Traditional Bush Medicine Meets Clinical Precision
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                For over two decades, Right Honourable Priest Kailash Kay Leonce
                has cultivated the art of St. Lucian bush medicine in the shadow
                of the Pitons—where volcanic soil yields herbs of extraordinary
                potency.
              </p>
              <p>
                Our wildcrafters rise before dawn, harvesting at peak alkaloid
                concentration. Each batch undergoes natural fermentation,
                amplifying bioavailability in ways industrial extraction cannot
                replicate.
              </p>
            </div>

            {/* Proof Points */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground mb-1">500+</div>
                <div className="text-sm text-muted-foreground">
                  Herbal physicians trained
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground mb-1">43,000+</div>
                <div className="text-sm text-muted-foreground">
                  Bottles formulated annually
                </div>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="relative pl-6 border-l-4 border-accent">
              <p className="text-lg italic text-foreground mb-3">
                "Western medicine treats symptoms. Bush medicine addresses
                terrain—the cellular environment where disease takes root."
              </p>
              <cite className="text-sm text-muted-foreground not-italic">
                — Priest Kailash Kay Leonce, Master Herbalist
              </cite>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-background/80 p-2 hover:bg-background">
            <X className="w-5 h-5" />
          </DialogClose>
          <div className="aspect-video bg-foreground/10 flex items-center justify-center">
            <p className="text-muted-foreground">
              Video content coming soon
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
