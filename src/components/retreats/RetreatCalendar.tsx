import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  differenceInDays,
  isBefore,
  startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, MessageCircle, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useRetreatDates,
  useSoloPricingTiers,
  useRetreatTypes,
  calculateSoloPrice,
} from "@/hooks/use-retreats";
import { useStore } from "@/lib/store-context";

const whatsappNumber = "+17582855195";
const EXCHANGE_RATE = 2.70;

export function RetreatCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedType, setSelectedType] = useState<"group" | "solo">("solo");
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [guestCount, setGuestCount] = useState(1);

  const { data: retreatDates = [] } = useRetreatDates();
  const { data: pricingTiers = [] } = useSoloPricingTiers();
  const { data: retreatTypes = [] } = useRetreatTypes();
  const { formatPrice } = useStore();

  const groupRetreat = retreatTypes.find((r) => r.type === "group");
  const soloRetreat = retreatTypes.find((r) => r.type === "solo");

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week offset
  const startDayOfWeek = monthStart.getDay();
  const prefixDays = Array(startDayOfWeek).fill(null);

  // Group retreat dates for the current month
  const groupDatesInMonth = useMemo(() => {
    return retreatDates.filter((rd) => {
      const rdType = rd.retreat_types as any;
      if (rdType?.type !== "group") return false;
      const start = new Date(rd.start_date);
      const end = new Date(rd.end_date);
      return (
        isWithinInterval(monthStart, { start, end }) ||
        isWithinInterval(monthEnd, { start, end }) ||
        (start >= monthStart && start <= monthEnd)
      );
    });
  }, [retreatDates, monthStart, monthEnd]);

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return;

    if (selectedType === "group") {
      // For group, select the entire retreat block
      const retreat = groupDatesInMonth.find((rd) =>
        isWithinInterval(day, {
          start: new Date(rd.start_date),
          end: new Date(rd.end_date),
        })
      );
      if (retreat) {
        setSelectedRange({
          start: new Date(retreat.start_date),
          end: new Date(retreat.end_date),
        });
      }
    } else {
      // For solo, allow range selection
      if (!selectedRange.start || selectedRange.end) {
        setSelectedRange({ start: day, end: null });
      } else {
        if (isBefore(day, selectedRange.start)) {
          setSelectedRange({ start: day, end: selectedRange.start });
        } else {
          setSelectedRange({ ...selectedRange, end: day });
        }
      }
    }
  };

  const isDateInRetreat = (day: Date) => {
    return groupDatesInMonth.some((rd) =>
      isWithinInterval(day, {
        start: new Date(rd.start_date),
        end: new Date(rd.end_date),
      })
    );
  };

  const getRetreatForDate = (day: Date) => {
    return groupDatesInMonth.find((rd) =>
      isWithinInterval(day, {
        start: new Date(rd.start_date),
        end: new Date(rd.end_date),
      })
    );
  };

  const isDateSelected = (day: Date) => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return isSameDay(day, selectedRange.start);
    return isWithinInterval(day, {
      start: selectedRange.start,
      end: selectedRange.end,
    });
  };

  // Calculate pricing
  const pricing = useMemo(() => {
    if (!selectedRange.start || !selectedRange.end) return null;

    const nights = differenceInDays(selectedRange.end, selectedRange.start);

    if (selectedType === "group") {
      const retreat = getRetreatForDate(selectedRange.start);
      if (!retreat) return null;
      const price = retreat.price_override_usd || groupRetreat?.base_price_usd || 2400;
      return {
        total: price * guestCount,
        deposit: (price * guestCount) / 2,
        nights: 7,
        perUnit: price,
        unitLabel: "per person",
      };
    } else {
      const calc = calculateSoloPrice(nights, pricingTiers);
      if (!calc) return null;
      return {
        total: calc.total * guestCount,
        deposit: (calc.total * guestCount) / 2,
        nights,
        perUnit: calc.nightly,
        unitLabel: "per night",
        discount: calc.discount,
      };
    }
  }, [selectedRange, selectedType, guestCount, pricingTiers, groupRetreat]);

  const whatsappMessage = useMemo(() => {
    if (!selectedRange.start) {
      return encodeURIComponent(
        `Hello, I'm interested in a ${selectedType} retreat. Can you help me find available dates?`
      );
    }
    const startDate = format(selectedRange.start, "MMM d, yyyy");
    const endDate = selectedRange.end
      ? format(selectedRange.end, "MMM d, yyyy")
      : "";
    return encodeURIComponent(
      `Hello, I'm interested in booking a ${selectedType} retreat from ${startDate}${endDate ? ` to ${endDate}` : ""} for ${guestCount} patron(s). Can you provide more details?`
    );
  }, [selectedRange, selectedType, guestCount]);

  return (
    <section id="retreat-calendar" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="section-header mb-4">Check Availability</h2>
          <p className="section-subheader mx-auto">
            Select your dates and view real-time pricing. 50% deposit secures
            your spot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-background rounded-2xl border border-border p-6">
            {/* Type Toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={selectedType === "solo" ? "default" : "outline"}
                onClick={() => {
                  setSelectedType("solo");
                  setSelectedRange({ start: null, end: null });
                }}
                className="flex-1"
              >
                <User className="w-4 h-4 mr-2" />
                Solo Retreat
              </Button>
              <Button
                variant={selectedType === "group" ? "default" : "outline"}
                onClick={() => {
                  setSelectedType("group");
                  setSelectedRange({ start: null, end: null });
                }}
                className="flex-1"
              >
                <Users className="w-4 h-4 mr-2" />
                Group Immersion
              </Button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-xl font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {prefixDays.map((_, i) => (
                <div key={`prefix-${i}`} className="h-12" />
              ))}
              {days.map((day) => {
                const isPast = isBefore(day, today);
                const inRetreat =
                  selectedType === "group" && isDateInRetreat(day);
                const retreat = getRetreatForDate(day);
                const spotsLeft =
                  retreat && retreat.spots_total - retreat.spots_booked;
                const isSelected = isDateSelected(day);
                
                // For solo mode - all future dates are available
                const isSoloAvailable = selectedType === "solo" && !isPast;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    disabled={isPast || (selectedType === "group" && !inRetreat)}
                    className={`
                      h-12 rounded-lg text-sm font-medium transition-all relative
                      ${isPast ? "text-muted-foreground/40 cursor-not-allowed" : ""}
                      ${
                        isSelected
                          ? "bg-[#1F3A2E] text-white"
                          : inRetreat && selectedType === "group"
                            ? spotsLeft !== undefined && spotsLeft <= 3
                              ? "bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30"
                              : "bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/30"
                            : isSoloAvailable
                              ? "bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 cursor-pointer"
                              : ""
                      }
                      ${selectedType === "group" && !inRetreat && !isPast ? "text-muted-foreground" : ""}
                    `}
                  >
                    {format(day, "d")}
                    {/* Spots indicator for group */}
                    {inRetreat &&
                      spotsLeft !== undefined &&
                      isSameDay(day, new Date(retreat!.start_date)) && (
                        <span
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            spotsLeft === 0
                              ? "bg-destructive text-destructive-foreground"
                              : spotsLeft <= 3
                                ? "bg-[#3B82F6] text-white"
                                : "bg-[#22C55E] text-white"
                          }`}
                        >
                          {spotsLeft}
                        </span>
                      )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 text-sm">
              {selectedType === "group" ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#22C55E]/20" />
                    <span className="text-muted-foreground">Available dates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#22C55E] text-[8px] flex items-center justify-center text-white font-bold">
                      5+
                    </div>
                    <span className="text-muted-foreground">Available spots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#3B82F6] text-[8px] flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <span className="text-muted-foreground">Limited spots</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#22C55E]/20" />
                  <span className="text-muted-foreground">Available for solo booking</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#1F3A2E]" />
                <span className="text-muted-foreground">Selected</span>
              </div>
            </div>
          </div>

          {/* Pricing Panel */}
          <div className="bg-background rounded-2xl border border-border p-6">
            <h3 className="text-xl font-bold mb-6">Your Selection</h3>

            {selectedRange.start ? (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">
                      {format(selectedRange.start, "MMM d, yyyy")}
                    </span>
                  </div>
                  {selectedRange.end && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out</span>
                      <span className="font-medium">
                        {format(selectedRange.end, "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {pricing?.nights || "–"} nights
                    </span>
                  </div>

                  {(
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Patrons</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setGuestCount(Math.max(1, guestCount - 1))
                          }
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {guestCount}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setGuestCount(Math.min(10, guestCount + 1))
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {pricing && (
                  <>
                    <div className="border-t border-border pt-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">
                          {formatPrice(pricing.perUnit, pricing.perUnit * EXCHANGE_RATE)} × {pricing.nights}{" "}
                          {pricing.unitLabel === "per person"
                            ? `× ${guestCount} patron${guestCount > 1 ? "s" : ""}`
                            : `nights${guestCount > 1 ? ` × ${guestCount} patrons` : ""}`}
                        </span>
                      </div>
                      {pricing.discount && pricing.discount > 0 && (
                        <Badge variant="secondary" className="mb-2">
                          {pricing.discount}% extended stay discount
                        </Badge>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatPrice(pricing.total, pricing.total * EXCHANGE_RATE)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>50% deposit due now</span>
                        <span>{formatPrice(pricing.deposit, pricing.deposit * EXCHANGE_RATE)}</span>
                      </div>
                    </div>

                    {/* Trust badges */}
                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-success">
                        <span>✓</span>
                        30-day pre-arrival protocol included
                      </div>
                      <div className="flex items-center gap-2 text-success">
                        <span>✓</span>
                        Payment plans available
                      </div>
                      <div className="flex items-center gap-2 text-success">
                        <span>✓</span>
                        100% refundable to{" "}
                        {selectedType === "group" ? "30" : "14"} days
                      </div>
                    </div>
                  </>
                )}

                {/* CTAs */}
                <div className="space-y-3">
                  <Button className="w-full" size="lg" disabled={!pricing}>
                    Secure with 50% Deposit
                  </Button>
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full" size="lg">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Coordinate via WhatsApp
                    </Button>
                  </a>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {selectedType === "group"
                    ? "Select a highlighted date range to view pricing"
                    : "Click a start date, then an end date"}
                </p>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask About Availability
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
