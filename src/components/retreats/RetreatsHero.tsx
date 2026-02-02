import { MessageCircle, Calendar } from "lucide-react";
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
    "Hello, I'm interested in learning more about your private retreat options. Could you share more information about availability and what's included?"
  );

  return (
    <section className="relative min-h-[70vh] flex items-center pt-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Mount Kailash rainforest retreat"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay - NO white/cream */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(150,30%,10%)]/90 via-[hsl(150,25%,15%)]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-background leading-tight mb-6">
            Restore. Reset. Reconnect.
          </h1>

          <p className="text-xl text-background/90 leading-relaxed mb-8">
            Immersive wellness retreats in Saint Lucia designed to guide deep restoration—physically, mentally, and energetically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#1F3A2E] text-white hover:bg-[#2a4d3d] shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Book a Private Retreat
              </Button>
            </a>
            <Button
              size="lg"
              onClick={scrollToCalendar}
              className="w-full sm:w-auto bg-[#3d6b4f] text-white hover:bg-[#4a7d5d] border-0 shadow-lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Join a Group Retreat
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}