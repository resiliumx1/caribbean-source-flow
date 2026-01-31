import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-farm.jpg";

const whatsappNumber = "+17582855195";

export function RetreatsHero() {
  const scrollToCalendar = () => {
    document.getElementById("retreat-calendar")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const whatsappMessage = encodeURIComponent(
    "Hello, I'm interested in learning more about your Solo Deep Detox retreat options. Could you share more information about availability and what's included?"
  );

  return (
    <section className="relative min-h-[70vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Mount Kailash rainforest retreat"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-6 animate-fade-in">
            Immersion, Not Vacation
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6 animate-slide-up">
            Detox at the Cellular Level
          </h1>

          <p className="text-xl text-background/90 leading-relaxed mb-8 animate-slide-up delay-100">
            Reclaim your vitality in St. Lucia's volcanic rainforest. 7-day
            Bush Medicine Immersions & personalized Solo Retreats guided by
            Master Herbalist Priest Kailash.
          </p>

          <p className="text-background/80 mb-8 animate-slide-up delay-200">
            <strong>Medically-informed. Traditionally-rooted.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-300">
            <Button
              size="lg"
              onClick={scrollToCalendar}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Check Group Availability
            </Button>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-background/30 text-background hover:bg-background/10"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Inquire About Solo Retreat
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
