import { Users, User, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRetreatTypes } from "@/hooks/use-retreats";
import { useStore } from "@/lib/store-context";

const EXCHANGE_RATE = 2.70;

export function RetreatPathSplit() {
  const { data: retreatTypes = [] } = useRetreatTypes();
  const { formatPrice } = useStore();
  const groupRetreat = retreatTypes.find((r) => r.type === "group");
  const soloRetreat = retreatTypes.find((r) => r.type === "solo");

  const scrollToCalendar = () => {
    document.getElementById("retreat-calendar")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="section-header mb-4">Two Paths to Transformation</h2>
          <p className="section-subheader mx-auto">
            Whether you seek community wisdom or private healing, we have a
            protocol designed for your journey.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Group Immersion */}
          <div className="bg-card rounded-2xl border-2 border-border p-8 transition-all hover:border-accent hover:shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {groupRetreat?.name || "Bush Medicine Immersion"}
                </h3>
                <span className="text-sm text-muted-foreground">
                  Group Experience
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="px-3 py-1.5 bg-muted rounded-lg text-sm">
                <span className="font-semibold">7 days</span>
                <span className="text-muted-foreground"> (Sat-Sat)</span>
              </div>
              <div className="px-3 py-1.5 bg-muted rounded-lg text-sm">
                <span className="text-muted-foreground">Max </span>
                <span className="font-semibold">10 guests</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {groupRetreat?.description ||
                "A transformative 7-day group experience guided by Master Herbalist Priest Kailash. Participate in wildcrafting expeditions, learn traditional preparation methods, and undergo supervised cellular detoxification protocols."}
            </p>

            {/* Inclusions */}
            <ul className="space-y-2 mb-8">
              {(
                groupRetreat?.includes || [
                  "Shared traditional accommodations",
                  "All ital plant-based meals",
                  "Airport transfers (UVF)",
                  "Daily herbal workshops",
                  "30-day post-retreat formulation supply",
                ]
              )
                .slice(0, 5)
                .map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
            </ul>

            {/* Pricing */}
            <div className="border-t border-border pt-6 mb-6">
              <div className="text-sm text-muted-foreground mb-1">From</div>
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(
                  groupRetreat?.base_price_usd || 2400,
                  (groupRetreat?.base_price_usd || 2400) * EXCHANGE_RATE
                )}
                <span className="text-lg font-normal text-muted-foreground">
                  {" "}
                  per person
                </span>
              </div>
            </div>

            <Button onClick={scrollToCalendar} className="w-full" size="lg">
              View 2025 Dates
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Solo Retreat */}
          <div className="bg-card rounded-2xl border-2 border-border p-8 transition-all hover:border-accent hover:shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                <User className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {soloRetreat?.name || "Solo Deep Detox"}
                </h3>
                <span className="text-sm text-muted-foreground">
                  Private Experience
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="px-3 py-1.5 bg-muted rounded-lg text-sm">
                <span className="font-semibold">3-14 days</span>
                <span className="text-muted-foreground"> (Flexible)</span>
              </div>
              <div className="px-3 py-1.5 bg-muted rounded-lg text-sm">
                <span className="text-muted-foreground">Only </span>
                <span className="font-semibold">3 private cabins</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {soloRetreat?.description ||
                "Personalized detox retreat in a private rainforest cabin. Work one-on-one with Priest Kailash to address your specific health goals with custom formulations and daily consultations."}
            </p>

            {/* Inclusions */}
            <ul className="space-y-2 mb-8">
              {(
                soloRetreat?.includes || [
                  "Private rainforest cabin",
                  "All ital plant-based meals",
                  "Daily consultation with Priest Kailash",
                  "Custom formulation protocol",
                  "60-day post-retreat formulation supply",
                ]
              )
                .slice(0, 5)
                .map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
            </ul>

            {/* Pricing */}
            <div className="border-t border-border pt-6 mb-6">
              <div className="text-sm text-muted-foreground mb-1">From</div>
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(
                  soloRetreat?.base_price_usd || 350,
                  (soloRetreat?.base_price_usd || 350) * EXCHANGE_RATE
                )}
                <span className="text-lg font-normal text-muted-foreground">
                  {" "}
                  per night
                </span>
              </div>
              <div className="text-sm text-success mt-1">
                Longer stays = lower nightly rate
              </div>
            </div>

            <Button
              onClick={scrollToCalendar}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Request Consultation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
