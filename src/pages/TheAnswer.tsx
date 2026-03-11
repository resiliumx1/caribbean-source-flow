import { useEffect, useRef, useCallback, useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import {
  Shield, Leaf, Droplets, Heart, FlaskConical, Sparkles,
  ChevronDown, Star, ArrowRight, CheckCircle2, MapPin
} from "lucide-react";
import SectionLabel from "@/components/mkrc/SectionLabel";
import CounterAnimation from "@/components/mkrc/CounterAnimation";
import tincture from "@/assets/mkrc-answer-tincture.png";
import heroBottle from "@/assets/the-answer-chronixx-bottle.webp";
// chronixxPhoto removed — hero now uses bottle as full background
import "./TheAnswer.css";

/* ── Scroll helpers ── */
const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

function useRevealObserver() {
  const observed = useRef(new Set<Element>());
  const observe = useCallback((el: HTMLElement | null) => {
    if (!el || observed.current.has(el)) return;
    observed.current.add(el);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("ta-visible");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("ta-visible");
          io.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
  }, []);
  return observe;
}

/* ── Data ── */
const INGREDIENTS = [
  {
    icon: Leaf,
    name: "Fey Duvan (Anamu)",
    latin: "Petiveria alliacea",
    alias: "The Caribbean's Secret Weapon",
    shortDesc: "Used for centuries across the Caribbean to fortify the immune system. Rich in dibenzyl trisulphide (DTS) — a rare organic sulphur compound.",
    fullDesc: "Research confirms its antimicrobial, antiviral, and immunomodulatory properties. Traditionally harvested from wild populations in St. Lucia's volcanic rainforest, this herb forms the backbone of The Answer's immune-fortifying power.",
    tags: ["Antimicrobial", "Immunomodulatory", "Anti-inflammatory"],
    leafSvg: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c1.5 3 2.5 6 2 9-1 3-3 5-5 6 2-1 4-3 5-6s.5-6-2-9z",
  },
  {
    icon: FlaskConical,
    name: "Vervain",
    latin: "Verbena officinalis",
    alias: "The Sacred Cleansing Herb",
    shortDesc: "Revered throughout the Caribbean for its potent cleansing and immune-boosting properties. A staple in traditional herbal practice.",
    fullDesc: "Known for antibacterial and antimicrobial action, Vervain has been used for generations to cleanse the blood, calm the nerves, and strengthen the body's resistance against infection. Wildcrafted within 6 hours of harvest for maximum alkaloid retention.",
    tags: ["Antibacterial", "Blood Cleanser", "Nerve Tonic"],
    leafSvg: "M12 2L8 8l-6 2 4 6-1 7 7-3 7 3-1-7 4-6-6-2z",
  },
  {
    icon: Sparkles,
    name: "Soursop Leaves",
    latin: "Annona muricata",
    alias: "Nature's Cellular Guardian",
    shortDesc: "Widely used across the Caribbean and Latin America to enhance immunity through activation of MAP kinase pathways.",
    fullDesc: "Traditionally valued for supporting cellular health, promoting natural apoptosis of mutated cells, and providing a powerful antioxidant shield. The leaves are hand-selected at peak potency from trees growing in St. Lucia's mineral-rich volcanic soil.",
    tags: ["Immune Enhancer", "Antioxidant", "Cellular Health"],
    leafSvg: "M17 8C8 10 5.9 16.9 3.9 19.9M5 2l3 6-2 8 4 4 8-2 4-8-4-6z",
  },
];

const CRAFT_STEPS = [
  { icon: Leaf, title: "Selection", desc: "Roots, leaves, and bark hand-selected from trusted Caribbean sources." },
  { icon: Droplets, title: "Cleaning", desc: "Every herb meticulously cleaned and prepared by hand." },
  { icon: FlaskConical, title: "Steeping", desc: "Steeped in organic barley alcohol, extracting full-spectrum compounds." },
  { icon: Shield, title: "21 Days in Oak", desc: "The tincture rests in oak barrels for three weeks of maturation." },
  { icon: Sparkles, title: "Liquid Tincture", desc: "Delivered in liquid form for maximum absorption. One dose. Daily." },
];

const BENEFITS = [
  { icon: Shield, title: "Immune Fortification", desc: "Strengthens your immune system for daily resistance against infectious and communicable diseases." },
  { icon: Leaf, title: "Anti-Inflammatory", desc: "Powerful anti-inflammatory, antibacterial, and antimicrobial properties combat chronic inflammation at the root." },
  { icon: Heart, title: "Women's Health", desc: "A core component of the Super Female Package — helps prevent excessive menstrual bleeding and minimize fibroid symptoms." },
  { icon: Sparkles, title: "Cellular Health", desc: "Herbs shown to reduce mutated cell growth and initiate natural apoptosis — your body's built-in cleansing mechanism." },
  { icon: Droplets, title: "Easy Absorption", desc: "Liquid tincture format ensures rapid, full-spectrum absorption. Take diluted in water or straight for immediate effect." },
  { icon: FlaskConical, title: "Daily Prevention", desc: "You don't need to be sick to benefit. One dose each day builds a foundation of health that compounds over time." },
];

const CERTS = ["Vegan", "Non-GMO", "Hand-Selected", "Chemical-Free", "Caribbean Hand-Crafted", "Made in Saint Lucia", "Premium Quality"];

const HOWTO_STEPS = [
  { title: "Mix with Dawn", desc: "Use the built-in dropper. Add to a ceramic cup of warm water. Watch the golden swirl dissolve — that's centuries of wisdom meeting your morning." },
  { title: "Or Take It Bold", desc: "Place directly under the tongue for maximum potency. The earthy warmth is the oak and roots speaking. Let it sit for 30 seconds." },
  { title: "Make It Sacred", desc: "Consistency is the covenant. One dose. Every morning. Let it become the ritual your body expects — the daily fortification it deserves." },
];

const TESTIMONIALS = [
  {
    initials: "V.C.",
    quote: "Three months, three international flights, zero sick days. I used to catch everything on planes. Now? Nothing touches me. This is real herbal medicine — from people who truly understand the craft.",
    name: "V.C.",
    location: "Castries, Saint Lucia",
    flag: "🇱🇨",
  },
  {
    initials: "M.T.",
    quote: "My morning bloat is just... gone. Energy is consistent, no 2pm crash, and I feel grounded every single day. I tell everyone back home — this is the real thing from the real island.",
    name: "Marcus T.",
    location: "Port of Spain, Trinidad",
    flag: "🇹🇹",
  },
  {
    initials: "S.W.",
    quote: "When Chronixx endorses something, I pay attention. But what kept me was the results. Two weeks in and the difference was undeniable. My whole family is on it now.",
    name: "Sandra W.",
    location: "London, United Kingdom",
    flag: "🇬🇧",
  },
];

/* ── Component ── */
export default function TheAnswer() {
  const reveal = useRevealObserver();
  const [expandedHerb, setExpandedHerb] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {};
  }, []);

  return (
    <div className="the-answer-page min-h-screen">
      <SEOHead title="The Answer — Caribbean Immune Elixir | Endorsed by Chronixx | Mount Kailash" description="The Answer is MKRC's best-selling immune system enhancer — a handcrafted herbal tincture endorsed by Chronixx. Made in Saint Lucia with Anamu, Vervain & Soursop. Oak-aged 21 days." path="/the-answer" />

      {/* ===== 1. GALLERY HERO: Bottle as Sculpture ===== */}
      <section className="answer-hero">
        {/* Left: Story Stack */}
        <div className="answer-hero__story-side">
          <div ref={reveal} className="ta-reveal answer-hero__story-inner">
            <h1 className="answer-hero__title">
              The <em>Answer.</em>
            </h1>
            <p className="answer-hero__subtitle">
              The Caribbean Immune Elixir — 21 Days Oak-Aged
            </p>
            <p className="answer-hero__desc">
              Daily defense, steeped in oak &amp; roots. A centuries-old Caribbean wellness secret — nature's most potent immune-fortifying herbs, hand-selected and oak-aged to perfection.
            </p>
            <div className="answer-hero__ctas">
              <Link to="/shop/the-answer" className="answer-hero__btn-primary">
                Start Your 21-Day Ritual <ArrowRight size={16} />
              </Link>
              <button onClick={() => scrollToSection("meet-the-herbs")} className="answer-hero__btn-secondary">
                Meet the Herbs <ChevronDown size={16} />
              </button>
            </div>
            <p className="answer-hero__whisper">
              Endorsed by Chronixx · 3.4M+ Monthly Listeners
            </p>
          </div>
        </div>

        {/* Right: Bottle Sculpture */}
        <div className="answer-hero__bottle-side">
          <img
            src={heroBottle}
            alt="The Answer — Oak-Aged Caribbean Immune Elixir bottle"
            className="answer-hero__bottle-img"
          />
        </div>

        <button className="answer-hero__scroll-hint" onClick={() => scrollToSection("trust-bar")} aria-label="Scroll to learn more">
          <ChevronDown size={20} />
        </button>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section id="trust-bar" className="answer-trust-bar">
        <div className="answer-trust-bar__inner">
          <span>$45.00</span>
          <span className="answer-trust-bar__dot">·</span>
          <span>Free Shipping Over $75</span>
          <span className="answer-trust-bar__dot">·</span>
          <span>30-Day Satisfaction Guarantee</span>
          <span className="answer-trust-bar__dot">·</span>
          <span>Subscribe &amp; Save 15%</span>
        </div>
      </section>

      {/* ===== 2. CHRONIXX STATS ===== */}
      <section id="chronixx" className="chronixx-section">
        <div className="chronixx-section__inner">
          <div ref={reveal} className="ta-reveal chronixx-section__content">
            <p className="chronixx-section__context">
              When the voice of the Reggae Revival chooses nature over pharmaceuticals, the world listens.
            </p>
            <div className="chronixx-section__stats">
              <div className="chronixx-stat-card">
                <div className="chronixx-section__stat-value">
                  <CounterAnimation target={3.4} decimals={1} suffix="M+" />
                </div>
                <p className="chronixx-section__stat-label">Monthly Listeners</p>
              </div>
              <div className="chronixx-stat-card">
                <div className="chronixx-section__stat-value">#1</div>
                <p className="chronixx-section__stat-label">Billboard Reggae</p>
              </div>
              <div className="chronixx-stat-card">
                <div className="chronixx-section__stat-value">
                  <CounterAnimation target={300} suffix="+" />
                </div>
                <p className="chronixx-section__stat-label">Live Shows</p>
              </div>
            </div>
            <span className="chronixx-section__location-stamp">Kingston, Jamaica</span>
          </div>
        </div>
      </section>

      {/* ===== 3. MEET THE HERBS ===== */}
      <section id="meet-the-herbs" className="ingredients-section">
        <div ref={reveal} className="ta-reveal ingredients-section__header">
          <SectionLabel text="Meet the Herbs" showLine={false} />
          <h2 className="ingredients-section__heading">
            Three Powerhouse Herbs.<br />Centuries of Proof.
          </h2>
          <p className="ingredients-section__desc">
            Every drop of The Answer contains a precise blend of Caribbean medicinal herbs, each chosen for their proven ability to fortify and protect.
          </p>
        </div>

        <div className="ingredients-section__grid">
          {INGREDIENTS.map((herb, i) => (
            <div ref={reveal} className="ta-reveal" key={herb.name} style={{ transitionDelay: `${i * 120}ms` }}>
              <div
                className={`ingredient-card ${expandedHerb === i ? "ingredient-card--expanded" : ""}`}
                onClick={() => setExpandedHerb(expandedHerb === i ? null : i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setExpandedHerb(expandedHerb === i ? null : i)}
              >
                <svg className="ingredient-card__watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <path d={herb.leafSvg} />
                </svg>
                <div className="ingredient-card__icon">
                  <herb.icon size={28} />
                </div>
                <h3 className="ingredient-card__name">{herb.name}</h3>
                <p className="ingredient-card__latin">{herb.latin}</p>
                <p className="ingredient-card__alias">{herb.alias}</p>
                <p className="ingredient-card__desc">{herb.shortDesc}</p>

                {/* Expandable details */}
                <div className="ingredient-card__expand">
                  <p className="ingredient-card__full-desc">{herb.fullDesc}</p>
                  <div className="ingredient-card__tags">
                    {herb.tags.map((tag) => (
                      <span key={tag} className="ingredient-card__tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <span className="ingredient-card__toggle">
                  {expandedHerb === i ? "Less" : "Discover more"} <ChevronDown size={14} className={`ingredient-card__chevron ${expandedHerb === i ? "ingredient-card__chevron--open" : ""}`} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 4. THE CRAFT — TIMELINE ===== */}
      <section className="craft-section">
        <div className="craft-section__inner">
          <div ref={reveal} className="ta-reveal craft-section__header">
            <SectionLabel text="The Craft" showLine={false} />
            <h2 className="ta-cormorant text-3xl md:text-4xl mb-4 font-bold" style={{ color: "#f2ead8" }}>
              From Root to Remedy.
            </h2>
            <p className="craft-section__desc">
              Every batch is hand-selected, carefully steeped, and aged in oak barrels for 21 days. No shortcuts. No chemicals. Just nature, patience, and precision.
            </p>
          </div>

          <div ref={reveal} className="ta-reveal craft-timeline">
            <svg className="craft-timeline__line hidden md:block" style={{ width: "100%", height: "4px", overflow: "visible" }} preserveAspectRatio="none">
              <line x1="10%" y1="1" x2="90%" y2="1" className="craft-timeline__line-bg" strokeWidth="2" />
              <line x1="10%" y1="1" x2="90%" y2="1" className="craft-timeline__line-progress" strokeWidth="2" />
            </svg>

            {CRAFT_STEPS.map((step, i) => (
              <div key={step.title} className="craft-step">
                <div className="craft-step__circle">
                  <step.icon size={22} />
                </div>
                <span className="craft-step__number">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="craft-step__title">{step.title}</h3>
                <p className="craft-step__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. BENEFITS ===== */}
      <section className="benefits-section">
        <div ref={reveal} className="ta-reveal benefits-section__header">
          <SectionLabel text="Why The Answer" showLine={false} />
          <h2 className="ta-cormorant text-3xl md:text-4xl mb-4 font-bold" style={{ color: "#f2ead8" }}>
            Daily Protection.<br />Total Fortification.
          </h2>
          <p className="benefits-section__subtitle">
            You don't need to be sick to use The Answer. Take it daily — giving your body the natural tools it needs to resist, repair, and endure.
          </p>
        </div>

        <div className="benefits-section__grid ta-stagger">
          {BENEFITS.map((b, i) => (
            <div ref={reveal} className="ta-reveal" key={b.title} style={{ "--i": i } as React.CSSProperties}>
              <div className="benefit-card">
                <div className="benefit-card__icon">
                  <b.icon size={32} />
                </div>
                <h3 className="benefit-card__title">{b.title}</h3>
                <p className="benefit-card__desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div ref={reveal} className="ta-reveal">
          <SectionLabel text="Certifications" showLine={false} />
          <div className="benefits-section__certs">
            {CERTS.map((c) => (
              <span key={c} className="benefits-section__cert">
                <CheckCircle2 size={14} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. THE RITUAL (How to Use) ===== */}
      <section className="howto-section">
        <div className="howto-section__inner">
          <div ref={reveal} className="ta-reveal">
            <SectionLabel text="The Ritual" />
            <h2 className="howto-section__heading">
              Simple. Powerful. Daily.
            </h2>
            <p className="howto-section__subtext">
              One dose. Every morning. For life.
            </p>
            <div className="howto-section__steps">
              {HOWTO_STEPS.map((step, i) => (
                <div key={i} className="howto-step">
                  <span className="howto-step__number">{i + 1}</span>
                  <div>
                    <p className="howto-step__title">{step.title}</p>
                    <p className="howto-step__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div ref={reveal} className="ta-reveal howto-section__image">
            <div className="howto-section__image-glow">
              <img src={tincture} alt="The Answer tincture bottle by MKRC" className="howto-section__img" />
              <span className="howto-section__float-badge">✦ 21 Days Steeped in Oak</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. TESTIMONIALS — Geographic Social Proof ===== */}
      <section className="testimonials-section">
        <div ref={reveal} className="ta-reveal" style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel text="From the Caribbean to the World" showLine={false} />
          <h2 className="ta-cormorant text-3xl md:text-4xl font-bold" style={{ color: "#f2ead8" }}>
            Real Stories. Real Roots.
          </h2>
        </div>
        <div className="testimonials-section__grid">
          {TESTIMONIALS.map((t, i) => (
            <div ref={reveal} className="ta-reveal" key={i} style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="testimonial-card">
                <div className="testimonial-card__avatar">
                  <span>{t.flag}</span>
                </div>
                <div className="testimonial-card__stars">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="testimonial-card__quote">"{t.quote}"</p>
                <p className="testimonial-card__name">{t.name}</p>
                <p className="testimonial-card__location">
                  <MapPin size={12} /> {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 8. THE COVENANT — Final CTA ===== */}
      <section id="purchase" className="final-cta">
        <div ref={reveal} className="ta-reveal">
          <SectionLabel text="The Covenant" showLine={false} />
          <h2 className="ta-cormorant text-3xl md:text-5xl mb-4 font-bold italic" style={{ color: "#f2ead8" }}>
            Your Immune System Deserves The Answer.
          </h2>
          <p className="final-cta__oath">One dose. Every morning. For life.</p>
          <img src={tincture} alt="The Answer bottle" className="final-cta__bottle" />
          <div className="final-cta__badges">
            {["Vegan", "Non-GMO", "Made in Saint Lucia"].map((b) => (
              <span key={b} className="final-cta__badge">{b}</span>
            ))}
          </div>
          <Link to="/shop/the-answer" className="final-cta__main-btn">
            Begin the Ritual — $45 <ArrowRight size={16} />
          </Link>
          <p className="final-cta__risk">
            Not satisfied? Keep the bottle. We'll refund your peace of mind.
          </p>
          <p className="final-cta__sub">
            Free shipping on orders over $75 · Secure checkout · Subscribe &amp; Save 15%
          </p>
        </div>
      </section>
    </div>
  );
}
