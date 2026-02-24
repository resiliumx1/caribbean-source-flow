import { Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const whatsappNumber = "+17582855195";

export function GroupRetreatsList() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center py-16 bg-muted/30 rounded-2xl">
          <Calendar className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
            Group Retreat Dates
          </h2>
          <p className="text-xl font-semibold text-primary mb-4">Coming Soon</p>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            We're finalizing our upcoming group retreat schedule. Reach out to be the first to know when dates are announced.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent("Hello, I'd like to be notified when group retreat dates are available.")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Inquire via WhatsApp
            </Button>
          </a>
        </div>

        {/* Private retreat CTA */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-3">
            Prefer a private experience on your own schedule?
          </p>
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent("Hello, I'm interested in booking a private retreat. Can you share available dates and pricing?")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              <MessageCircle className="w-4 h-4 mr-2" />
              Inquire About Private Retreats
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
