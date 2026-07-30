import { LeafDivider, LotusMark, CompassMandala, CornerVine, EmblemSymposium, EmblemRetreat, EmblemLifecraft, EmblemCeremony } from "./ornaments";
import { useWceMedia, useWcePathways } from "./useWceData";
import { Reveal, useInView, useParallax, useWceReducedMotion } from "./motion";

/* ---------------- 5. HIGHLIGHT REELS ---------------- */
export function WceMediaSection() {
  const { data: media } = useWceMedia();

  return (
    <section className="px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream)" }}>
      <div className="mx-auto max-w-6xl text-center">
        <Reveal><LotusMark size={34} className="mx-auto" /></Reveal>
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

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(media ?? []).map((m, i) => (
            <Reveal
              as="li"
              key={m.id}
              index={i}
              className="wce-reel group relative overflow-hidden"
              style={{ border: "1px solid rgba(201,162,39,0.4)", borderRadius: "3px", background: "var(--wce-forest-mid)" }}
            >
              <div className="relative aspect-[4/3] w-full">
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
                    className="wce-play flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ border: "1px solid var(--wce-gold)", background: "rgba(15,42,29,0.55)" }}
                  >
                    <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
                      <path d="M2 2l14 8-14 8V2z" fill="var(--wce-gold-light)" />
                    </svg>
                  </span>
                </span>
              </div>
              <p
                className="px-4 py-4 text-[0.68rem] uppercase"
                style={{ color: "var(--wce-cream)", letterSpacing: "0.2em", borderTop: "1px solid rgba(201,162,39,0.3)" }}
              >
                {m.title}
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
    <section className="relative overflow-hidden px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream-warm)" }}>
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
export function WceApplicationForm() {
  const { data: pathways } = useWcePathways();

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
        <div className="px-8 py-16 sm:px-14" style={{ background: "var(--wce-forest)" }}>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="wce-label" htmlFor="wce-name">Full Name</label>
                <input id="wce-name" className="wce-field" type="text" placeholder="Enter your full name" autoComplete="name" />
              </div>
              <div>
                <label className="wce-label" htmlFor="wce-email">Email Address</label>
                <input id="wce-email" className="wce-field" type="email" placeholder="Enter your email address" autoComplete="email" />
              </div>
              <div>
                <label className="wce-label" htmlFor="wce-phone">Phone / WhatsApp</label>
                <input id="wce-phone" className="wce-field" type="tel" placeholder="Enter your phone number" autoComplete="tel" />
              </div>
              <div>
                <label className="wce-label" htmlFor="wce-country">Country</label>
                <input id="wce-country" className="wce-field" type="text" placeholder="Enter your country or city" autoComplete="country-name" />
              </div>
            </div>

            <div>
              <label className="wce-label" htmlFor="wce-pathway">Which pathway are you most interested in?</label>
              <select id="wce-pathway" className="wce-field" defaultValue="">
                <option value="" disabled>Select your preferred experience</option>
                {(pathways ?? []).map((p) => (
                  <option key={p.id} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="wce-label" htmlFor="wce-message">What excites you most about the retreat?</label>
              <textarea id="wce-message" className="wce-field" rows={4} placeholder="Share what inspires you" />
            </div>

            <div>
              <label className="wce-label" htmlFor="wce-contact">Preferred Contact Method</label>
              <select id="wce-contact" className="wce-field" defaultValue="">
                <option value="" disabled>Select your preferred contact method</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone call</option>
              </select>
            </div>

            <label className="flex items-start gap-3 text-xs leading-relaxed" style={{ color: "rgba(245,239,224,0.75)" }}>
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--wce-gold)]" />
              <span>Yes, keep me updated about Caribbean Wellness Saint Lucia 2026 and Mount Kailash offerings.</span>
            </label>

            <button type="submit" className="wce-btn wce-btn-gold w-full">Submit Retreat Application</button>
            <p className="text-center text-[0.68rem]" style={{ color: "rgba(245,239,224,0.55)" }}>
              We respect your privacy. Your information is secure with us.
            </p>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
