import { MapPin, Backpack, Utensils, Stethoscope, Plane, Calendar, Check } from "lucide-react";

const practicalTopics = [
  {
    id: "location",
    icon: MapPin,
    title: "Location & Getting There",
    points: [
      "Located in Soufrière, St. Lucia, near the Pitons",
      "Airport transfers from Hewanorra (UVF) included",
      "Scenic 90-minute drive through the island's beauty",
      "Private transportation arranged for all guests",
    ],
  },
  {
    id: "packing",
    icon: Backpack,
    title: "What to Pack",
    points: [
      "Comfortable hiking shoes for nature walks",
      "Natural toiletries (no synthetic fragrances)",
      "Lightweight clothing for tropical weather",
      "Journal for reflection and insights",
    ],
    helper: "We provide linens, towels, rain ponchos, and all herbal products.",
  },
  {
    id: "dietary",
    icon: Utensils,
    title: "Dietary Information",
    points: [
      "All meals are strictly ital (plant-based)",
      "No meat, dairy, or processed foods",
      "Ingredients sourced from our volcanic soil gardens",
      "Gluten-free options available upon request",
    ],
    helper: "Please inform us of any allergies during your pre-arrival assessment.",
  },
  {
    id: "medical",
    icon: Stethoscope,
    title: "Medical Considerations",
    points: [
      "Each case evaluated individually",
      "Disclose all medications during pre-arrival assessment",
      "Some pharmaceuticals may require adjustment",
      "We work alongside your physician for safety",
    ],
  },
  {
    id: "travel",
    icon: Plane,
    title: "Travel Requirements",
    points: [
      "Valid passport required for all international guests",
      "Travel insurance with medical evacuation required",
      "No visa needed for most nationalities (90 days)",
      "Recommended providers available upon request",
    ],
  },
  {
    id: "cancellation",
    icon: Calendar,
    title: "Cancellation Policy",
    points: [
      "Group: 100% refund 30+ days before arrival",
      "Group: 50% refund 15-29 days before arrival",
      "Solo: 100% refund 14+ days before arrival",
      "Full credit toward future dates for any cancellation",
    ],
  },
];

export function RetreatFAQ() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
            Practical Matters
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know before your transformative journey to Mount Kailash.
          </p>
        </div>

        {/* 2-Column Card Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {practicalTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-card rounded-xl border border-border p-5 md:p-6 transition-all duration-300 hover:shadow-soft"
            >
              {/* Icon + Title Row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <topic.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground font-serif">
                  {topic.title}
                </h3>
              </div>

              {/* Bullet List */}
              <ul className="space-y-2.5">
                {topic.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-[15px] md:text-base text-foreground leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Helper Text */}
              {topic.helper && (
                <p className="mt-4 text-sm text-muted-foreground italic border-t border-border pt-4">
                  {topic.helper}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
