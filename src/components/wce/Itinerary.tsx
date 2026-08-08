/** Day-by-day itinerary for the Caribbean Wellness Experience week.
 *  Content is editable by organisers from /admin/wce → Itinerary; the
 *  fallback below keeps the section meaningful before the data loads. */
import { LeafDivider, LotusMark, CornerVine } from "./ornaments";
import { Reveal, MaskedHeading, SlideInItem, useSectionLift } from "./motion";
import { FlowerOfLifeField, BotanicalBackdrop, GoldFlourish, DiamondRule } from "./decor";
import { useWceItinerary } from "./useWceData";

const FALLBACK = [
  { id: "d1", date_label: "Sunday, October 11", title: "The Caribbean Wellness Symposium and opening experience", detail: "The wider Caribbean Wellness Experience begins with the public Symposium, bringing together speakers, practical perspectives, movement, culture and community at Mount Kailash." },
  { id: "d2", date_label: "Monday, October 12", title: "Arrival, grounding and entering the Mount Kailash environment", detail: null },
  { id: "d3", date_label: "Tuesday, October 13", title: "Breath, body, food and discipline", detail: null },
  { id: "d4", date_label: "Wednesday, October 14", title: "Herbal traditions, reflection and the Chalice experience", detail: null },
  { id: "d5", date_label: "Thursday, October 15", title: "Care, family, community and order", detail: null },
  { id: "d6", date_label: "Friday, October 16", title: "Purpose, responsibility and the continuation plan", detail: null },
  { id: "d7", date_label: "Saturday, October 17", title: "Closing, re-entry and An Evening with Jah9", detail: null },
];

export function WceItinerarySection() {
  const { data } = useWceItinerary();
  const days = (data ?? []).length ? (data as typeof FALLBACK) : FALLBACK;
  const lift = useSectionLift<HTMLElement>();

  return (
    <section
      ref={lift.ref}
      id="itinerary"
      className="wce-surface px-6 py-24 sm:py-32"
      style={{ background: "var(--wce-cream-warm)", ...lift.style }}
    >
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <BotanicalBackdrop />
      <CornerVine className="pointer-events-none absolute left-0 top-8 opacity-40" />
      <CornerVine flip className="pointer-events-none absolute right-0 top-8 opacity-40" />

      <div className="mx-auto max-w-4xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={54} /></Reveal>
        <Reveal><LotusMark size={28} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          lines={["The Week, Day by Day"]}
          className="mt-8 text-[clamp(1.9rem,4.6vw,3rem)]"
          style={{ color: "var(--wce-forest)" }}
        />
        <Reveal index={1}>
          <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.88)" }}>
            An outline of the shape of the week at Mount Kailash. Daily details are confirmed with participants
            before arrival and may be adjusted by the team.
          </p>
          <DiamondRule className="mx-auto mt-8 max-w-[11rem]" />
        </Reveal>

        <ol className="wce-itinerary mt-14 text-left">
          {days.map((d, i) => (
            <SlideInItem as="li" key={d.id} index={Math.min(i, 6)} className="wce-itinerary-row">
              <span aria-hidden="true" className="wce-itinerary-node" />
              <div className="wce-itinerary-body">
                <p className="wce-itinerary-date">{d.date_label}</p>
                <h3 className="wce-itinerary-title">{d.title}</h3>
                {d.detail && <p className="wce-itinerary-detail">{d.detail}</p>}
              </div>
            </SlideInItem>
          ))}
        </ol>

        <LeafDivider className="mt-16" />
      </div>
    </section>
  );
}
