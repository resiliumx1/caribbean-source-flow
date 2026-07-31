/** Palette-matched loading placeholders — same footprint as the real content, so nothing shifts. */

export function PathwayCardsSkeleton() {
  return (
    <div className="mt-16 grid gap-8 sm:mt-20 lg:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-5 px-8 py-12"
          style={{ border: "1px solid rgba(201,162,39,0.25)", borderRadius: "3px", background: "var(--wce-cream-warm)" }}
        >
          <div className="wce-skeleton h-12 w-12 rounded-full" />
          <div className="wce-skeleton h-6 w-2/3" />
          <div className="wce-skeleton h-4 w-1/3" />
          <div className="wce-skeleton h-10 w-1/2" />
          <div className="mt-4 w-full space-y-3">
            {[0, 1, 2, 3].map((k) => <div key={k} className="wce-skeleton h-3 w-full" />)}
          </div>
          <div className="wce-skeleton mt-6 h-11 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SpeakersSkeleton() {
  return (
    <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 sm:mt-20 sm:grid-cols-3 lg:grid-cols-6" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="wce-skeleton h-28 w-28 rounded-full sm:h-32 sm:w-32" />
          <div className="wce-skeleton mt-5 h-3 w-20" />
          <div className="wce-skeleton mt-2 h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

export function FaqSkeleton() {
  return (
    <div className="mt-14 space-y-4" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="px-6 py-6"
          style={{ background: "var(--wce-cream)", border: "1px solid rgba(201,162,39,0.25)", borderRadius: "3px" }}
        >
          <div className="wce-skeleton h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}