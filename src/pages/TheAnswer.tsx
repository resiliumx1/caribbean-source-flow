import { useEffect } from "react";
import MKRCHeader from "@/components/mkrc/MKRCHeader";
import MKRCFooter from "@/components/mkrc/MKRCFooter";
import ScrollReveal from "@/components/mkrc/ScrollReveal";
import SectionLabel from "@/components/mkrc/SectionLabel";
import CounterAnimation from "@/components/mkrc/CounterAnimation";
import heroBottle from "@/assets/mkrc-the-answer-bottle.jpg";
import tincture from "@/assets/mkrc-answer-tincture.png";
import heroBg from "@/assets/mkrc-hero-bg.jpg";

const INGREDIENTS = [
  {
    icon: "🌿",
    name: "Fey Duvan (Anamu)",
    latin: "Petiveria alliacea",
    alias: "The Caribbean's Secret Weapon",
    desc: "Used for centuries across the Caribbean and South America to fortify the immune system. Research from Memorial Sloan Kettering confirms its antimicrobial, antiviral, and immunomodulatory properties. Rich in dibenzyl trisulphide — a rare organic sulphur compound that supports your body's natural defenses.",
    tags: ["Antimicrobial", "Antiviral", "Immunomodulatory", "Anti-Inflammatory"],
  },
  {
    icon: "🍃",
    name: "Vervain",
    latin: "Verbena officinalis",
    alias: "The Purifier",
    desc: "A cornerstone of Caribbean herbal tradition, Vervain has been trusted for generations as a powerful cleanser and immune ally. Its antibacterial and antimicrobial properties work in concert with the other ingredients to create a comprehensive shield for your system.",
    tags: ["Antibacterial", "Antimicrobial", "Cleansing", "Traditional Use"],
  },
  {
    icon: "🌱",
    name: "Soursop Leaves",
    latin: "Annona muricata",
    alias: "The Activator",
    desc: "Revered across the Caribbean and Latin America, Soursop leaves activate your immune system at the cellular level through MAP kinase pathways. This isn't folk wisdom alone — modern science is catching up to what Caribbean healers have known for centuries.",
    tags: ["Immune Activation", "Cellular Health", "Antioxidant", "MAP Kinase"],
  },
];

const CRAFT_STEPS = [
  { icon: "🌿", title: "Selection", desc: "Hand-selected roots, leaves, and bark sourced from Saint Lucia's rich botanical landscape." },
  { icon: "💧", title: "Cleaning", desc: "Each herb is meticulously cleaned and prepared by hand." },
  { icon: "🫙", title: "Steeping", desc: "Steeped in organic barley alcohol to extract the full spectrum of medicinal compounds." },
  { icon: "🪵", title: "21 Days in Oak", desc: "Placed in oak barrels for 21 days to mature." },
  { icon: "✨", title: "The Answer", desc: "Delivered as a liquid tincture for rapid, easy absorption." },
];

const BENEFITS = [
  { icon: "🛡️", title: "Immune Fortification", desc: "Daily support that strengthens your body's natural defenses against communicable diseases, including seasonal flu." },
  { icon: "🔥", title: "Anti-Inflammatory", desc: "Herbs with powerful anti-inflammatory, antibacterial, and antimicrobial properties working in synergy." },
  { icon: "🧬", title: "Cellular Health", desc: "Contains compounds traditionally shown to support natural cell death (apoptosis) of mutated cells and promote healthy cellular function." },
  { icon: "🌸", title: "Women's Wellness", desc: "A key component of the Super Female Package — traditionally used to support menstrual health and minimize fibroid symptoms." },
  { icon: "⚡", title: "Rapid Absorption", desc: "Liquid tincture format delivers herbal compounds directly into your system." },
  { icon: "🔄", title: "Daily Prevention", desc: "You don't need to be sick to use The Answer. Take it daily as a preventative measure." },
];

const CERTS = ["Vegan", "Non-GMO", "Hand-Selected", "Chemical-Free", "Made in Saint Lucia", "Premium Quality"];

export default function TheAnswer() {
  useEffect(() => {
    document.title = "The Answer — Nature's Immune Booster Shot | Endorsed by Chronixx | MKRC";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "The Answer is MKRC's best-selling immune system enhancer — a handcrafted herbal tincture endorsed by reggae icon Chronixx. Made in Saint Lucia with Anamu, Vervain & Soursop Leaves. Oak-aged 21 days.");
    // Set MKRC theme
    if (!document.documentElement.getAttribute("data-mkrc-theme")) {
      const stored = localStorage.getItem("mkrc-theme") || "dark";
      document.documentElement.setAttribute("data-mkrc-theme", stored);
    }
  }, []);

  return (
    <div className="mkrc-page mkrc-body">
      <MKRCHeader />

      {/* ===== 1. HERO ===== */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        {/* BG image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBg})`,
            opacity: 0.12,
          }}
        />
        {/* Radial gradients */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, var(--mkrc-glow-green) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, var(--mkrc-glow-gold) 0%, transparent 50%)",
          }}
        />

        <div
          className="relative z-10 mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12"
          style={{ maxWidth: 1200, padding: "120px 24px 80px" }}
        >
          {/* Text */}
          <ScrollReveal>
            <span
              className="mkrc-label inline-block mb-6 px-4 py-2 rounded-full text-xs"
              style={{
                border: "1px solid var(--mkrc-accent-gold)",
                color: "var(--mkrc-accent-gold)",
              }}
            >
              Nature's Booster Shot
            </span>
            <h1
              className="mkrc-display mb-4"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)", lineHeight: 1.05 }}
            >
              <em>The Answer.</em>
            </h1>
            <p
              className="mkrc-display mb-6"
              style={{
                fontSize: "clamp(1rem, 2vw, 1.25rem)",
                fontStyle: "italic",
                color: "var(--mkrc-text-secondary)",
              }}
            >
              21 days in oak. Centuries of Caribbean wisdom. One powerful dose.
            </p>
            <p className="mb-8" style={{ color: "var(--mkrc-text-secondary)" }}>
              Endorsed by <strong style={{ color: "var(--mkrc-accent-gold)" }}>Chronixx</strong>. Trusted by thousands across the Caribbean.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <a
                href="https://mountkailashslu.com/?add-to-cart=90"
                target="_blank"
                rel="noopener noreferrer"
                className="mkrc-btn-primary"
              >
                Get The Answer
              </a>
              <a href="#ingredients" className="mkrc-btn-secondary">
                What's Inside
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Vegan", "Non-GMO", "Chemical-Free", "Made in Saint Lucia"].map((c) => (
                <span
                  key={c}
                  className="mkrc-label text-xs px-3 py-1 rounded-full"
                  style={{
                    border: "1px solid var(--mkrc-border-subtle)",
                    color: "var(--mkrc-text-tertiary)",
                    fontSize: "0.65rem",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {/* Bottle */}
          <ScrollReveal delay={200} className="flex justify-center">
            <div
              className="relative"
              style={{
                filter: "drop-shadow(0 0 60px var(--mkrc-glow-gold))",
              }}
            >
              <img
                src={heroBottle}
                alt="The Answer — MKRC immune system enhancer tincture bottle"
                className="max-w-xs md:max-w-sm lg:max-w-md object-contain"
                style={{ animation: "float 6s ease-in-out infinite" }}
              />
            </div>
          </ScrollReveal>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @media (prefers-reduced-motion: reduce) {
            @keyframes float { 0%, 100% { transform: none; } }
          }
        `}</style>
      </section>

      {/* ===== 2. CHRONIXX ===== */}
      <section style={{ backgroundColor: "var(--mkrc-bg-secondary)", padding: "100px 0" }}>
        <div
          className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative"
          style={{ maxWidth: 1200, padding: "0 24px" }}
        >
          {/* Left decorative */}
          <ScrollReveal className="relative">
            <span
              className="mkrc-display absolute top-0 left-0 select-none pointer-events-none"
              style={{
                fontSize: "clamp(4rem, 10vw, 8rem)",
                color: "var(--mkrc-text-tertiary)",
                opacity: 0.1,
                lineHeight: 1,
              }}
            >
              Chronixx
            </span>
            <div
              className="mt-16 rounded-xl overflow-hidden flex items-center justify-center"
              style={{
                backgroundColor: "var(--mkrc-bg-elevated)",
                minHeight: 320,
                border: "1px solid var(--mkrc-border-subtle)",
              }}
            >
              <p className="mkrc-label text-sm" style={{ color: "var(--mkrc-text-tertiary)" }}>
                Chronixx Photo
              </p>
            </div>
          </ScrollReveal>

          {/* Right content */}
          <ScrollReveal delay={150}>
            <SectionLabel text="The Endorsement" />
            <blockquote
              className="mkrc-display text-2xl md:text-3xl mb-6"
              style={{ fontStyle: "italic", lineHeight: 1.4 }}
            >
              "The Answer is part of my daily ritual. Nature provides everything we need — this is proof of that."
            </blockquote>
            <p className="mb-1" style={{ color: "var(--mkrc-accent-gold)", fontWeight: 600 }}>
              Chronixx
            </p>
            <p className="mb-6 text-sm" style={{ color: "var(--mkrc-text-secondary)" }}>
              Jamaican reggae icon. Grammy-nominated artist. Advocate for natural living.
            </p>
            <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--mkrc-text-secondary)" }}>
              Jamar McNaughton — known to the world as Chronixx — is a leading voice in the Reggae Revival movement. With over 3.4 million monthly Spotify listeners, performances at Glastonbury and The Tonight Show, and lyrics that champion resilience and natural living, his partnership with MKRC is as authentic as the herbs in the bottle.
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">
                  <CounterAnimation target={3.4} decimals={1} suffix="" />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--mkrc-text-secondary)" }}>
                  Million Monthly Listeners
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: "var(--mkrc-accent-gold)" }}>
                  #1
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--mkrc-text-secondary)" }}>
                  Billboard Reggae Albums
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  <CounterAnimation target={2} suffix="x" />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--mkrc-text-secondary)" }}>
                  Tonight Show Appearances
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 3. INGREDIENTS ===== */}
      <section id="ingredients" className="mkrc-section">
        <ScrollReveal className="text-center mb-14">
          <SectionLabel text="What's Inside" showLine={false} />
          <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
            Three Herbs. Centuries of Proof.
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: "var(--mkrc-text-secondary)" }}>
            Every drop of The Answer carries the concentrated power of Caribbean medicinal herbs — selected for their proven ability to strengthen your body's natural defenses.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INGREDIENTS.map((herb, i) => (
            <ScrollReveal key={herb.name} delay={i * 100}>
              <div className="mkrc-card h-full">
                <span className="text-3xl mb-4 block">{herb.icon}</span>
                <h3 className="mkrc-display text-xl mb-1">{herb.name}</h3>
                <p className="mkrc-display text-sm mb-1" style={{ fontStyle: "italic", color: "var(--mkrc-text-tertiary)" }}>
                  {herb.latin}
                </p>
                <p className="mkrc-label text-xs mb-3" style={{ color: "var(--mkrc-accent-gold)", fontSize: "0.65rem" }}>
                  {herb.alias}
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--mkrc-text-secondary)" }}>
                  {herb.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {herb.tags.map((tag) => (
                    <span
                      key={tag}
                      className="mkrc-label text-xs px-2 py-1 rounded"
                      style={{
                        fontSize: "0.6rem",
                        border: "1px solid var(--mkrc-border-subtle)",
                        color: "var(--mkrc-text-tertiary)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== 4. THE CRAFT ===== */}
      <section style={{ backgroundColor: "var(--mkrc-bg-secondary)", padding: "100px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: "0 24px" }}>
          <ScrollReveal className="text-center mb-14">
            <SectionLabel text="The Craft" showLine={false} />
            <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
              From Root to Remedy.
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: "var(--mkrc-text-secondary)" }}>
              Every batch of The Answer is hand-selected, carefully steeped, and aged in oak barrels for 21 days. No shortcuts. No chemicals. Just nature, patience, and precision.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {CRAFT_STEPS.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 100}>
                <div className="text-center">
                  <span className="text-3xl mb-3 block">{step.icon}</span>
                  <span
                    className="mkrc-label text-xs block mb-2"
                    style={{ color: "var(--mkrc-accent-gold)", fontSize: "0.65rem" }}
                  >
                    Step {i + 1}
                  </span>
                  <h3 className="mkrc-display text-lg mb-2">{step.title}</h3>
                  <p className="text-sm" style={{ color: "var(--mkrc-text-secondary)" }}>
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. BENEFITS ===== */}
      <section className="mkrc-section">
        <ScrollReveal className="text-center mb-14">
          <SectionLabel text="Why The Answer" showLine={false} />
          <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
            Your Body's Daily Shield.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {BENEFITS.map((b, i) => (
            <ScrollReveal key={b.title} delay={i * 80}>
              <div className="mkrc-card h-full">
                <span className="text-2xl mb-3 block">{b.icon}</span>
                <h3 className="mkrc-display text-lg mb-2">{b.title}</h3>
                <p className="text-sm" style={{ color: "var(--mkrc-text-secondary)" }}>
                  {b.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Certification strip */}
        <ScrollReveal>
          <div className="flex flex-wrap justify-center gap-4">
            {CERTS.map((c) => (
              <span
                key={c}
                className="mkrc-label text-xs px-4 py-2 rounded-full"
                style={{
                  border: "1px solid var(--mkrc-border-subtle)",
                  color: "var(--mkrc-text-tertiary)",
                  fontSize: "0.65rem",
                }}
              >
                ✓ {c}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ===== 6. HOW TO USE ===== */}
      <section style={{ backgroundColor: "var(--mkrc-bg-secondary)", padding: "100px 0" }}>
        <div
          className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          style={{ maxWidth: 1200, padding: "0 24px" }}
        >
          <ScrollReveal>
            <SectionLabel text="How To Use" />
            <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
              One Dose. Total Protection.
            </h2>
            <p className="mb-8" style={{ color: "var(--mkrc-text-secondary)" }}>
              Taking The Answer is as simple as it gets. No complicated protocols. No meal timing. Just a daily ritual that takes seconds and works for hours.
            </p>
            <div className="flex flex-col gap-6">
              {[
                "Measure your dose.",
                "Choose your method — straight or diluted in water.",
                "Make it daily — consistency is key.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span
                    className="mkrc-label flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      border: "1px solid var(--mkrc-accent-gold)",
                      color: "var(--mkrc-accent-gold)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {i + 1}
                  </span>
                  <p className="pt-1.5">{step}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200} className="flex justify-center">
            <img
              src={tincture}
              alt="The Answer tincture bottle by MKRC"
              className="max-w-[280px] md:max-w-[340px] object-contain"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 7. FINAL CTA ===== */}
      <section id="purchase" className="mkrc-section text-center">
        <ScrollReveal>
          <SectionLabel text="Make It Yours" showLine={false} />
          <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
            Your Body Already Knows How to Heal.<br />Give it The Answer.
          </h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: "var(--mkrc-text-secondary)" }}>
            Join thousands who've made this Caribbean-crafted tincture their daily ritual.
          </p>
          <img
            src={heroBottle}
            alt="The Answer bottle"
            className="max-w-[200px] mx-auto mb-8 object-contain"
          />
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a
              href="https://mountkailashslu.com/?add-to-cart=90"
              target="_blank"
              rel="noopener noreferrer"
              className="mkrc-btn-primary"
            >
              Add to Cart
            </a>
            <a
              href="https://mountkailashslu.com/shop/"
              target="_blank"
              rel="noopener noreferrer"
              className="mkrc-btn-secondary"
            >
              Explore All Products
            </a>
          </div>
          <p className="text-sm" style={{ color: "var(--mkrc-text-secondary)" }}>
            <span style={{ color: "var(--mkrc-accent-gold)" }}>★★★★★</span>{" "}
            Trusted by thousands across the Caribbean and beyond.
          </p>
        </ScrollReveal>
      </section>

      <MKRCFooter />
    </div>
  );
}
