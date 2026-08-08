/** Fortification Retreat detail blocks: who it is for, the 21-day arc,
 *  what is included, and accommodation & investment — plus the closing band.
 *  The retreat is never presented as purchasable: every CTA leads to the
 *  application form, which the Mount Kailash team reviews before payment. */
import { LeafDivider, LotusMark, CornerVine } from "./ornaments";
import { Reveal, MaskedHeading, SlideInItem, useSectionLift } from "./motion";
import {
  FlowerOfLifeField, FlowerOfLifeMark, BotanicalBackdrop, GoldFlourish, DiamondRule,
  CheckMark, LeafIcon, EdgeBleed,
} from "./decor";
import { trackWceCta } from "./cta-tracking";

/* ---------------- Who this is for ---------------- */
const WHO_FOR = [
  "People carrying long-term stress, fatigue or burnout who want structure, not another quick fix",
  "People ready to rebuild their relationship with food, herbs, rest and daily discipline",
  "Practitioners, carers and professionals who spend their days pouring into others",
  "Anyone drawn to the Caribbean, its plants and its traditions who wants to learn in place",
  "People willing to be guided — to follow a shared rhythm for six days and carry it home",
];

const NOT_FOR =
  "This is not a medical programme, a clinical detox or a party week. It does not diagnose, treat, cure or prevent disease, and it is not a substitute for the care of a qualified healthcare provider.";

export function WceWhoForSection() {
  const lift = useSectionLift<HTMLElement>();
  return (
    <section
      ref={lift.ref}
      id="who-for"
      className="wce-surface px-6 py-24 sm:py-32"
      style={{ background: "var(--wce-cream)", ...lift.style }}
    >
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <div className="mx-auto max-w-4xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={54} /></Reveal>
        <MaskedHeading
          lines={["Who This Is For"]}
          className="mt-8 text-[clamp(1.9rem,4.6vw,3rem)]"
          style={{ color: "var(--wce-forest)" }}
        />
        <Reveal index={1}><DiamondRule className="mx-auto mt-8 max-w-[11rem]" /></Reveal>

        <ul className="mx-auto mt-12 max-w-2xl space-y-4 text-left">
          {WHO_FOR.map((t, i) => (
            <SlideInItem as="li" key={t} index={Math.min(i, 5)} className="flex items-start gap-3 text-sm leading-relaxed sm:text-base" style={{ color: "rgba(26,26,20,0.9)" }}>
              <span className="mt-1 shrink-0"><CheckMark tone="var(--wce-gold-text)" /></span>
              <span>{t}</span>
            </SlideInItem>
          ))}
        </ul>

        <Reveal index={2}>
          <p
            className="mx-auto mt-12 max-w-2xl px-6 py-6 text-sm leading-relaxed"
            style={{
              color: "rgba(26,26,20,0.86)",
              background: "var(--wce-cream-warm)",
              border: "1px solid rgba(201,162,39,0.5)",
              borderRadius: "2px",
            }}
          >
            {NOT_FOR}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- The 21-day arc ---------------- */
const ARC = [
  {
    step: "Days 1–6",
    title: "Six days at Mount Kailash",
    copy: "Guided practice, plant-based feasts, herbs, movement, rest and community in the volcanic highlands, October 12–17.",
  },
  {
    step: "Days 7–14",
    title: "Carrying it home",
    copy: "A guided framework for re-entry: keeping the rhythm of food, herbs and daily discipline once ordinary life resumes.",
  },
  {
    step: "Days 15–21",
    title: "Making it ordinary",
    copy: "The final stretch of the tracker, where the practices settle into habit rather than memory of a good week.",
  },
];

export function WceArcSection() {
  return (
    <section
      id="arc"
      className="relative overflow-hidden px-6 py-24 text-center sm:py-32"
      style={{ background: "var(--wce-forest)" }}
    >
      <EdgeBleed position="top" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <FlowerOfLifeMark size={520} opacity={0.06} />
      </span>
      <div className="relative mx-auto max-w-5xl">
        <Reveal>
          <p className="wce-eyebrow" style={{ color: "var(--wce-gold)" }}>Six Days Away · Twenty-One Days of Change</p>
        </Reveal>
        <MaskedHeading
          lines={["The 21-Day Arc"]}
          className="mt-8 text-[clamp(2rem,5vw,3.4rem)]"
          style={{ color: "var(--wce-cream)" }}
        />
        <Reveal index={1}>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(245,239,224,0.9)" }}>
            The retreat does not end at the gate. Participants leave with a guided continuation framework and tracker
            that carries selected practices through to day 21. Final delivery details are shared during the retreat.
          </p>
          <DiamondRule className="mx-auto mt-10 max-w-[13rem]" />
        </Reveal>

        <ol className="mt-14 grid gap-6 text-left sm:grid-cols-3">
          {ARC.map((a, i) => (
            <SlideInItem
              as="li"
              key={a.step}
              index={i}
              className="px-7 py-9"
              style={{ border: "1px solid rgba(201,162,39,0.45)", borderRadius: "2px", background: "rgba(11,33,22,0.55)" }}
            >
              <p className="text-[0.8rem] uppercase" style={{ color: "var(--wce-gold)", letterSpacing: "0.22em" }}>{a.step}</p>
              <h3 className="mt-4 text-xl" style={{ color: "var(--wce-cream)", fontFamily: "var(--wce-display)" }}>{a.title}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(245,239,224,0.84)" }}>{a.copy}</p>
            </SlideInItem>
          ))}
        </ol>
      </div>
      <EdgeBleed position="bottom" />
    </section>
  );
}

/* ---------------- What is included ---------------- */
const INCLUDED = [
  "Six nights of villa accommodation at Mount Kailash Rejuvenation Centre",
  "Plant-based feasts prepared within the Mount Kailash kitchens",
  "Herbal preparations and teaching drawn from the mineral rich soil gardens",
  "Daily guided practice: breath, movement, rest and reflection",
  "LifeCraft experiences running throughout the retreat week",
  "Chalice Station and An Evening with Jah9 as part of the wider week",
  "The guided 21-day continuation framework and tracker",
];

const NOT_INCLUDED = [
  "International and regional flights",
  "Airport transfers, unless confirmed in writing by the team",
  "Travel insurance and personal expenses",
  "Symposium tickets for guests not attending the retreat",
];

export function WceIncludedSection() {
  const lift = useSectionLift<HTMLElement>();
  return (
    <section
      ref={lift.ref}
      id="included"
      className="wce-surface px-6 py-24 sm:py-32"
      style={{ background: "var(--wce-cream-warm)", ...lift.style }}
    >
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <BotanicalBackdrop intensity={0.8} />
      <CornerVine className="pointer-events-none absolute left-0 top-8 opacity-40" />
      <div className="mx-auto max-w-5xl text-center">
        <Reveal><LotusMark size={28} className="mx-auto" /></Reveal>
        <MaskedHeading
          lines={["What Is Included"]}
          className="mt-8 text-[clamp(1.9rem,4.6vw,3rem)]"
          style={{ color: "var(--wce-forest)" }}
        />
        <Reveal index={1}><DiamondRule className="mx-auto mt-8 max-w-[11rem]" /></Reveal>

        <div className="mt-14 grid gap-6 text-left md:grid-cols-2">
          <Reveal
            className="px-8 py-10"
            style={{ background: "var(--wce-cream)", border: "1px solid rgba(201,162,39,0.6)", borderRadius: "2px" }}
          >
            <p className="wce-eyebrow" style={{ color: "var(--wce-gold-text)" }}>Included in your place</p>
            <ul className="mt-6 space-y-3.5">
              {INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.9)" }}>
                  <span className="mt-1 shrink-0"><CheckMark tone="var(--wce-gold-text)" /></span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            index={1}
            className="px-8 py-10"
            style={{ background: "var(--wce-cream)", border: "1px solid rgba(201,162,39,0.35)", borderRadius: "2px" }}
          >
            <p className="wce-eyebrow" style={{ color: "var(--wce-gold-text)" }}>Not included</p>
            <ul className="mt-6 space-y-3.5">
              {NOT_INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.82)" }}>
                  <span className="mt-1 shrink-0"><LeafIcon tone="rgba(201,162,39,0.85)" /></span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.78)" }}>
              Applicants should note dietary requirements and any mobility or accessibility considerations on the
              application form. The team confirms what can be accommodated before any payment is requested.
            </p>
          </Reveal>
        </div>

        <LeafDivider className="mt-16" />
      </div>
    </section>
  );
}

/* ---------------- Accommodation & investment ---------------- */
export function WceInvestmentSection() {
  return (
    <section
      id="investment"
      className="relative overflow-hidden px-6 py-24 text-center sm:py-32"
      style={{ background: "var(--wce-forest-deep, #0B2116)", borderTop: "1px solid rgba(201,162,39,0.45)" }}
    >
      <EdgeBleed position="top" />
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.045} light />
      <div className="relative mx-auto max-w-3xl">
        <Reveal><GoldFlourish className="mx-auto" size={54} /></Reveal>
        <MaskedHeading
          lines={["Accommodation & Investment"]}
          className="mt-8 text-[clamp(1.9rem,4.8vw,3.1rem)]"
          style={{ color: "var(--wce-cream)" }}
        />
        <Reveal index={1}>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(245,239,224,0.9)" }}>
            Approved participants stay in villa accommodation on the Mount Kailash grounds for six nights, from
            October 12 to 17. Villa assignments and final accommodation information are shared after acceptance.
          </p>
          <DiamondRule className="mx-auto mt-10 max-w-[13rem]" />
        </Reveal>

        <Reveal
          index={2}
          className="mx-auto mt-12 px-9 py-12"
          style={{ border: "1px solid rgba(201,162,39,0.55)", borderRadius: "2px", background: "rgba(15,42,29,0.6)" }}
        >
          <p className="text-[0.8rem] uppercase" style={{ color: "var(--wce-gold)", letterSpacing: "0.24em" }}>
            Retreat Investment
          </p>
          <p className="mt-5" style={{ color: "var(--wce-gold-light)", fontFamily: "var(--wce-display)", fontSize: "clamp(2.1rem,6vw,3.2rem)", lineHeight: 1.1 }}>
            US$4,500
          </p>
          <p className="mt-2 text-sm" style={{ color: "rgba(245,239,224,0.86)" }}>per person · six days, six nights</p>

          <DiamondRule className="mx-auto mt-9 max-w-[9rem]" />

          <ul className="mx-auto mt-9 max-w-md space-y-3.5 text-left">
            {[
              "Participation begins with an application reviewed by the Mount Kailash team",
              "A US$500 non-refundable deposit is requested after acceptance and is credited toward the US$4,500 total",
              "The remaining balance is paid through a private, secure checkout link sent only to accepted applicants",
              "Cancellation and transfer terms are supplied with your acceptance, before the balance is paid",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "rgba(245,239,224,0.9)" }}>
                <span className="mt-1 shrink-0"><CheckMark tone="var(--wce-gold-light)" /></span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <Reveal>
            <a
              href="#apply"
              className="wce-btn wce-btn-gold wce-btn-xl mt-12 w-full sm:w-auto"
              onClick={() => trackWceCta("apply", "investment_section", "Begin Your Application")}
            >
              Begin Your Application
            </a>
          </Reveal>
          <p className="mt-5 text-[0.85rem]" style={{ color: "rgba(245,239,224,0.78)" }}>
            No payment is taken at application. Places are limited and reviewed personally.
          </p>
        </Reveal>
      </div>
      <EdgeBleed position="bottom" />
    </section>
  );
}

/* ---------------- Closing band ---------------- */
export function WceFortifiedBanner() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20 text-center sm:py-24"
      style={{ background: "var(--wce-forest-mid)", borderTop: "1px solid rgba(201,162,39,0.3)" }}
    >
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.05} light />
      <CornerVine className="pointer-events-none absolute left-4 top-4 opacity-45" />
      <CornerVine flip className="pointer-events-none absolute right-4 top-4 opacity-45" />
      <div className="relative mx-auto max-w-3xl">
        <MaskedHeading
          lines={["Ready to Be Fortified?"]}
          className="text-[clamp(1.9rem,5vw,3.1rem)]"
          style={{ color: "var(--wce-cream)" }}
        />
        <Reveal index={1}>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(245,239,224,0.9)" }}>
            October 12–17, 2026 at Mount Kailash Rejuvenation Centre. Applications are reviewed personally, and
            places are limited.
          </p>
          <a
            href="#apply"
            className="wce-btn wce-btn-gold wce-shimmer-btn mt-10 w-full sm:w-auto"
            onClick={() => trackWceCta("apply", "fortified_banner", "Begin Your Application")}
          >
            <LeafIcon tone="var(--wce-forest)" size={13} />
            <span>Begin Your Application</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}