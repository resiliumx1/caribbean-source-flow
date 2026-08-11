/** Crawlable cross-link band pointing at the WCE 2026 programme.
 *  Real <a href="/wce-2026"> with descriptive anchor text — used on the
 *  retreats and webinars pages. Main-site palette, not WCE tokens. */
export function WceProgrammeLink({
  kicker,
  body,
  anchor = "Explore WCE 2026",
}: {
  kicker: string;
  body: string;
  anchor?: string;
}) {
  return (
    <section className="px-4 py-10" style={{ background: "var(--site-bg-secondary, #0F281E)" }}>
      <a
        href="/wce-2026"
        className="container mx-auto max-w-4xl flex flex-col md:flex-row md:items-center gap-4 md:gap-8 rounded-2xl px-6 py-7 no-underline transition-transform hover:-translate-y-0.5"
        style={{ border: "1px solid rgba(201,162,39,0.38)", background: "rgba(15,42,29,0.92)" }}
      >
        <div className="flex-1">
          <p
            className="mb-2"
            style={{
              fontFamily: "'Jost', 'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "12.5px",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#E4C766",
            }}
          >
            {kicker}
          </p>
          <h2
            className="mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.35rem, 3vw, 1.9rem)",
              lineHeight: 1.2,
              color: "#F5EFE0",
            }}
          >
            Caribbean Wellness Experience 2026
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: "15px",
              lineHeight: 1.65,
              color: "rgba(245,239,224,0.86)",
            }}
          >
            {body}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-2 self-start md:self-auto whitespace-nowrap"
          style={{
            minHeight: 48,
            padding: "0.85rem 1.6rem",
            borderRadius: 2,
            background: "#C9A227",
            color: "#10230F",
            fontFamily: "'Jost', 'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {anchor} <span aria-hidden="true">→</span>
        </span>
      </a>
    </section>
  );
}