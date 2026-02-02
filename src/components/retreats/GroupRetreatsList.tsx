import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Users, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRetreatDates, useRetreatTypes, type RetreatDate } from "@/hooks/use-retreats";
import { useStore } from "@/lib/store-context";

const whatsappNumber = "+17582855195";
const EXCHANGE_RATE = 2.70;

export function GroupRetreatsList() {
  const [selectedRetreat, setSelectedRetreat] = useState<RetreatDate | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  
  const { data: retreatDates = [] } = useRetreatDates();
  const { data: retreatTypes = [] } = useRetreatTypes();
  const { formatPrice } = useStore();

  const groupRetreat = retreatTypes.find((r) => r.type === "group");

  // Filter to only show group retreats with future dates
  const groupDates = retreatDates.filter((rd) => {
    const rdType = rd.retreat_types as any;
    return rdType?.type === "group" && new Date(rd.start_date) > new Date();
  });

  const getWhatsAppLink = (retreat: RetreatDate) => {
    const startDate = format(new Date(retreat.start_date), "MMM d, yyyy");
    const endDate = format(new Date(retreat.end_date), "MMM d, yyyy");
    const message = encodeURIComponent(
      `Hello, I'm interested in booking the Group Immersion retreat from ${startDate} to ${endDate} for ${guestCount} guest(s). Can you help me secure my spot?`
    );
    return `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${message}`;
  };

  const getPrice = (retreat: RetreatDate) => {
    return retreat.price_override_usd || groupRetreat?.base_price_usd || 2400;
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
            2025 Group Retreat Dates
          </h2>
          <p className="text-muted-foreground">
            7-day immersive experiences. Limited to 10 guests per retreat.
          </p>
        </div>

        {/* Dates List */}
        <div className="space-y-4">
          {groupDates.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No upcoming group retreats scheduled. Check back soon or{" "}
                <a 
                  href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent("Hello, I'd like to know when the next group retreat dates will be available.")}`}
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  contact us
                </a>{" "}
                for private retreat options.
              </p>
            </div>
          ) : (
            groupDates.map((retreat) => {
              const spotsLeft = retreat.spots_total - retreat.spots_booked;
              const price = getPrice(retreat);
              const startDate = new Date(retreat.start_date);
              const endDate = new Date(retreat.end_date);
              
              return (
                <button
                  key={retreat.id}
                  onClick={() => setSelectedRetreat(retreat)}
                  className="w-full p-6 bg-card rounded-2xl border-2 border-border hover:border-primary hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Date info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-foreground">
                          {format(startDate, "MMM d")} – {format(endDate, "MMM d, yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {spotsLeft > 0 ? (
                            <span>{spotsLeft} spots remaining</span>
                          ) : (
                            <span className="text-destructive">Fully Booked</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          {formatPrice(price, price * EXCHANGE_RATE)}
                        </div>
                        <div className="text-sm text-muted-foreground">per person</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Availability badge */}
                  {spotsLeft > 0 && spotsLeft <= 3 && (
                    <Badge variant="secondary" className="mt-3 bg-amber-100 text-amber-800">
                      Only {spotsLeft} spots left – Book soon!
                    </Badge>
                  )}
                </button>
              );
            })
          )}
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

      {/* Booking Modal */}
      <Dialog open={!!selectedRetreat} onOpenChange={() => setSelectedRetreat(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Book Your Retreat
            </DialogTitle>
            <DialogDescription>
              {selectedRetreat && (
                <>
                  {format(new Date(selectedRetreat.start_date), "MMMM d")} –{" "}
                  {format(new Date(selectedRetreat.end_date), "MMMM d, yyyy")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRetreat && (
            <div className="space-y-6 pt-4">
              {/* Guest count selector */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Number of Guests
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    disabled={guestCount <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">{guestCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuestCount(Math.min(selectedRetreat.spots_total - selectedRetreat.spots_booked, guestCount + 1))}
                    disabled={guestCount >= selectedRetreat.spots_total - selectedRetreat.spots_booked}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Pricing summary */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {formatPrice(getPrice(selectedRetreat), getPrice(selectedRetreat) * EXCHANGE_RATE)} × {guestCount} guest{guestCount > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      getPrice(selectedRetreat) * guestCount,
                      getPrice(selectedRetreat) * guestCount * EXCHANGE_RATE
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>50% deposit due now</span>
                  <span>
                    {formatPrice(
                      (getPrice(selectedRetreat) * guestCount) / 2,
                      (getPrice(selectedRetreat) * guestCount * EXCHANGE_RATE) / 2
                    )}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-primary">
                  <span>✓</span> 30-day pre-arrival protocol included
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <span>✓</span> Payment plans available
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <span>✓</span> 100% refundable up to 30 days before
                </div>
              </div>

              {/* CTA */}
              <a
                href={getWhatsAppLink(selectedRetreat)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Complete Booking via WhatsApp
                </Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
