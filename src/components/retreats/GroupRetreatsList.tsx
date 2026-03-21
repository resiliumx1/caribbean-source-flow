import { Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRetreatDates } from "@/hooks/use-retreats";
import { format } from "date-fns";

const whatsappNumber = "+17582855195";

export function GroupRetreatsList() {
  const { data: retreatDates = [] } = useRetreatDates();

  const groupDates = retreatDates.filter((rd) => {
    const rdType = rd.retreat_types as any;
    return rdType?.type === "group";
  });

  if (groupDates.length === 0) {
    return (
      <section className="py-16" style={{ background: 'var(--site-bg-primary)' }}>
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-border)' }}>
            <Calendar className="w-14 h-14 mx-auto mb-6" style={{ color: 'var(--site-gold)' }} />
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '28px', color: 'var(--site-text-primary)', marginBottom: '12px' }}>
              Group Dates Coming Soon
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '15px', color: 'var(--site-text-muted)', maxWidth: '420px', margin: '0 auto 24px' }}>
              We're finalizing our upcoming group retreat schedule. Reach out to be first to know.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent("Hello, I'd like to be notified when group retreat dates are available.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="gap-2 rounded-full" style={{ background: 'var(--site-gold)', color: 'var(--site-green-dark)' }}>
                <MessageCircle className="w-4 h-4" />
                Get Notified via WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
