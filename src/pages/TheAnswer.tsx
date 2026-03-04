import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Leaf, Droplets, Heart, FlaskConical, Sparkles,
  ChevronDown, Star, ArrowRight, CheckCircle2
} from "lucide-react";
import SectionLabel from "@/components/mkrc/SectionLabel";
import CounterAnimation from "@/components/mkrc/CounterAnimation";
import tincture from "@/assets/mkrc-answer-tincture.png";
import heroBottle from "@/assets/mkrc-the-answer-bottle.jpg";
import heroBg from "@/assets/the-answer-hero-chronixx.jpg";
import chronixxPhoto from "@/assets/chronixx-portrait.jpg";
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
    desc: "Used for centuries across the Caribbean and South America to fortify the immune system. Research confirms its antimicrobial, antiviral, and immunomodulatory properties. Rich in dibenzyl trisulphide (DTS) — a rare organic sulphur compound that supports your body's natural defenses.",
    tags: ["Antimicrobial", "Immunomodulatory", "Anti-inflammatory"],
    leafSvg: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c1.5 3 2.5 6 2 9-1 3-3 5-5 6 2-1 4-3 5-6s.5-6-2-9z",
  },
  {
    icon: FlaskConical,
    name: "Vervain",
    latin: "Verbena officinalis",
    alias: "The Sacred Cleansing Herb",
    desc: "Revered throughout the Caribbean for its potent cleansing and immune-boosting properties. Known for antibacterial and antimicrobial action, Vervain has been a staple in traditional herbal practice for cleansing the blood, calming the nerves, and strengthening the body's resistance against infection.",
    tags: ["Antibacterial", "Blood Cleanser", "Nerve Tonic"],
    leafSvg: "M12 2L8 8l-6 2 4 6-1 7 7-3 7 3-1-7 4-6-6-2z",
  },
  {
    icon: Sparkles,
    name: "Soursop Leaves",
    latin: "Annona muricata",
    alias: "Nature's Cellular Guardian",
    desc: "Widely used across the Caribbean and Latin America, soursop leaves enhance immunity through activation of MAP kinase pathways. Traditionally valued for their ability to support cellular health, promote natural apoptosis of mutated cells, and provide a powerful antioxidant shield.",
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

const TESTIMONIALS = [
  {
    initials: "VC",
    quote: "I've been taking The Answer for over a year now. I haven't been sick once. This is real herbal medicine — from people who truly understand the craft.",
    name: "Verified Customer",
    location: "Saint Lucia",
  },
  {
    initials: "M.T.",
    quote: "I've been taking The Answer for 3 months. My energy levels are consistent, my digestion has improved, and I feel grounded every single day. This is the real thing.",
    name: "Marcus T. — Verified Buyer",
    location: "Trinidad & Tobago",
  },
  {
    initials: "S.W.",
    quote: "When Chronixx endorses something, I pay attention. But what kept me was the results. Two weeks in and I could feel the difference. Natural healing actually works.",
    name: "Sandra W. — Verified Buyer",
    location: "United Kingdom",
  },
];

/* ── Component ── */
export default function TheAnswer() {
  const reveal = useRevealObserver();

  useEffect(() => {
    document.title = "The Answer — Nature's Immune Booster Shot | Endorsed by Chronixx | MKRC";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "The Answer is MKRC's best-selling immune system enhancer — a handcrafted herbal tincture endorsed by reggae icon Chronixx. Made in Saint Lucia with Anamu, Vervain & Soursop Leaves. Oak-aged 21 days.");
  }, []);

  return (
    <div className="the-answer-page bg-[#0D0D0D] text-[#f2ead8] min-h-screen">

      {/* ===== 1. HERO ===== */}
      <section className="answer-hero">
        <div className="answer-hero__bg" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="answer-hero__gradients" />
        <div className="answer-hero__inner">
          <div ref={reveal} className="ta-reveal answer-hero__text-col">
            <div className="answer-hero__badge">
              <Shield size={14} />
              <span>Endorsed by Chronixx</span>
              <span>·</span>
              <span>Made in Saint Lucia</span>
            </div>
            <h1 className="answer-hero__title">
              The <em>Answer.</em>
            </h1>
            <p className="answer-hero__subtitle">
              21 days in oak. Centuries of Caribbean wisdom. One powerful dose.
            </p>
            <p className="answer-hero__desc">
              Your body already knows how to heal. This hand-crafted herbal tincture — trusted by thousands across the Caribbean and endorsed by <strong>Chronixx</strong> — delivers nature's most potent immune-fortifying herbs straight to your cells. No chemicals. No shortcuts. Just The Answer.
            </p>
            <div className="answer-hero__ctas">
              <Link to="/shop/the-answer" className="mkrc-btn-primary">
                Get The Answer <ArrowRight size={16} />
              </Link>
              <button onClick={() => scrollToSection("ingredients")} className="mkrc-btn-secondary">
                Learn What's Inside <ChevronDown size={16} />
              </button>
            </div>
            <div className="answer-hero__certs">
              {["Vegan", "Non-GMO", "Chemical-Free", "Made in Saint Lucia"].map((c) => (
                <span key={c} className="answer-hero__cert-tag">{c}</span>
              ))}
            </div>
          </div>
          <div className="answer-hero__bottle-col">
            <img
              src={heroBottle}
              alt="The Answer herbal tincture bottle by MKRC — full bottle view from dropper cap to base"
              className="answer-hero__bottle-img"
              loading="eager"
              fetchPriority="high"
              width={400}
              height={600}
            />
          </div>
        </div>
        <button className="answer-hero__scroll-hint" onClick={() => scrollToSection("chronixx")} aria-label="Scroll to learn more">
          <ChevronDown size={20} />
        </button>
      </section>

      {/* ===== 2. CHRONIXX ===== */}
      <section id="chronixx" className="chronixx-section">
        <div className="chronixx-section__inner">
          <div ref={reveal} className="ta-reveal relative">
            <SectionLabel text="Artist Endorsement" />
            <span className="chronixx-section__watermark">Chronixx</span>
            <div className="chronixx-section__photo-placeholder">
              <img src={chronixxPhoto} alt="Chronixx — Jamaican reggae artist and advocate for natural living" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>

          <div ref={reveal} className="ta-reveal">
            <h2 className="ta-cormorant text-3xl md:text-4xl mb-2 text-[#f2ead8] font-bold">Chronixx</h2>
            <p className="chronixx-section__title">
              Jamaican reggae icon · Grammy-nominated artist · Advocate for natural living
            </p>
            <blockquote className="chronixx-section__quote">
              "The Answer is part of my daily ritual. Nature provides everything we need — this is real medicine from real roots."
            </blockquote>
            <p className="chronixx-section__bio">
              With 3.4 million+ monthly Spotify listeners, two Tonight Show appearances, and a Billboard No. 1 Reggae album, Chronixx is a leading voice of the Reggae Revival movement. His commitment to roots culture and natural living makes him an authentic champion for MKRC's mission.
            </p>
            <p className="chronixx-section__note">
              * Quote shown is a placeholder — replace with actual endorsement statement from Chronixx.
            </p>

            <div className="chronixx-stats-divider" />
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
                  <CounterAnimation target={2} suffix="" />
                </div>
                <p className="chronixx-section__stat-label">Tonight Show</p>
              </div>
            </div>
            <div className="chronixx-stats-divider" />
          </div>
        </div>
      </section>

      {/* ===== 3. INGREDIENTS ===== */}
      <section id="ingredients" className="ingredients-section">
        <div ref={reveal} className="ta-reveal ingredients-section__header">
          <SectionLabel text="What's Inside" showLine={false} />
          <h2 className="ingredients-section__heading">
            Three Powerhouse Herbs.<br />Centuries of Proof.
          </h2>
          <p className="ingredients-section__desc">
            Every drop of The Answer contains a precise blend of Caribbean medicinal herbs, each chosen for their proven ability to fortify and protect the human body.
          </p>
        </div>

        <div className="ingredients-section__grid">
          {INGREDIENTS.map((herb, i) => (
            <div ref={reveal} className="ta-reveal" key={herb.name} style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="ingredient-card">
                {/* Botanical watermark SVG */}
                <svg className="ingredient-card__watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <path d={herb.leafSvg} />
                </svg>
                <div className="ingredient-card__icon">
                  <herb.icon size={28} />
                </div>
                <h3 className="ingredient-card__name">{herb.name}</h3>
                <p className="ingredient-card__latin">{herb.latin}</p>
                <p className="ingredient-card__alias">{herb.alias}</p>
                <p className="ingredient-card__desc">{herb.desc}</p>
                <div className="ingredient-card__tags">
                  {herb.tags.map((tag) => (
                    <span key={tag} className="ingredient-card__tag">{tag}</span>
                  ))}
                </div>
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
            <h2 className="ta-cormorant text-3xl md:text-4xl mb-4 text-[#f2ead8] font-bold">
              From Root to Remedy.
            </h2>
            <p className="craft-section__desc">
              Every batch of The Answer is hand-selected, carefully steeped, and aged in oak barrels for 21 days. No shortcuts. No chemicals. Just nature, patience, and precision.
            </p>
          </div>

          <div ref={reveal} className="ta-reveal craft-timeline">
            {/* Connecting line */}
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
          <h2 className="ta-cormorant text-3xl md:text-4xl mb-4 text-[#f2ead8] font-bold">
            Daily Protection.<br />Total Fortification.
          </h2>
          <p className="benefits-section__subtitle">
            You don't need to be sick to use The Answer. Take it daily as a preventative measure — giving your body the natural tools it needs to resist, repair, and thrive.
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

      {/* ===== 6. HOW TO USE ===== */}
      <section className="howto-section">
        <div className="howto-section__inner">
          <div ref={reveal} className="ta-reveal">
            <SectionLabel text="How to Use" />
            <h2 className="howto-section__heading">
              Simple. Powerful. Daily.
            </h2>
            <p className="howto-section__subtext">
              One dose. Every morning. That's all it takes.
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

      {/* ===== 7. TESTIMONIALS ===== */}
      <section className="testimonials-section">
        <div ref={reveal} className="ta-reveal" style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel text="What People Are Saying" showLine={false} />
          <h2 className="ta-cormorant text-3xl md:text-4xl text-[#f2ead8] font-bold">
            Real Stories. Real Results.
          </h2>
        </div>
        <div className="testimonials-section__grid">
          {TESTIMONIALS.map((t, i) => (
            <div ref={reveal} className="ta-reveal" key={i} style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="testimonial-card">
                <div className="testimonial-card__avatar">{t.initials}</div>
                <div className="testimonial-card__stars">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="testimonial-card__quote">"{t.quote}"</p>
                <p className="testimonial-card__name">{t.name}</p>
                <p className="testimonial-card__location">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 8. FINAL CTA ===== */}
      <section id="purchase" className="final-cta">
        <div ref={reveal} className="ta-reveal">
          <SectionLabel text="Your Immune System Deserves The Answer" showLine={false} />
          <h2 className="ta-cormorant text-3xl md:text-4xl mb-4 text-[#f2ead8] font-bold italic">
            Join Thousands Who've Made The Answer Their Daily Ritual.
          </h2>
          <img src={heroBottle} alt="The Answer bottle" className="final-cta__bottle" />
          <div className="final-cta__badges">
            {["Vegan", "Non-GMO", "Saint Lucia"].map((b) => (
              <span key={b} className="final-cta__badge">{b}</span>
            ))}
          </div>
          <Link to="/shop/the-answer" className="final-cta__main-btn">
            Get The Answer Now <ArrowRight size={16} />
          </Link>
          <p className="final-cta__sub">
            Free shipping on orders over $75 · Secure checkout
          </p>
        </div>
      </section>
    </div>
  );
}
