/** LifeCraft Experience — programme narrative, NOT a purchase pathway.
 *
 *  Deliberately carries no price, no capacity figure and no booking or purchase
 *  route for any of its components. Copy is editable from the organiser console
 *  (wce_settings.lifecraft_*) and falls back to the approved campaign strings.
 */
import { LeafDivider, LotusMark, CornerVine, EmblemLifecraft } from "./ornaments";
import { FlowerOfLifeField, DiamondRule, GoldFlourish, BotanicalBackdrop } from "./decor";
import { MaskedHeading, Reveal, SlideInItem, useSectionLift } from "./motion";
import { LIFECRAFT_BODY, LIFECRAFT_COMPONENTS, LIFECRAFT_HEADING } from "./campaign";
import { useWceSettings } from "./useWceData";

interface LifeCraftComponent { title: string; body?: string | null }

function readComponents(value: unknown): LifeCraftComponent[] {
  if (!Array.isArray(value)) return LIFECRAFT_COMPONENTS;
  const rows = (value as Record<string, unknown>[])
    .filter((r) => r && typeof r === "object" && typeof r.title === "string" && r.title.trim())
    .map((r) => ({ title: String(r.title).trim(), body: r.body ? String(r.body) : null }));
  return rows.length ? rows : LIFECRAFT_COMPONENTS;
}

/** Gold line-art mark for a named LifeCraft component. */
function ComponentMark({ variant }: { variant: number }) {
  if (variant === 1) {
    // Chalice — a stemmed vessel with a rising breath line.
    return (
      <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M13 12h22c0 9-4.6 14-11 15.4C17.6 26 13 21 13 12z" stroke="var(--wce-gold)" strokeWidth="1.1" />
        <path d="M24 27.6V37" stroke="var(--wce-gold)" strokeWidth="1.1" />
        <path d="M17 40h14" stroke="var(--wce-gold)" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M24 9c-1.6-2 0-3.6 0-5 1.4 1.6 1.6 3.2 0 5z" stroke="var(--wce-gold-light)" strokeWidth="0.9" />
      </svg>
    );
  }
  // Evening — a crescent with a soft chord of sound.
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M29 8a16 16 0 100 32 13 13 0 010-32z" stroke="var(--wce-gold)" strokeWidth="1.1" />
      <path d="M15 30c3-1.4 5-4 6-7.6" stroke="var(--wce-gold-light)" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="36" cy="16" r="1.2" fill="var(--wce-gold-light)" />
      <circle cx="40" cy="24" r="0.9" fill="var(--wce-gold-light)" />
    </svg>
  );
}

export function WceLifeCraftSection() {
  const { data: settings } = useWceSettings();
  const lift = useSectionLift<HTMLElement>();

  const heading = settings?.lifecraft_heading?.trim() || LIFECRAFT_HEADING;
  const body = settings?.lifecraft_body?.trim() || LIFECRAFT_BODY;
  const components = readComponents(settings?.lifecraft_components);

  return (
    <section
      ref={lift.ref}
      id="lifecraft"
      className="wce-surface px-6 py-24 sm:py-32"
      style={{ background: "var(--wce-panel-warm)", ...lift.style }}
      aria-labelledby="wce-lifecraft-heading"
    >
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <BotanicalBackdrop />
      <CornerVine className="pointer-events-none absolute left-0 top-8 opacity-40" />
      <CornerVine flip className="pointer-events-none absolute right-0 top-8 opacity-40" />

      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={54} /></Reveal>
        <Reveal><LotusMark size={28} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          id="wce-lifecraft-heading"
          lines={[heading]}
          className="mt-8 text-[clamp(1.9rem,4.6vw,3rem)]"
          style={{ color: "var(--wce-ink-strong)" }}
        />
        <Reveal index={1}>
          <DiamondRule className="mx-auto mt-7 max-w-[11rem]" />
          <p
            className="mx-auto mt-7 max-w-[62ch] text-left text-[1rem] leading-relaxed sm:text-center"
            style={{ color: "rgba(var(--wce-ink-rgb), 0.9)" }}
          >
            {body}
          </p>
          <span className="mt-10 inline-flex"><EmblemLifecraft /></span>
          <LeafDivider className="mx-auto mt-10 w-full max-w-md" />
        </Reveal>

        <Reveal index={2}>
          <p className="wce-eyebrow mt-14" style={{ color: "var(--wce-gold-text)", letterSpacing: "0.32em" }}>
            Within the Retreat Week
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {components.map((c, i) => (
            <SlideInItem
              as="li"
              key={c.title}
              index={i}
              className="relative flex flex-col items-center px-7 py-10 text-center"
              style={{
                background: "var(--wce-panel)",
                border: "1px solid rgba(var(--wce-gold-rgb), 0.7)",
                borderRadius: "2px",
                boxShadow: "0 18px 40px -32px rgba(var(--wce-shadow-rgb), 0.45)",
              }}
            >
              <ComponentMark variant={i % 2 === 0 ? 1 : 2} />
              <h3 className="mt-5 text-[1.2rem]" style={{ color: "var(--wce-ink-strong)" }}>{c.title}</h3>
              <DiamondRule className="mx-auto mt-4 max-w-[7rem]" />
              {c.body?.trim() && (
                <p className="mt-4 max-w-[34ch] text-[0.9375rem] leading-relaxed" style={{ color: "rgba(var(--wce-ink-rgb), 0.88)" }}>
                  {c.body}
                </p>
              )}
            </SlideInItem>
          ))}
        </ul>

        <Reveal index={3}>
          <p className="mx-auto mt-12 max-w-[52ch] text-[0.9375rem]" style={{ color: "rgba(var(--wce-ink-rgb), 0.72)" }}>
            LifeCraft experiences are included within the Caribbean Wellness Fortification Retreat programme. They are not sold separately.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
