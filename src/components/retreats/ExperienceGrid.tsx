import { Leaf, Heart, UtensilsCrossed, Mountain, BedDouble, Package } from "lucide-react";

const experiences = [
  {
    icon: Leaf,
    title: "Learn",
    subtitle: "Bush Medicine Workshops",
    description: "Harvest herbs from volcanic soil and learn traditional preparation methods passed down through generations.",
  },
  {
    icon: Heart,
    title: "Heal",
    subtitle: "Personal Wellness Sessions",
    description: "One-on-one time with Priest Kailash to develop your personalized wellness approach.",
  },
  {
    icon: UtensilsCrossed,
    title: "Nourish",
    subtitle: "Plant-Based Cuisine",
    description: "Farm-to-table Caribbean meals made with ingredients grown in our volcanic soil gardens.",
  },
  {
    icon: Mountain,
    title: "Explore",
    subtitle: "Volcanic Rainforest",
    description: "Guided walks through lush trails, Sulphur Springs visits, and breathtaking Piton views.",
  },
  {
    icon: BedDouble,
    title: "Rest",
    subtitle: "Traditional Accommodations",
    description: "Comfortable lodging nestled in nature — sleep to the sounds of the rainforest.",
  },
  {
    icon: Package,
    title: "Integrate",
    subtitle: "Take-Home Practices",
    description: "Leave with protocols, formulations, and practices to continue your transformation at home.",
  },
];

export function ExperienceGrid() {
  return (
    <section className="py-24 md:py-28" style={{ background: 'var(--site-bg-primary)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
            Your Transformation Journey
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', maxWidth: '560px', margin: '0 auto' }}>
            Every day is designed to nourish your body, expand your knowledge, and renew your spirit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => {
            const Icon = exp.icon;
            return (
              <div
                key={exp.title}
                className="rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'var(--site-bg-card)',
                  border: '1px solid var(--site-border)',
                  boxShadow: 'var(--site-shadow-card)',
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(188,138,95,0.1)' }}>
                  <Icon className="w-6 h-6" style={{ color: 'var(--site-gold)' }} />
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '12px', color: 'var(--site-gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {exp.title}
                </div>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '22px', color: 'var(--site-text-primary)', marginBottom: '10px' }}>
                  {exp.subtitle}
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-muted)', lineHeight: 1.7 }}>
                  {exp.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
