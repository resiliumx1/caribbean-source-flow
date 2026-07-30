import { LeafDivider, CornerVine, LotusMark } from "./ornaments";
import { useWcePathways, useWceSpeakers, useWceSettings, pathwayFeatures } from "./useWceData";

const PARTNERS = [
  "Mount Kailash",
  "Kamila's Kitchen",
  "Jah9",
  "LifeCraft in Jamaica",
  "The Ubuntu Movement",
];

/* ---------------- 1. HERO ---------------- */
export function WceHero() {
  const { data: settings } = useWceSettings();
  const dates = settings?.event_dates ?? "11-17 October 2026";
  const venue = settings?.venue ?? "Mount Kailash Rejuvenation Centre, St. Lucia";

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
      style={{ background: "var(--wce-forest)" }}
    >
      {/* Video background placeholder — video supplied in a later batch */}
      <div
        data-wce-video-slot
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 20%, #234534 0%, #16321F 45%, #0F2A1D 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{ background: "linear-gradient(to top, #0F2A1D 12%, rgba(15,42,29,0.65) 55%, transparent 100%)" }}
      />
      <CornerVine className="pointer-events-none absolute left-4 top-4 opacity-70 sm:left-10 sm:top-10" />
      <CornerVine flip className="pointer-events-none absolute right-4 top-4 opacity-70 sm:right-10 sm:top-10" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <LotusMark size={46} className="mb-10" />
        <h1
          className="wce-display text-[clamp(1.5rem,5.4vw,3.1rem)] uppercase"
          style={{ color: "var(--wce-gold-light)", letterSpacing: "0.16em" }}
        >
          Caribbean Wellness<br className="sm:hidden" /> Saint Lucia
        </h1>

        <p className="wce-year mt-8 text-[clamp(5rem,20vw,13rem)]">2026</p>

        <p
          className="wce-eyebrow mt-8"
          style={{ color: "var(--wce-cream)", letterSpacing: "0.42em" }}
        >
          {dates}
        </p>

        <LeafDivider className="my-10 w-full max-w-sm" />

        <p
          className="max-w-2xl text-[0.78rem] uppercase leading-loose sm:text-sm"
          style={{ color: "rgba(245,239,224,0.82)", letterSpacing: "0.2em" }}
        >
          Wellness Symposium <span style={{ color: "var(--wce-gold)" }}>|</span> Fortification Retreat{" "}
          <span style={{ color: "var(--wce-gold)" }}>|</span> Lifecraft Experience
        </p>

        <p className="wce-eyebrow mt-10" style={{ color: "var(--wce-gold)" }}>
          {venue}
        </p>

        <div className="mt-14 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <a href="#pathways" className="wce-btn wce-btn-gold w-full sm:w-auto">Choose Your Pathway</a>
          <a href="#apply" className="wce-btn wce-btn-outline w-full sm:w-auto">Apply for the Retreat</a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 2. PARTNER STRIP ---------------- */
export function WcePartnerStrip() {
  return (
    <section
      className="px-6 py-10"
      style={{ background: "var(--wce-forest-mid)", borderTop: "1px solid rgba(201,162,39,0.28)", borderBottom: "1px solid rgba(201,162,39,0.28)" }}
      aria-label="Event partners"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <p className="wce-eyebrow" style={{ color: "var(--wce-gold)", letterSpacing: "0.4em" }}>Powered by</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PARTNERS.map((p) => (
            <li
              key={p}
              className="text-[0.72rem] uppercase sm:text-xs"
              style={{ color: "rgba(245,239,224,0.85)", letterSpacing: "0.24em" }}
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 3. PATHWAYS ---------------- */
export function WcePathwaysSection() {
  const { data: pathways } = useWcePathways();

  return (
    <section id="pathways" className="relative overflow-hidden px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream)" }}>
      <div className="mx-auto max-w-6xl text-center">
        <LotusMark size={38} className="mx-auto" />
        <h2 className="mt-8 text-[clamp(2rem,5vw,3.4rem)]" style={{ color: "var(--wce-forest)" }}>
          Choose Your Experience Pathway
        </h2>
        <p className="mt-5 text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.7)" }}>
          Three ways to experience transformation.
        </p>
        <LeafDivider className="mt-10" />

        <div className="mt-16 grid gap-8 sm:mt-20 lg:grid-cols-3">
          {(pathways ?? []).map((p, i) => {
            const isRetreat = p.key === "retreat";
            const features = pathwayFeatures(p.features);
            const cta = isRetreat
              ? "Apply for the Retreat"
              : p.key === "online"
              ? "Get Online Access"
              : "Reserve Spot";
            return (
              <article
                key={p.id}
                className="relative flex flex-col overflow-hidden px-8 py-12 text-center"
                style={{
                  background: isRetreat ? "var(--wce-forest)" : "var(--wce-cream-warm)",
                  border: `1px solid ${isRetreat ? "var(--wce-gold)" : "rgba(201,162,39,0.4)"}`,
                  borderRadius: "3px",
                }}
              >
                {isRetreat && (
                  <div
                    aria-hidden="true"
                    className="absolute -right-12 top-9 w-52 rotate-45 py-1.5 text-center text-[0.55rem] uppercase"
                    style={{ background: "var(--wce-gold)", color: "var(--wce-forest)", letterSpacing: "0.2em", fontWeight: 600 }}
                  >
                    Applications Open
                  </div>
                )}
                <CornerVine className="pointer-events-none absolute -left-2 -bottom-2 opacity-40" />

                <span
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg"
                  style={{
                    fontFamily: "var(--wce-display)",
                    border: "1px solid var(--wce-gold)",
                    background: isRetreat ? "transparent" : "var(--wce-gold)",
                    color: isRetreat ? "var(--wce-gold-light)" : "var(--wce-forest)",
                  }}
                >
                  {i + 1}
                </span>

                <h3
                  className="mt-8 text-[1.55rem] leading-snug"
                  style={{ color: isRetreat ? "var(--wce-cream)" : "var(--wce-forest)" }}
                >
                  {p.label}
                </h3>

                <p
                  className="mt-6 text-[0.68rem] uppercase"
                  style={{ color: isRetreat ? "var(--wce-gold-light)" : "rgba(26,26,20,0.55)", letterSpacing: "0.24em" }}
                >
                  {isRetreat ? "Applications Open" : p.key === "in_person" ? "Starting at" : "Full access"}
                </p>
                {!isRetreat && (
                  <p
                    className="mt-2 text-[2.4rem]"
                    style={{ fontFamily: "var(--wce-display)", color: "var(--wce-gold-deep)" }}
                  >
                    {p.currency} {Number(p.price).toFixed(0)}
                  </p>
                )}

                <ul className="mx-auto mt-8 space-y-3 text-left text-sm">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3" style={{ color: isRetreat ? "rgba(245,239,224,0.85)" : "rgba(26,26,20,0.78)" }}>
                      <span aria-hidden="true" style={{ color: "var(--wce-gold)" }}>✦</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a href={isRetreat ? "#apply" : "#apply"} className="wce-btn wce-btn-gold mt-10 w-full">
                  {cta}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 4. VISIONARY LEADERS ---------------- */
function PortraitCircle({ url, name, size }: { url: string | null; name: string; size: "lg" | "sm" }) {
  const dim = size === "lg" ? "h-44 w-44 sm:h-56 sm:w-56" : "h-28 w-28 sm:h-32 sm:w-32";
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full`}
      style={{
        border: "1px solid var(--wce-gold)",
        boxShadow: "0 0 0 6px rgba(201,162,39,0.12)",
        background: "linear-gradient(160deg, rgba(45,74,53,0.14), rgba(201,162,39,0.12))",
        overflow: "hidden",
      }}
    >
      {url ? (
        <img src={url} alt={name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <span
          className="wce-display text-3xl"
          style={{ color: "var(--wce-gold-deep)", letterSpacing: "0.08em" }}
          aria-hidden="true"
        >
          {name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]).join("")}
        </span>
      )}
    </div>
  );
}

export function WceSpeakersSection() {
  const { data: speakers } = useWceSpeakers();
  const featured = speakers?.find((s) => s.is_featured) ?? null;
  const rest = (speakers ?? []).filter((s) => s.id !== featured?.id);

  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream-warm)" }}>
      <div className="mx-auto max-w-6xl text-center">
        <LotusMark size={38} className="mx-auto" />
        <h2
          className="mt-8 text-[clamp(2rem,5vw,3.4rem)] uppercase"
          style={{ color: "var(--wce-forest)", letterSpacing: "0.1em" }}
        >
          Visionary Leaders
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(26,26,20,0.7)" }}>
          Guided by voices in wellness, medicine, movement, sovereignty, leadership, transformation, and restoration.
        </p>
        <LeafDivider className="mt-10" />

        {featured && (
          <div
            className="mt-16 flex flex-col items-center gap-10 px-6 py-12 text-center sm:px-12 md:flex-row md:text-left"
            style={{ background: "var(--wce-cream)", border: "1px solid rgba(201,162,39,0.4)", borderRadius: "3px" }}
          >
            <PortraitCircle url={featured.portrait_url} name={featured.name} size="lg" />
            <div className="md:flex-1">
              <p className="wce-eyebrow" style={{ color: "var(--wce-gold-deep)" }}>Living anchor of the week</p>
              <h3 className="mt-4 text-[clamp(1.8rem,3.6vw,2.6rem)]" style={{ color: "var(--wce-forest)" }}>
                {featured.name}
              </h3>
              {featured.theme && (
                <p className="mt-3 text-sm italic" style={{ color: "var(--wce-gold-deep)", fontFamily: "var(--wce-display)", fontSize: "1.15rem" }}>
                  {featured.theme}
                </p>
              )}
              {featured.session_title && (
                <p className="mt-5 text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.75)" }}>
                  {featured.session_title}
                </p>
              )}
            </div>
          </div>
        )}

        <ul className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 sm:mt-20 sm:grid-cols-3 lg:grid-cols-6">
          {rest.map((s) => (
            <li key={s.id} className="flex flex-col items-center text-center">
              <PortraitCircle url={s.portrait_url} name={s.name} size="sm" />
              <p className="mt-5 text-sm font-medium" style={{ color: "var(--wce-forest)" }}>{s.name}</p>
              {s.theme && (
                <p className="mt-1 text-xs italic" style={{ color: "rgba(26,26,20,0.6)" }}>{s.theme}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
