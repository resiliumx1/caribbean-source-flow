import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dataLayerPush, pixelTrack } from "@/lib/tracking";
import { useWceAttribution } from "./useWceAttribution";
import { LeafDivider, LotusMark, CompassMandala, CornerVine, EmblemSymposium, EmblemRetreat, EmblemLifecraft, EmblemCeremony } from "./ornaments";
import { useWceMedia, useWcePathways } from "./useWceData";
import { Reveal, useInView, useParallax, useWceReducedMotion } from "./motion";
import { WCE_PATHWAY_EVENT } from "./pathway-select";
import {
  FlowerOfLifeField, FlowerOfLifeMark, EdgeFoliage, DiamondRule, GoldFlourish,
  LeafIcon, CheckMark, RitualIcon, ConnectionIcon, TransformationIcon,
} from "./decor";
import retreatImage from "@/assets/fortification-retreat.jpg.asset.json";

/* ---------------- 5. HIGHLIGHT REELS ---------------- */
export function WceMediaSection() {
  const { data: media } = useWceMedia();

  // No published rows yet — hide the section entirely rather than showing empty cards.
  if (!media || media.length === 0) return null;

  return (
    <section className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream)" }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} />
      <div className="mx-auto max-w-6xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={54} /></Reveal>
        <Reveal><LotusMark size={28} className="mx-auto mt-3" /></Reveal>
        <Reveal index={1}>
        <h2
          className="mt-8 text-[clamp(1.7rem,4.2vw,2.8rem)] uppercase"
          style={{ color: "var(--wce-forest)", letterSpacing: "0.12em" }}
        >
          Conference Highlight Reels
        </h2>
        <p className="mt-4 text-sm italic" style={{ color: "rgba(26,26,20,0.6)", fontFamily: "var(--wce-display)", fontSize: "1.1rem" }}>
          From previous staging
        </p>
        <LeafDivider className="mt-10" />
        </Reveal>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2">
          {(media ?? []).map((m, i) => (
            <Reveal
              as="li"
              key={m.id}
              index={i}
              className="wce-reel group relative overflow-hidden"
              style={{ border: "1px solid rgba(201,162,39,0.4)", borderRadius: "2px", background: "var(--wce-forest-mid)" }}
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
                className="flex items-center justify-center gap-2.5 px-4 py-4 text-[0.66rem] uppercase"
                style={{ color: "var(--wce-cream)", letterSpacing: "0.22em", borderTop: "1px solid rgba(201,162,39,0.3)" }}
              >
                <LeafIcon />
                <span>{m.title}</span>
              </p>
            </Reveal>
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
  return (
    <section id="activities" className="relative overflow-hidden px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream-warm)" }}>
      <CornerVine className="pointer-events-none absolute left-0 top-8 opacity-40" />
      <CornerVine flip className="pointer-events-none absolute right-0 top-8 opacity-40" />
      <div className="mx-auto max-w-6xl text-center">
        <Reveal><LotusMark size={34} className="mx-auto" /></Reveal>
        <Reveal index={1}>
        <h2 className="mt-8 text-[clamp(1.9rem,4.6vw,3rem)]" style={{ color: "var(--wce-forest)" }}>
          Caribbean Wellness Experience Activities
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.7)" }}>
          A transformational journey of learning, connection, and renewal in Saint Lucia.
        </p>
        </Reveal>

        <div className="relative mt-20">
          <span
            ref={lineRef}
            aria-hidden="true"
            className={`wce-connect-line ${reduced || lineIn ? "is-drawn" : ""} absolute left-[12%] right-[12%] top-11 hidden h-px lg:block`}
            style={{ background: "linear-gradient(to right, transparent, var(--wce-gold), transparent)" }}
          />
          <ul className="relative grid gap-14 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIVITIES.map(({ Emblem, label, copy }, i) => (
              <Reveal as="li" key={label} index={i} className="flex flex-col items-center text-center">
                <span
                  className="flex h-[88px] w-[88px] items-center justify-center rounded-full"
                  style={{ background: "var(--wce-cream-warm)" }}
                >
                  <Emblem delay={i * 150} />
                </span>
                <h3 className="mt-6 text-xl" style={{ color: "var(--wce-forest)" }}>{label}</h3>
                <p className="mt-3 max-w-[15rem] text-sm" style={{ color: "rgba(26,26,20,0.68)" }}>{copy}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
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

export function WceRetreatBand() {
  const bandRef = useParallax<HTMLDivElement>(0.18);
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center sm:py-32" style={{ background: "var(--wce-forest)" }}>
      <div
        ref={bandRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-[25%] inset-x-0 will-change-transform"
        style={{ background: "radial-gradient(70% 60% at 50% 50%, rgba(45,74,53,0.6), transparent 70%)" }}
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
        <CompassMandala className="wce-mandala-spin opacity-90" />
        <Reveal><p className="wce-eyebrow mt-10" style={{ color: "var(--wce-gold)" }}>
          Caribbean Wellness Saint Lucia 2026
        </p></Reveal>
        <Reveal index={1}><h2 className="mt-6 text-[clamp(1.9rem,4.8vw,3.2rem)]" style={{ color: "var(--wce-cream)" }}>
          Apply for the 6 Day Fortification Retreat &amp; LifeCraft Experience
        </h2></Reveal>
        <p className="mt-6 text-base italic" style={{ color: "var(--wce-gold-light)", fontFamily: "var(--wce-display)", fontSize: "1.3rem" }}>
          Step away. Go deeper. Return renewed.
        </p>

        <ul className="mt-12 space-y-4 text-left">
          {RETREAT_POINTS.map((p, i) => (
            <Reveal as="li" key={p} index={i} className="flex items-start gap-3 text-sm" style={{ color: "rgba(245,239,224,0.85)" }}>
              <span aria-hidden="true" style={{ color: "var(--wce-gold)" }}>✦</span>
              <span>{p}</span>
            </Reveal>
          ))}
        </ul>

        <Reveal><a href="#apply" className="wce-btn wce-btn-gold mt-14">Apply for the Retreat</a></Reveal>

        <LeafDivider className="mt-16 w-full max-w-md" />
        <p className="mt-8 text-[0.68rem] uppercase leading-loose" style={{ color: "rgba(245,239,224,0.7)", letterSpacing: "0.2em" }}>
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

  const errStyle: React.CSSProperties = { color: "var(--wce-gold-light)", opacity: 0.85 };

  return (
    <section id="apply" className="px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream)" }}>
      <Reveal className="mx-auto grid max-w-6xl overflow-hidden lg:grid-cols-2" style={{ border: "1px solid rgba(201,162,39,0.4)", borderRadius: "3px" }}>
        {/* Left — cream panel */}
        <div className="relative flex flex-col justify-center px-8 py-16 text-center sm:px-14 lg:text-left" style={{ background: "var(--wce-cream-warm)" }}>
          <CornerVine className="pointer-events-none absolute -left-2 bottom-0 opacity-40" />
          <p className="wce-eyebrow" style={{ color: "var(--wce-gold-deep)" }}>Caribbean Wellness Saint Lucia 2026</p>
          <h2 className="mt-6 text-[clamp(1.9rem,4.4vw,2.9rem)] leading-tight" style={{ color: "var(--wce-forest)" }}>
            Retreat Application / Lead Form
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed lg:mx-0" style={{ color: "rgba(26,26,20,0.7)" }}>
            Tell us about your interest and our team will follow up personally to discuss your goals, confirm
            availability and guide you through the next steps.
          </p>
          <ul className="mt-12 flex flex-wrap justify-center gap-6 lg:justify-start">
            {["Sacred. Natural. Transformative.", "Holistic Wellness Experiences", "Saint Lucia Awaits You"].map((t) => (
              <li
                key={t}
                className="max-w-[10rem] text-[0.6rem] uppercase leading-relaxed"
                style={{ color: "var(--wce-gold-deep)", letterSpacing: "0.18em" }}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — dark form panel */}
        <div className="wce-form-panel px-8 py-16 sm:px-14" style={{ background: "var(--wce-forest)" }}>
          {submitted ? (
            <div className="wce-form-confirm flex min-h-[26rem] flex-col items-center justify-center text-center" role="status" aria-live="polite">
              <LotusMark size={54} />
              <h3 className="mt-8 text-[clamp(1.7rem,3.6vw,2.4rem)]" style={{ color: "var(--wce-cream)" }}>
                Thank You — Your Application Is In
              </h3>
              <p className="mt-6 max-w-sm text-sm leading-relaxed" style={{ color: "rgba(245,239,224,0.8)" }}>
                Our team will be in touch personally by {contactLabel} to talk through your goals and the next
                steps for Caribbean Wellness Saint Lucia 2026.
              </p>
              <LeafDivider className="mt-10 w-full max-w-xs" />
            </div>
          ) : (
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
                {errors.full_name && <p id="wce-name-err" className="mt-2 text-xs" style={errStyle}>{errors.full_name}</p>}
              </div>
              <div>
                <label className="wce-label" htmlFor="wce-email">Email Address</label>
                <input
                  id="wce-email" className="wce-field" type="email" placeholder="Enter your email address" autoComplete="email"
                  value={values.email} onChange={set("email")}
                  aria-invalid={!!errors.email} aria-describedby={errors.email ? "wce-email-err" : undefined}
                />
                {errors.email && <p id="wce-email-err" className="mt-2 text-xs" style={errStyle}>{errors.email}</p>}
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
            </div>

            <div>
              <label className="wce-label" htmlFor="wce-pathway">Which pathway are you most interested in?</label>
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
              <label className="wce-label" htmlFor="wce-message">What excites you most about the retreat?</label>
              <textarea id="wce-message" className="wce-field" rows={4} placeholder="Share what inspires you"
                value={values.reason} onChange={set("reason")} />
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

            <label className="flex items-start gap-3 text-xs leading-relaxed" style={{ color: "rgba(245,239,224,0.75)" }}>
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--wce-gold)]"
                checked={values.consent_marketing} onChange={set("consent_marketing")} />
              <span>Yes, keep me updated about Caribbean Wellness Saint Lucia 2026 and Mount Kailash offerings.</span>
            </label>

            {formError && <p className="text-xs" style={errStyle}>{formError}</p>}

            <button type="submit" className="wce-btn wce-btn-gold w-full" disabled={submitting} style={submitting ? { opacity: 0.65, cursor: "wait" } : undefined}>
              {submitting ? "Sending your application…" : "Submit Retreat Application"}
            </button>
            <p className="text-center text-[0.68rem]" style={{ color: "rgba(245,239,224,0.55)" }}>
              We respect your privacy. Your information is secure with us.
            </p>
          </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
