/** Fortification Retreat supporting detail, presented as four independently
 *  expandable cards directly beneath the retreat CTA band. Each card keeps its
 *  own open state keyed by its own id — never a single-open accordion, so
 *  visitors can compare two panels side by side.
 *
 *  The retreat is never presented as purchasable: deposit and balance terms
 *  live inside Card 4 and on the private checkout page only, never beside the
 *  "Begin Your Application" button. */
import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal, MaskedHeading } from "./motion";
import { CheckMark, LeafIcon, GoldFlourish, DiamondRule, FlowerOfLifeField } from "./decor";
import { LotusMark } from "./ornaments";

/* ---------------- Card 1 — Who this experience is for ---------------- */
const WHO_FOR = [
  "People carrying long-term stress, fatigue or burnout who want structure, not another quick fix",
  "People ready to rebuild their relationship with food, herbs, rest and daily discipline",
  "Practitioners, carers and professionals who spend their days pouring into others",
  "Anyone drawn to the Caribbean, its plants and its traditions who wants to learn in place",
  "People willing to be guided — to follow a shared rhythm for six days and carry it home",
];

const NOT_FOR =
  "This is not a medical programme, a clinical detox or a party week. It does not diagnose, treat, cure or prevent disease, and it is not a substitute for the care of a qualified healthcare provider.";

function WhoForContent() {
  return (
    <>
      <ul className="wce-rcard-list">
        {WHO_FOR.map((t) => (
          <li key={t}>
            <span className="wce-rcard-bullet"><CheckMark tone="var(--wce-gold-text)" /></span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="wce-rcard-note">{NOT_FOR}</p>
    </>
  );
}

/* ---------------- Card 2 — The 21-day arc ---------------- */
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

function ArcContent() {
  return (
    <>
      <p className="wce-rcard-lead">
        The retreat does not end at the gate. Participants leave with a guided continuation framework and tracker
        that carries selected practices through to day 21. Final delivery details are shared during the retreat.
      </p>
      {/* Arc graphic: a gold spine with a node per stage. */}
      <ol className="wce-rcard-arc">
        {ARC.map((a) => (
          <li key={a.step}>
            <span className="wce-rcard-arc-node" aria-hidden="true" />
            <p className="wce-rcard-arc-step">{a.step}</p>
            <h4 className="wce-rcard-arc-title">{a.title}</h4>
            <p className="wce-rcard-arc-copy">{a.copy}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

/* ---------------- Card 3 — What is included ---------------- */
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

function IncludedContent() {
  return (
    <>
      <p className="wce-rcard-eyebrow">Included in your place</p>
      <ul className="wce-rcard-list">
        {INCLUDED.map((t) => (
          <li key={t}>
            <span className="wce-rcard-bullet"><CheckMark tone="var(--wce-gold-text)" /></span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="wce-rcard-eyebrow mt-8">Not included</p>
      <ul className="wce-rcard-list is-muted">
        {NOT_INCLUDED.map((t) => (
          <li key={t}>
            <span className="wce-rcard-bullet"><LeafIcon tone="rgba(var(--wce-gold-rgb), 0.85)" /></span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="wce-rcard-lead mt-7">
        Applicants should note dietary requirements and any mobility or accessibility considerations on the
        application form. The team confirms what can be accommodated before any payment is requested.
      </p>
    </>
  );
}

/* ---------------- Card 4 — Accommodation & investment ---------------- */
const ROOM_TIERS = [
  {
    label: "Shared villa room",
    price: "US$4,500",
    copy: "Per person, twin-share within a villa on the Mount Kailash grounds. Six nights, October 12–17.",
  },
  {
    label: "Private villa room",
    price: "On request",
    copy: "A limited number of single-occupancy rooms are held back. The supplement is confirmed in writing after acceptance, before any balance is paid.",
  },
];

const TERMS = [
  "Participation begins with an application reviewed by the Mount Kailash team",
  "A US$500 non-refundable deposit is requested after acceptance and is credited toward the total",
  "The remaining balance is paid through a private, secure checkout link sent only to accepted applicants",
  "Cancellation and transfer terms are supplied with your acceptance, before the balance is paid",
];

function InvestmentContent() {
  return (
    <>
      <p className="wce-rcard-lead">
        Approved participants stay in villa accommodation on the Mount Kailash grounds for six nights, from
        October 12 to 17. Villa assignments and final accommodation information are shared after acceptance.
      </p>
      <div className="wce-rcard-tiers">
        {ROOM_TIERS.map((t) => (
          <div className="wce-rcard-tier" key={t.label}>
            <p className="wce-rcard-tier-label">{t.label}</p>
            <p className="wce-rcard-tier-price">{t.price}</p>
            <p className="wce-rcard-tier-copy">{t.copy}</p>
          </div>
        ))}
      </div>
      <p className="wce-rcard-eyebrow mt-8">Deposit &amp; balance</p>
      <ul className="wce-rcard-list">
        {TERMS.map((t) => (
          <li key={t}>
            <span className="wce-rcard-bullet"><CheckMark tone="var(--wce-gold-text)" /></span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------------- Card shell ---------------- */
type CardDef = {
  id: string;
  title: string;
  teaser: string;
  ornament: ReactNode;
  content: ReactNode;
};

const CARDS: CardDef[] = [
  {
    id: "who-for",
    title: "Who This Experience Is For",
    teaser: "For those ready to step outside their normal routine.",
    ornament: <GoldFlourish size={34} />,
    content: <WhoForContent />,
  },
  {
    id: "arc",
    title: "The 21-Day Arc",
    teaser: "Six days at Mount Kailash, then a guided 21-day continuation.",
    ornament: <LotusMark size={22} />,
    content: <ArcContent />,
  },
  {
    id: "included",
    title: "What Is Included",
    teaser: "Accommodation, meals, practices, consultation, Chalice Station and more.",
    ornament: <GoldFlourish size={34} />,
    content: <IncludedContent />,
  },
  {
    id: "investment",
    title: "Accommodation and Investment",
    teaser: "From US$4,500, including six nights of villa accommodation.",
    ornament: <LotusMark size={22} />,
    content: <InvestmentContent />,
  },
];

function RetreatDetailCard({ card, index }: { card: CardDef; index: number }) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const panelId = `wce-rcard-panel-${card.id}-${uid}`;
  const buttonId = `wce-rcard-btn-${card.id}-${uid}`;

  return (
    <Reveal index={Math.min(index, 3)} className={`wce-rcard${open ? " is-open" : ""}`}>
      <h3 className="wce-rcard-heading">
        <button
          type="button"
          id={buttonId}
          className="wce-rcard-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="wce-rcard-ornament" aria-hidden="true">{card.ornament}</span>
          <span className="wce-rcard-titles">
            <span className="wce-rcard-title">{card.title}</span>
            <span className="wce-rcard-teaser">{card.teaser}</span>
          </span>
          <ChevronDown className={`wce-rcard-chev${open ? " is-open" : ""}`} size={20} aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} className={`wce-rcard-panel${open ? " is-open" : ""}`}>
        <div>
          <div className="wce-rcard-body">
            <DiamondRule className="mx-auto mb-7 max-w-[8rem]" />
            {card.content}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function WceRetreatDetailCards() {
  return (
    <section
      id="retreat-detail"
      className="wce-surface px-6 py-20 sm:py-24"
      style={{ background: "var(--wce-panel)" }}
      aria-labelledby="wce-retreat-detail-heading"
    >
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <div className="relative mx-auto max-w-7xl">
        <MaskedHeading
          id="wce-retreat-detail-heading"
          lines={["The Retreat in Detail"]}
          className="text-center text-[clamp(1.6rem,3.6vw,2.3rem)]"
          style={{ color: "var(--wce-ink-strong)" }}
        />
        <Reveal index={1}>
          <p className="wce-rcard-subline mx-auto mt-4 max-w-xl text-center">
            Open any card to read more. Several can stay open at once, so you can compare.
          </p>
        </Reveal>
        <div className="wce-rcard-grid mt-12" data-wce-retreat-cards>
          {CARDS.map((c, i) => (
            <RetreatDetailCard card={c} index={i} key={c.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
