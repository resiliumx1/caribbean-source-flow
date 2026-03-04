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
    <section className="py-24 md:py-28" style={{ background: '#0f0f0d' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: '#f2ead8', marginBottom: '16px' }}>
            Practical Matters
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: '#8a8070', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
            Everything you need to know before your transformative journey to Mount Kailash.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {practicalTopics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-xl p-8 transition-all duration-300 hover:border-t-2"
              style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)', borderTopColor: 'transparent' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderTopColor = '#c9a84c'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderTopColor = 'transparent'; }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <topic.icon className="w-5 h-5" style={{ color: '#c9a84c' }} />
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: '20px', color: '#f2ead8' }}>
                  {topic.title}
                </h3>
              </div>

              <ul className="space-y-2.5">
                {topic.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#c9a84c' }} />
                    <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: '#f2ead8', lineHeight: 1.6 }}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              {topic.helper && (
                <p className="mt-4 text-sm italic pt-4" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, color: '#8a8070', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
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
