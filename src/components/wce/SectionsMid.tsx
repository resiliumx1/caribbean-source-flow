import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { dataLayerPush, pixelTrack } from "@/lib/tracking";
import { useWceAttribution } from "./useWceAttribution";
import {
  LeafDivider, LotusMark, CompassMandala, MandalaOuterRing, OrnateFrame, CornerVine,
  EmblemSymposium, EmblemRetreat, EmblemLifecraft, EmblemCeremony,
} from "./ornaments";
import { useWceMedia, useWcePathways } from "./useWceData";
import {
  Reveal, useInView, useParallax, useWceReducedMotion,
  MaskedHeading, ClipReveal, SlideInItem, useCounterRotate, useSectionLift,
} from "./motion";
import { WCE_PATHWAY_EVENT } from "./pathway-select";
import { trackWceCta } from "./cta-tracking";
import {
  FlowerOfLifeField, FlowerOfLifeMark, BotanicalBackdrop, DiamondRule, GoldFlourish,
  LeafIcon, CheckMark, RitualIcon, ConnectionIcon, TransformationIcon, EdgeBleed,
} from "./decor";
import { LoveEmblem } from "./LoveEmblem";
import { WceFormSuccess } from "./FormSuccess";
import retreatImage from "@/assets/wce-retreat-landscape.jpg";

/* ---------------- 5. HIGHLIGHT REELS ---------------- */
export function WceMediaSection() {
  const { data: media } = useWceMedia();
  const lift = useSectionLift<HTMLElement>();

  // Only rows with real footage are worth showing; placeholder rows with no
  // video or thumbnail would render as empty cards, so the section hides instead.
  const reels = (media ?? []).filter((m) => !!m.video_url || !!m.thumbnail_url);
  if (reels.length === 0) return null;

  return (
    <section ref={lift.ref} className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream)", ...lift.style }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <div className="mx-auto max-w-6xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={54} /></Reveal>
        <Reveal><LotusMark size={28} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          lines={["Conference Highlight Reels"]}
          className="mt-8 text-[clamp(1.7rem,4.2vw,2.8rem)] uppercase"
          style={{ color: "var(--wce-forest)", letterSpacing: "0.12em" }}
        />
        <Reveal index={1}>
        <p className="mt-4 text-sm italic" style={{ color: "rgba(26,26,20,0.84)", fontFamily: "var(--wce-display)", fontSize: "1.1rem" }}>
          From previous staging
        </p>
        <LeafDivider className="mt-10" />
        </Reveal>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2">
          {reels.map((m, i) => (
            <ClipReveal
              as="li"
              key={m.id}
              direction={i % 2 === 0 ? "left" : "right"}
              delay={i * 90}
              className="wce-reel group relative overflow-hidden"
              style={{ border: "1px solid rgba(201,162,39,0.65)", borderRadius: "2px", background: "var(--wce-forest-mid)", boxShadow: "0 18px 38px -28px rgba(15,42,29,0.6)" }}
            >
              <a
                href={m.video_url ?? "#"}
                target={m.video_url ? "_blank" : undefined}
                rel={m.video_url ? "noopener noreferrer" : undefined}
                onClick={(e) => {
                  if (!m.video_url) { e.preventDefault(); return; }
                  dataLayerPush("video_play", { video_title: m.title, video_url: m.video_url });
                }}
                aria-label={m.title ? `Play ${m.title}` : "Play highlight reel"}
                className="relative block aspect-[16/9] w-full"
              >
                {m.thumbnail_url ? (
                  <img src={m.thumbnail_url} alt={m.title ?? "Highlight reel"} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div
                    aria-hidden="true"
                    className="h-full w-full"
                    style={{ background: "linear-gradient(150deg, #24452F 0%, #16321F 60%, #0F2A1D 100%)" }}
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="wce-play flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ border: "1px solid var(--wce-gold)", background: "rgba(15,42,29,0.45)", backdropFilter: "blur(2px)" }}
                  >
                    <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true" className="ml-1">
                      <path d="M2 2l14 8-14 8V2z" fill="var(--wce-gold-light)" />
                    </svg>
                  </span>
                </span>
              </a>
              <p
                className="flex items-center justify-center gap-2.5 px-4 py-4 text-[0.875rem] uppercase"
                style={{ color: "var(--wce-cream)", letterSpacing: "0.22em", borderTop: "1px solid rgba(201,162,39,0.3)" }}
              >
                <LeafIcon />
                <span>{m.title}</span>
              </p>
            </ClipReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 6. ACTIVITIES ---------------- */
const ACTIVITIES = [
  { Emblem: EmblemSymposium, label: "Holistic Symposium", copy: "Keynotes, panels & interactive sessions" },
  { Emblem: EmblemRetreat, label: "Fortification Retreat Journey", copy: "Guided daily practices, wellness & adventure" },
  { Emblem: EmblemLifecraft, label: "LifeCraft Experience", copy: "Hands-on workshops & skill building" },
  { Emblem: EmblemCeremony, label: "Special Ceremony", copy: "Sacred rituals & cultural celebration" },
];

export function WceActivitiesSection() {
  const { ref: lineRef, inView: lineIn } = useInView<HTMLSpanElement>();
  const reduced = useWceReducedMotion();
  const lift = useSectionLift<HTMLElement>();
  return (
    <section ref={lift.ref} id="activities" className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream-warm)", ...lift.style }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <BotanicalBackdrop />
      <CornerVine className="pointer-events-none absolute left-0 top-8 opacity-40" />
      <CornerVine flip className="pointer-events-none absolute right-0 top-8 opacity-40" />
      <div className="mx-auto max-w-6xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={54} /></Reveal>
        <Reveal><LotusMark size={28} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          lines={["Caribbean Wellness Experience", "Activities"]}
          className="mt-8 text-[clamp(1.9rem,4.6vw,3rem)]"
          style={{ color: "var(--wce-forest)" }}
        />
        <Reveal index={1}>
        <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.88)" }}>
          A transformational journey of learning, connection, and renewal in Saint Lucia.
        </p>
        <DiamondRule className="mx-auto mt-8 max-w-[11rem]" />
        </Reveal>

        <Reveal index={2}>
          <p className="wce-eyebrow mt-16" style={{ color: "var(--wce-gold-text)", letterSpacing: "0.34em" }}>
            Four Pillars of the Week
          </p>
        </Reveal>

        <div className="relative mt-12">
          <span
            ref={lineRef}
            aria-hidden="true"
            className={`wce-connect-line ${reduced || lineIn ? "is-drawn" : ""} absolute left-[12%] right-[12%] top-11 hidden h-px lg:block`}
            style={{ background: "linear-gradient(to right, transparent, var(--wce-gold), transparent)" }}
          />
          <ul className="relative grid gap-14 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIVITIES.map(({ Emblem, label, copy }, i) => (
              <SlideInItem as="li" key={label} index={i} className="flex flex-col items-center text-center">
                <span
                  className="flex h-[88px] w-[88px] items-center justify-center rounded-full"
                  style={{ background: "#FBF6EA" }}
                >
                  <Emblem delay={i * 150} />
                </span>
                <h3 className="mt-6 text-xl" style={{ color: "var(--wce-forest)" }}>{label}</h3>
                <p className="mt-3 max-w-[15rem] text-sm" style={{ color: "rgba(26,26,20,0.88)" }}>{copy}</p>
              </SlideInItem>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 6b. SPECIAL CEREMONY ---------------- */
export function WceCeremonySection() {
  const medallionRef = useCounterRotate<HTMLSpanElement>(6);
  return (
    <section
      id="ceremony"
      className="relative overflow-hidden px-6 py-24 text-center sm:py-32"
      style={{ background: "var(--wce-forest)" }}
    >
      <EdgeBleed position="top" />
      <span
        ref={medallionRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -ml-[310px] -mt-[310px] will-change-transform"
      >
        <FlowerOfLifeMark size={620} opacity={0.06} />
      </span>
      <CornerVine className="pointer-events-none absolute left-4 top-6 opacity-45" />
      <CornerVine flip className="pointer-events-none absolute right-4 top-6 opacity-45" />

      <div className="relative mx-auto max-w-3xl">
        <Reveal>
          <p className="wce-eyebrow" style={{ color: "var(--wce-gold)" }}>A Sacred Milestone</p>
        </Reveal>

        <DiamondRule className="mx-auto mt-8 max-w-[11rem]" />

        <MaskedHeading
          lines={["Special Ceremony"]}
          className="mt-8 text-[clamp(2rem,5vw,3.4rem)]"
          style={{ color: "var(--wce-cream)" }}
        />

        <MaskedHeading
          as="p"
          lines={["Graduation of The Mount Kailash Herbal", "School of Esoteric Knowledge"]}
          delay={140}
          className="mx-auto mt-5 max-w-2xl italic"
          style={{
            color: "var(--wce-gold-light)",
            fontFamily: "var(--wce-display)",
            fontSize: "clamp(1.15rem, 2.6vw, 1.6rem)",
            lineHeight: 1.45,
          }}
        />

        <DiamondRule className="mx-auto mt-8 max-w-[11rem]" />

        <Reveal index={1}>
          <p className="mx-auto mt-9 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(245,239,224,0.9)" }}>
            We gather to honour the graduating herbal physicians — those who have studied the plants, the soil and
            the discipline of care. The ceremony marks the passing on of traditional knowledge from teacher to
            practitioner, and welcomes a new generation into service.
          </p>
        </Reveal>

        <Reveal index={2}>
          <span className="mt-14 flex justify-center">
            <EmblemCeremony />
          </span>
        </Reveal>

        <Reveal index={3}>
          <span className="mt-12 flex justify-center">
            <LoveEmblem size={320} />
          </span>
        </Reveal>
      </div>
      <EdgeBleed position="bottom" />
    </section>
  );
}

/* ---------------- 7. RETREAT CTA BAND ---------------- */
const RETREAT_POINTS = [
  "Deeper renewal for body, mind & spirit",
  "Guided transformation & daily practices",
  "Sacred teachings & cultural connection",
  "Limited spaces for a personalized journey",
];

const RETREAT_VALUES = [
  { Icon: RitualIcon, label: "Holistic Wellness", copy: "Daily herbal practice, movement and rest" },
  { Icon: ConnectionIcon, label: "Meaningful Connection", copy: "A small circle, shared feasts, real conversation" },
  { Icon: TransformationIcon, label: "Lasting Transformation", copy: "Habits you carry home, not a week you forget" },
];

export function WceRetreatBand() {
  const bandRef = useParallax<HTMLDivElement>(0.18);
  const mandalaRef = useCounterRotate<HTMLSpanElement>(8);
  const outerRingRef = useCounterRotate<HTMLSpanElement>(-14);
  return (
    <section className="relative overflow-hidden px-6 py-28 sm:py-40" style={{ background: "var(--wce-forest-deep, #0B2116)", borderTop: "1px solid rgba(201,162,39,0.45)" }}>
      <EdgeBleed position="top" />
      <div
        ref={bandRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-[25%] inset-x-0 will-change-transform"
        style={{ background: "radial-gradient(70% 60% at 50% 45%, rgba(45,74,53,0.55), transparent 72%)" }}
      />
      {/* Vignette so the gold reads brighter against the deeper forest */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 40%, rgba(4,14,9,0.72) 100%)" }}
      />
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.045} light />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* Left — copy */}
        <div className="text-center lg:text-left">
          <Reveal>
            <p className="wce-eyebrow" style={{ color: "var(--wce-gold)" }}>
              A Sacred Journey
            </p>
          </Reveal>
          <DiamondRule className="mx-auto mt-6 max-w-[11rem] lg:mx-0" />
          <MaskedHeading
            lines={["Apply for the 6 Day Fortification", "Retreat & LifeCraft Experience"]}
            className="mt-7 text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.08]"
            style={{ color: "var(--wce-cream)" }}
          />
          <p
            className="mt-5 italic"
            style={{ color: "var(--wce-gold-light)", fontFamily: "var(--wce-display)", fontSize: "1.3rem" }}
          >
            Step away. Go deeper. Return renewed.
          </p>

          <DiamondRule className="mt-8 max-w-[13rem] lg:mx-0" />

          <ul className="mx-auto mt-9 max-w-md space-y-3.5 text-left">
            {RETREAT_POINTS.map((p, i) => (
              <SlideInItem as="li" key={p} index={i} className="wce-retreat-point flex items-start gap-3 text-sm" style={{ color: "rgba(245,239,224,0.92)" }}>
                <span className="wce-retreat-check"><CheckMark tone="var(--wce-gold-light)" /></span>
                <span>{p}</span>
              </SlideInItem>
            ))}
          </ul>

          <ul className="wce-retreat-values mt-14">
            {RETREAT_VALUES.map(({ Icon, label, copy }, i) => (
              <SlideInItem as="li" key={label} index={i} className="wce-retreat-value">
                <Icon size={30} />
                <span
                  className="mt-4 block text-[0.875rem] font-semibold uppercase"
                  style={{ color: "var(--wce-gold-light)", letterSpacing: "0.2em" }}
                >
                  {label}
                </span>
                <span className="mt-2.5 block text-[0.875rem] leading-relaxed" style={{ color: "rgba(245,239,224,0.82)" }}>
                  {copy}
                </span>
              </SlideInItem>
            ))}
          </ul>

          <Reveal>
            <a
              href="#apply"
              className="wce-btn wce-btn-gold wce-btn-xl mt-14 w-full sm:w-auto"
              onClick={() => trackWceCta("apply", "retreat_section", "Apply for the Retreat")}
            >
              Apply for the Retreat
            </a>
          </Reveal>
        </div>

        {/* Right — landscape image with an overlapping mandala */}
        <div className="relative">
          <ClipReveal
            direction="right"
            className="relative overflow-hidden"
            style={{ border: "1px solid rgba(201,162,39,0.55)", borderRadius: "2px" }}
          >
            <img
              src={retreatImage}
              alt="Saint Lucia retreat landscape at Mount Kailash Rejuvenation Centre"
              className="h-full w-full object-cover"
              style={{ aspectRatio: "4 / 3" }}
              width={1280}
              height={960}
              loading="lazy"
              decoding="async"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(200deg, rgba(11,33,22,0.45), rgba(6,20,13,0.82))" }}
            />
          </ClipReveal>
          {/* Mandala: soft glow, slow spin, plus a counter-rotating outer ring */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(201,162,39,0.24), transparent 68%)", filter: "blur(6px)" }}
          />
          <span
            ref={outerRingRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -ml-[125px] -mt-[125px] will-change-transform"
          >
            <MandalaOuterRing size={250} className="wce-mandala-spin-slow opacity-80" />
          </span>
          <span
            ref={mandalaRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -ml-[95px] -mt-[95px] will-change-transform"
          >
            <CompassMandala className="wce-mandala-spin opacity-90" />
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-5 -top-5 hidden lg:block"
          >
            <FlowerOfLifeMark size={150} opacity={0.12} />
          </span>
          <Reveal className="mt-10 text-center">
            <p className="italic" style={{ color: "rgba(245,239,224,0.88)", fontFamily: "var(--wce-display)", fontSize: "1.15rem" }}>
              Limited spaces. Applications reviewed personally.
            </p>
            <GoldFlourish className="mx-auto mt-5" size={46} />
          </Reveal>
        </div>
      </div>

      <div className="relative mx-auto mt-20 max-w-3xl text-center">
        <LeafDivider className="mx-auto w-full max-w-md" />
        <p className="mt-8 text-[0.875rem] uppercase leading-loose" style={{ color: "rgba(245,239,224,0.86)", letterSpacing: "0.2em" }}>
          Holistic Wellness <span style={{ color: "var(--wce-gold)" }}>|</span> Meaningful Connection{" "}
          <span style={{ color: "var(--wce-gold)" }}>|</span> Lasting Transformation
        </p>
      </div>
    </section>
  );
}

/* ---------------- 8. APPLICATION FORM ---------------- */
type FieldErrors = { full_name?: string; email?: string };

const MIN_FORM_SECONDS = 3; // spam guard: humans take longer than this to fill the form

export function WceApplicationForm() {
  const { data: pathways } = useWcePathways();
  const attribution = useWceAttribution();
  const mountedAt = useRef(Date.now());

  const [values, setValues] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    country: "",
    pathway_interest: "",
    reason: "",
    preferred_contact: "",
    consent_marketing: false,
    company: "", // honeypot — must stay empty
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pathwayFlash, setPathwayFlash] = useState(false);

  // A pathway card CTA (or the sticky bar) can preselect the pathway field.
  useEffect(() => {
    const onSelect = (e: Event) => {
      const key = (e as CustomEvent<string>).detail;
      if (!key) return;
      setValues((v) => ({ ...v, pathway_interest: key }));
      setPathwayFlash(false);
      requestAnimationFrame(() => setPathwayFlash(true));
      window.setTimeout(() => setPathwayFlash(false), 1900);
    };
    window.addEventListener(WCE_PATHWAY_EVENT, onSelect);
    return () => window.removeEventListener(WCE_PATHWAY_EVENT, onSelect);
  }, []);

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    setValues((v) => ({ ...v, [k]: target.type === "checkbox" ? target.checked : target.value }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!values.full_name.trim()) next.full_name = "Please share your name so we know who to greet.";
    if (!values.email.trim()) next.email = "We need an email address to reply to you.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      next.email = "That email address does not look quite right.";
    return next;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    /* --- Spam protection ---------------------------------------------------
       Cloudflare Turnstile needs a site key, which we do not have yet.
       Until one is supplied we use a honeypot field + a minimum time-on-form
       check. TURNSTILE DROP-IN POINT: render <div class="cf-turnstile"
       data-sitekey={TURNSTILE_SITE_KEY} /> above the submit button, and send
       the resulting token to a verifying edge function here.
    ----------------------------------------------------------------------- */
    const elapsed = (Date.now() - mountedAt.current) / 1000;
    if (values.company.trim() || elapsed < MIN_FORM_SECONDS) {
      setSubmitted(true); // silently accept for bots, nothing is stored
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("wce_leads").insert({
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      whatsapp: values.whatsapp.trim() || null,
      country: values.country.trim() || null,
      pathway_interest: values.pathway_interest || null,
      reason: values.reason.trim() || null,
      preferred_contact: values.preferred_contact || null,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      utm_term: attribution.utm_term,
      referral_code: attribution.referral_code,
      landing_path: attribution.landing_path,
      referrer: attribution.referrer,
      user_agent: attribution.user_agent,
      consent_marketing: values.consent_marketing,
      consent_timestamp: values.consent_marketing ? new Date().toISOString() : null,
    });
    setSubmitting(false);

    if (error) {
      setFormError("We could not send your application just now. Please try again in a moment.");
      return;
    }

    dataLayerPush("lead_submit", {
      pathway_interest: values.pathway_interest || null,
      referral_code: attribution.referral_code,
    });
    pixelTrack("Lead", {
      content_name: "WCE 2026 Application",
      pathway_interest: values.pathway_interest || null,
      referral_code: attribution.referral_code,
    });
    setSubmitted(true);
  };

  const contactLabel =
    values.preferred_contact === "whatsapp" ? "WhatsApp"
    : values.preferred_contact === "phone" ? "phone"
    : "email";

  const errStyle: React.CSSProperties = { color: "#F2D98A", opacity: 1 };

  /* Progress hairline: the four fields we need before a useful follow-up call. */
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim());
  const completed = [
    values.full_name.trim().length > 1,
    emailLooksValid,
    !!values.pathway_interest,
    !!values.preferred_contact,
  ].filter(Boolean).length;
  const progress = submitted ? 100 : Math.round((completed / 4) * 100);

  return (
    <section id="apply" className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream)" }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <Reveal
        className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12"
      >
        {/* Left — cream panel */}
        <div
          className="relative flex h-full flex-col justify-center px-9 py-16 text-center sm:px-14 sm:py-20 lg:text-left"
          style={{
            background: "var(--wce-cream-warm)",
            border: "1px solid rgba(201,162,39,0.7)",
            borderRadius: "2px",
            boxShadow: "0 22px 48px -30px rgba(122,96,17,0.4)",
          }}
        >
          <FlowerOfLifeField className="wce-surface-bg absolute inset-0" opacity={0.04} size={96} />
          <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 hidden lg:block">
            <FlowerOfLifeMark size={190} opacity={0.09} />
          </span>
          <CornerVine className="pointer-events-none absolute -left-2 bottom-0 opacity-40" />
          <p className="relative wce-eyebrow" style={{ color: "var(--wce-gold-text)" }}>Caribbean Wellness Saint Lucia 2026</p>
          <h2 className="relative mt-6 text-[clamp(2.05rem,4.6vw,3.05rem)] leading-[1.1]" style={{ color: "var(--wce-forest)", fontFamily: "var(--wce-display)" }}>
            Retreat Application / Lead Form
          </h2>
          <DiamondRule className="relative mt-7 max-w-[9rem] lg:mx-0" />
          <p className="relative mt-7 max-w-md text-sm leading-relaxed lg:mx-0" style={{ color: "rgba(26,26,20,0.88)" }}>
            Tell us about your interest and our team will follow up personally to discuss your goals, confirm
            availability and guide you through the next steps.
          </p>
          <ul className="relative mt-9 flex flex-col items-center gap-3.5 lg:items-start">
            {[
              "A personal response within 48 hours",
              "Limited retreat places each cohort",
              "No obligation — applying simply opens the conversation",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-left text-[0.875rem] leading-relaxed" style={{ color: "rgba(26,26,20,0.9)" }}>
                <span className="mt-1 shrink-0"><CheckMark tone="var(--wce-gold-text)" /></span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <ul className="relative mt-12 flex flex-col items-center gap-5 lg:items-start">
            {["Sacred. Natural. Transformative.", "Holistic Wellness Experiences", "Saint Lucia Awaits You"].map((t) => (
              <li
                key={t}
                className="flex items-center gap-2.5 text-[0.875rem] uppercase leading-relaxed"
                style={{ color: "var(--wce-gold-text)", letterSpacing: "0.18em" }}
              >
                <LeafIcon tone="var(--wce-gold-text)" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — dark form panel */}
        <div
          className="wce-form-panel relative px-8 py-16 sm:px-12 sm:py-20"
          style={{
            background: "var(--wce-forest)",
            border: "1px solid rgba(201,162,39,0.6)",
            borderRadius: "2px",
            boxShadow: "0 26px 54px -32px rgba(15,42,29,0.75)",
          }}
        >
          {/* Completion hairline along the top edge */}
          <span aria-hidden="true" className="wce-form-progress">
            <span style={{ width: `${progress}%` }} />
          </span>
          <OrnateFrame className="wce-form-frame" />
          <FlowerOfLifeField className="wce-surface-bg absolute inset-0" opacity={0.05} light size={110} />
          {/* layout animates the panel height between form and confirmation */}
          <motion.div className="relative" layout style={{ overflow: "hidden" }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
          <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <WceFormSuccess contactLabel={contactLabel} />
            </motion.div>
          ) : (
            <motion.div key="form" exit={{ opacity: 0, y: -14, transition: { duration: 0.3, ease: "easeIn" } }}>
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            {/* Honeypot — hidden from humans, tempting to bots */}
            <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
              <label htmlFor="wce-company">Company</label>
              <input id="wce-company" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={set("company")} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="wce-label" htmlFor="wce-name">Full Name</label>
                <input
                  id="wce-name" className="wce-field" type="text" placeholder="Enter your full name" autoComplete="name"
                  value={values.full_name} onChange={set("full_name")}
                  aria-invalid={!!errors.full_name} aria-describedby={errors.full_name ? "wce-name-err" : undefined}
                />
                {errors.full_name && <p id="wce-name-err" className="mt-2 text-sm" style={errStyle}>{errors.full_name}</p>}
              </div>
              <div>
                <label className="wce-label" htmlFor="wce-email">Email Address</label>
                <input
                  id="wce-email" className="wce-field" type="email" placeholder="Enter your email address" autoComplete="email"
                  value={values.email} onChange={set("email")}
                  aria-invalid={!!errors.email} aria-describedby={errors.email ? "wce-email-err" : undefined}
                />
                {errors.email && <p id="wce-email-err" className="mt-2 text-sm" style={errStyle}>{errors.email}</p>}
              </div>
              <div>
                <label className="wce-label" htmlFor="wce-phone">Phone / WhatsApp</label>
                <input id="wce-phone" className="wce-field" type="tel" placeholder="Enter your phone number" autoComplete="tel"
                  value={values.whatsapp} onChange={set("whatsapp")} />
              </div>
              <div>
                <label className="wce-label" htmlFor="wce-country">Country</label>
                <input id="wce-country" className="wce-field" type="text" placeholder="Enter your country or city" autoComplete="country-name"
                  value={values.country} onChange={set("country")} />
              </div>
              <div>
                <label className="wce-label" htmlFor="wce-pathway">Pathway of interest</label>
                <select
                  id="wce-pathway"
                  className={`wce-field ${pathwayFlash ? "wce-field-flash" : ""}`}
                  value={values.pathway_interest}
                  onChange={set("pathway_interest")}
                >
                  <option value="" disabled>Select your preferred experience</option>
                  {(pathways ?? []).map((p) => (
                    <option key={p.id} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="wce-label" htmlFor="wce-contact">Preferred Contact Method</label>
                <select id="wce-contact" className="wce-field" value={values.preferred_contact} onChange={set("preferred_contact")}>
                  <option value="" disabled>Select your preferred contact method</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone call</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="wce-label" htmlFor="wce-message">What excites you most about the retreat?</label>
                <textarea id="wce-message" className="wce-field" rows={4} placeholder="Share what inspires you"
                  value={values.reason} onChange={set("reason")} />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "rgba(245,239,224,0.92)" }}>
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--wce-gold)]"
                checked={values.consent_marketing} onChange={set("consent_marketing")} />
              <span>Yes, keep me updated about Caribbean Wellness Saint Lucia 2026 and Mount Kailash offerings.</span>
            </label>

            {formError && <p className="text-sm" style={errStyle}>{formError}</p>}

            <button type="submit" className="wce-btn wce-btn-gold wce-shimmer-btn w-full" disabled={submitting} style={submitting ? { opacity: 0.65, cursor: "wait" } : undefined}>
              {submitting ? "Sending your application…" : "Submit Retreat Application"}
            </button>
            <p className="text-center text-[0.875rem]" style={{ color: "rgba(245,239,224,0.84)" }}>
              We respect your privacy. Your information is secure with us.
            </p>
          </form>
            </motion.div>
          )}
          </AnimatePresence>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}
