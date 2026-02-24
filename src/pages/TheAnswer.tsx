import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Leaf, Droplets, Heart, FlaskConical, Sparkles,
  ChevronDown, Star, ArrowRight, CheckCircle2
} from "lucide-react";
import ScrollReveal from "@/components/mkrc/ScrollReveal";
import SectionLabel from "@/components/mkrc/SectionLabel";
import CounterAnimation from "@/components/mkrc/CounterAnimation";
import heroBottle from "@/assets/mkrc-the-answer-bottle.jpg";
import tincture from "@/assets/mkrc-answer-tincture.png";
import heroBg from "@/assets/mkrc-hero-bg.jpg";
import "./TheAnswer.css";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const INGREDIENTS = [
  {
    icon: Leaf,
    name: "Fey Duvan (Anamu)",
    latin: "Petiveria alliacea",
    alias: "The Caribbean's Secret Weapon",
    desc: "Used for centuries across the Caribbean and South America to fortify the immune system. Research confirms its antimicrobial, antiviral, and immunomodulatory properties. Rich in dibenzyl trisulphide (DTS) — a rare organic sulphur compound that supports your body's natural defenses.",
    tags: ["Antimicrobial", "Immunomodulatory", "Anti-inflammatory"],
  },
  {
    icon: FlaskConical,
    name: "Vervain",
    latin: "Verbena officinalis",
    alias: "The Sacred Cleansing Herb",
    desc: "Revered throughout the Caribbean for its potent cleansing and immune-boosting properties. Known for antibacterial and antimicrobial action, Vervain has been a staple in traditional herbal practice for cleansing the blood, calming the nerves, and strengthening the body's resistance against infection.",
    tags: ["Antibacterial", "Blood Cleanser", "Nerve Tonic"],
  },
  {
    icon: Sparkles,
    name: "Soursop Leaves",
    latin: "Annona muricata",
    alias: "Nature's Cellular Guardian",
    desc: "Widely used across the Caribbean and Latin America, soursop leaves enhance immunity through activation of MAP kinase pathways. Traditionally valued for their ability to support cellular health, promote natural apoptosis of mutated cells, and provide a powerful antioxidant shield.",
    tags: ["Immune Enhancer", "Antioxidant", "Cellular Health"],
  },
];

const CRAFT_STEPS = [
  { icon: Leaf, title: "Selection", desc: "Roots, leaves, and bark are hand-selected from trusted Caribbean sources. Only the finest specimens are chosen — each batch begins with intention." },
  { icon: Droplets, title: "Cleaning", desc: "Every herb is meticulously cleaned and prepared by hand. This is not a factory — it is a practice rooted in care and reverence." },
  { icon: FlaskConical, title: "Steeping", desc: "The herbs are steeped in organic barley alcohol, extracting their full spectrum of active compounds and medicinal properties." },
  { icon: Shield, title: "21 Days in Oak", desc: "The tincture rests in oak barrels for three weeks. The oak imparts depth and character while the herbs fully mature and integrate." },
  { icon: Sparkles, title: "Liquid Tincture", desc: "Delivered in liquid form for maximum absorption. One dose. Daily protection. Your immune system, empowered." },
];

const BENEFITS = [
  { icon: Shield, title: "Immune Fortification", desc: "Strengthens and enhances your immune system for daily resistance against infectious and communicable diseases." },
  { icon: Leaf, title: "Anti-Inflammatory", desc: "Powerful anti-inflammatory, antibacterial, and antimicrobial properties combat chronic inflammation at the root." },
  { icon: Heart, title: "Women's Health", desc: "A core component of the Super Female Package — helps prevent excessive menstrual bleeding and minimize fibroid symptoms." },
  { icon: Sparkles, title: "Cellular Health", desc: "Herbs shown to reduce mutated cell growth and initiate natural apoptosis — your body's built-in cleansing mechanism." },
  { icon: Droplets, title: "Easy Absorption", desc: "Liquid tincture format ensures rapid, full-spectrum absorption. Take diluted in water or straight for immediate effect." },
  { icon: FlaskConical, title: "Daily Prevention", desc: "You don't need to be sick to benefit. One dose each day builds a foundation of health that compounds over time." },
];

const CERTS = ["Vegan", "Non-GMO", "Hand-Selected", "Chemical-Free", "Caribbean Hand-Crafted", "Made in Saint Lucia", "Premium Quality"];

const HOWTO_STEPS = [
  { title: "Measure Your Dose", desc: "Use the built-in dropper to measure your daily serving of The Answer." },
  { title: "Dilute or Take Straight", desc: "Add to a glass of water for a milder taste, or take it undiluted for maximum potency." },
  { title: "Make It a Ritual", desc: "Consistency is key. Take The Answer daily to build lasting immunity and protection." },
];

export default function TheAnswer() {
  useEffect(() => {
    document.title = "The Answer — Nature's Immune Booster Shot | Endorsed by Chronixx | MKRC";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "The Answer is MKRC's best-selling immune system enhancer — a handcrafted herbal tincture endorsed by reggae icon Chronixx. Made in Saint Lucia with Anamu, Vervain & Soursop Leaves. Oak-aged 21 days.");
  }, []);

  return (
    <div className="bg-[#0D0D0D] text-[#F5F0E8] min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ===== 1. HERO ===== */}
      <section className="answer-hero">
        <div className="answer-hero__bg" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="answer-hero__gradients" />

        <div className="answer-hero__inner">
          <ScrollReveal>
            <div className="answer-hero__badge mkrc-label">
              <Shield size={14} />
              <span>Endorsed by Chronixx</span>
              <span>·</span>
              <span>Made in Saint Lucia</span>
            </div>
            <h1 className="answer-hero__title mkrc-display">
              The <em>Answer.</em>
            </h1>
            <p className="answer-hero__subtitle mkrc-display">
              21 days in oak. Centuries of Caribbean wisdom. One powerful dose.
            </p>
            <p className="answer-hero__desc">
              Your body already knows how to heal. This hand-crafted herbal tincture — trusted by thousands across the Caribbean and endorsed by <strong>Chronixx</strong> — delivers nature's most potent immune-fortifying herbs straight to your cells. No chemicals. No shortcuts. Just The Answer.
            </p>
            <div className="answer-hero__ctas">
              <Link
                to="/shop/the-answer"
                className="mkrc-btn-primary"
              >
                Get The Answer <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => scrollToSection("ingredients")}
                className="mkrc-btn-secondary"
              >
                Learn What's Inside <ChevronDown size={16} />
              </button>
            </div>
            <div className="answer-hero__certs">
              {["Vegan", "Non-GMO", "Chemical-Free", "Made in Saint Lucia"].map((c) => (
                <span key={c} className="answer-hero__cert-tag mkrc-label">{c}</span>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="answer-hero__bottle">
            <div className="answer-hero__bottle-glow">
              <img
                src={heroBottle}
                alt="The Answer — MKRC immune system enhancer tincture bottle"
                className="answer-hero__bottle-img"
              />
            </div>
          </ScrollReveal>
        </div>

        <button
          className="answer-hero__scroll-hint"
          onClick={() => scrollToSection("chronixx")}
          aria-label="Scroll to learn more"
        >
          <ChevronDown size={20} />
        </button>
      </section>

      {/* ===== 2. CHRONIXX ===== */}
      <section id="chronixx" className="chronixx-section">
        <div className="chronixx-section__inner">
          <ScrollReveal className="relative">
            <SectionLabel text="Artist Endorsement" />
            <span className="chronixx-section__watermark mkrc-display">Chronixx</span>
            <div className="chronixx-section__photo-placeholder">
              <p className="mkrc-label" style={{ fontSize: "0.875rem", color: "var(--mkrc-text-tertiary)" }}>
                Chronixx Photo
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <h2 className="mkrc-display text-3xl md:text-4xl mb-2">Chronixx</h2>
            <p className="chronixx-section__title">
              Jamaican reggae icon · Grammy-nominated artist · Advocate for natural living
            </p>
            <blockquote className="chronixx-section__quote mkrc-display text-2xl md:text-3xl">
              "The Answer is part of my daily ritual. Nature provides everything we need — this is real medicine from real roots, crafted by real people who understand the power of Caribbean herbs."
            </blockquote>
            <p className="chronixx-section__bio">
              With 3.4 million+ monthly Spotify listeners, two Tonight Show appearances, and a Billboard No. 1 Reggae album, Chronixx is a leading voice of the Reggae Revival movement. His commitment to roots culture and natural living makes him an authentic champion for MKRC's mission.
            </p>
            <p className="chronixx-section__note">
              * Quote shown is a placeholder — replace with actual endorsement statement from Chronixx.
            </p>
            <div className="chronixx-section__stats">
              <div>
                <div className="chronixx-section__stat-value">
                  <CounterAnimation target={3.4} decimals={1} suffix="M+" />
                </div>
                <p className="chronixx-section__stat-label">Monthly Listeners</p>
              </div>
              <div>
                <div className="chronixx-section__stat-value" style={{ color: "var(--mkrc-accent-gold)" }}>
                  #1
                </div>
                <p className="chronixx-section__stat-label">Billboard Reggae</p>
              </div>
              <div>
                <div className="chronixx-section__stat-value">
                  <CounterAnimation target={2} suffix="" />
                </div>
                <p className="chronixx-section__stat-label">Tonight Show</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 3. INGREDIENTS ===== */}
      <section id="ingredients" className="ingredients-section">
        <ScrollReveal className="ingredients-section__header">
          <SectionLabel text="What's Inside" showLine={false} />
          <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
            Three Powerhouse Herbs.<br />Centuries of Proof.
          </h2>
          <p className="ingredients-section__desc">
            Every drop of The Answer contains a precise blend of Caribbean medicinal herbs, each chosen for their proven ability to fortify and protect the human body.
          </p>
        </ScrollReveal>

        <div className="ingredients-section__grid">
          {INGREDIENTS.map((herb, i) => (
            <ScrollReveal key={herb.name} delay={i * 120}>
              <div className="mkrc-card ingredient-card">
                <div className="ingredient-card__icon">
                  <herb.icon size={28} />
                </div>
                <h3 className="mkrc-display text-xl mb-1">{herb.name}</h3>
                <p className="ingredient-card__latin mkrc-display">{herb.latin}</p>
                <p className="ingredient-card__alias mkrc-label">{herb.alias}</p>
                <p className="ingredient-card__desc">{herb.desc}</p>
                <div className="ingredient-card__tags">
                  {herb.tags.map((tag) => (
                    <span key={tag} className="ingredient-card__tag mkrc-label">{tag}</span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== 4. THE CRAFT ===== */}
      <section className="craft-section">
        <div className="craft-section__inner">
          <ScrollReveal className="craft-section__header">
            <SectionLabel text="The Craft" showLine={false} />
            <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
              From Root to Remedy.
            </h2>
            <p className="craft-section__desc">
              Every batch of The Answer is hand-selected, carefully steeped, and aged in oak barrels for 21 days. No shortcuts. No chemicals. Just nature, patience, and precision.
            </p>
          </ScrollReveal>

          <ScrollReveal stagger>
            <div className="craft-section__grid">
              {CRAFT_STEPS.map((step, i) => (
                <div key={step.title} className="craft-step">
                  <div className="craft-step__icon">
                    <step.icon size={22} />
                  </div>
                  <span className="craft-step__number mkrc-label">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="craft-step__title mkrc-display text-lg">{step.title}</h3>
                  <p className="craft-step__desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 5. BENEFITS ===== */}
      <section className="benefits-section">
        <ScrollReveal className="benefits-section__header">
          <SectionLabel text="Why The Answer" showLine={false} />
          <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
            Daily Protection.<br />Total Fortification.
          </h2>
          <p className="benefits-section__subtitle">
            You don't need to be sick to use The Answer. Take it daily as a preventative measure — giving your body the natural tools it needs to resist, repair, and thrive.
          </p>
        </ScrollReveal>

        <ScrollReveal stagger>
          <div className="benefits-section__grid">
            {BENEFITS.map((b) => (
              <div key={b.title} className="mkrc-card benefit-card">
                <div className="benefit-card__icon">
                  <b.icon size={24} />
                </div>
                <h3 className="benefit-card__title mkrc-display text-lg">{b.title}</h3>
                <p className="benefit-card__desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <SectionLabel text="Certifications" showLine={false} />
          <div className="benefits-section__certs">
            {CERTS.map((c) => (
              <span key={c} className="benefits-section__cert mkrc-label">
                <CheckCircle2 size={14} /> {c}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ===== 6. HOW TO USE ===== */}
      <section className="howto-section">
        <div className="howto-section__inner">
          <ScrollReveal>
            <SectionLabel text="How to Use" />
            <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
              Simple. Powerful. Daily.
            </h2>
            <p className="mb-8" style={{ color: "var(--mkrc-text-secondary)" }}>
              Take daily. Diluted in water or straight. One dose. Total protection.
            </p>
            <div className="howto-section__steps">
              {HOWTO_STEPS.map((step, i) => (
                <div key={i} className="howto-step">
                  <span className="howto-step__number mkrc-label">{i + 1}</span>
                  <div>
                    <p className="howto-step__title">{step.title}</p>
                    <p className="howto-step__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200} className="howto-section__image">
            <img
              src={tincture}
              alt="The Answer tincture bottle by MKRC"
              className="howto-section__img"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 7. FINAL CTA ===== */}
      <section id="purchase" className="final-cta">
        <ScrollReveal>
          <SectionLabel text="Your Immune System Deserves The Answer" showLine={false} />
          <h2 className="mkrc-display text-3xl md:text-4xl mb-4">
            Join Thousands Who've Made The Answer Their Daily Ritual.
          </h2>
          <div className="final-cta__stars">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill="currentColor" />
            ))}
          </div>
          <p className="final-cta__testimonial">
            "I've been taking The Answer for over a year now. I haven't been sick once. This is real herbal medicine — from people who truly understand the craft."
          </p>
          <p className="final-cta__attribution">— Verified Customer</p>
          <img
            src={heroBottle}
            alt="The Answer bottle"
            className="final-cta__bottle"
          />
          <div className="final-cta__actions">
            <Link
              to="/shop/the-answer"
              className="mkrc-btn-primary"
            >
              Get The Answer Now <ArrowRight size={16} />
            </Link>
            <Link
              to="/shop"
              className="mkrc-btn-secondary"
            >
              Browse All Products
            </Link>
          </div>
          <div className="final-cta__badges">
            {["Vegan", "Non-GMO", "Saint Lucia"].map((b) => (
              <span key={b} className="final-cta__badge mkrc-label">{b}</span>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
