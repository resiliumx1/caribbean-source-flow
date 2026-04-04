import { Link } from "react-router-dom";
import { FooterVine } from "@/components/decorative/BotanicalVine";

const FOOTER_LINKS = {
  shop: [
    { label: "The Answer", href: "/the-answer", external: false },
    { label: "All Products", href: "https://mountkailashslu.com/shop/", external: true },
    { label: "My Account", href: "https://mountkailashslu.com/my-account/", external: true },
    { label: "Cart", href: "https://mountkailashslu.com/cart/", external: true },
  ],
  learn: [
    { label: "Webinars", href: "/webinars", external: false },
    { label: "Herbal Physician Course", href: "https://mountkailashslu.com/hsek-application/", external: true },
    { label: "MKRC School", href: "https://schools.mountkailashslu.com/", external: true },
    { label: "Consultations", href: "https://mountkailashslu.com/", external: true },
  ],
  connect: [
    { label: "Instagram", href: "https://www.instagram.com/mountkailashslu/", external: true },
    { label: "YouTube", href: "https://youtube.com/@KAILASHLEONCE", external: true },
    { label: "Email", href: "mailto:blessedlove@mountkailashslu.com", external: true },
  ],
};

function FooterLink({ label, href, external }: { label: string; href: string; external: boolean }) {
  const style = {
    color: "var(--mkrc-text-secondary)",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.2s",
  };

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--mkrc-accent-gold)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--mkrc-text-secondary)")}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      to={href}
      style={style}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--mkrc-accent-gold)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--mkrc-text-secondary)")}
    >
      {label}
    </Link>
  );
}

export default function MKRCFooter() {
  return (
    <footer
      className="mkrc-body"
      style={{
        backgroundColor: "var(--mkrc-bg-secondary)",
        borderTop: "1px solid var(--mkrc-border-subtle)",
        padding: "60px 0 40px",
      }}
    >
      <FooterVine />
      <div
        className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
        style={{ maxWidth: 1200, padding: "0 24px" }}
      >
        {/* Brand */}
        <div>
          <h3
            className="mkrc-display text-lg mb-3"
            style={{ color: "var(--mkrc-text-primary)" }}
          >
            Mount Kailash Rejuvenation Centre
          </h3>
          <p style={{ color: "var(--mkrc-text-tertiary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            Nature's Answers For Optimum Health And Wellbeing. Serving the Caribbean and the world for over 20 years from Saint Lucia.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4
            className="mkrc-label text-xs mb-4"
            style={{ color: "var(--mkrc-text-primary)", letterSpacing: "0.2em" }}
          >
            Shop
          </h4>
          <div className="flex flex-col gap-2.5">
            {FOOTER_LINKS.shop.map((l) => (
              <FooterLink key={l.label} {...l} />
            ))}
          </div>
        </div>

        {/* Learn */}
        <div>
          <h4
            className="mkrc-label text-xs mb-4"
            style={{ color: "var(--mkrc-text-primary)", letterSpacing: "0.2em" }}
          >
            Learn
          </h4>
          <div className="flex flex-col gap-2.5">
            {FOOTER_LINKS.learn.map((l) => (
              <FooterLink key={l.label} {...l} />
            ))}
          </div>
        </div>

        {/* Connect */}
        <div>
          <h4
            className="mkrc-label text-xs mb-4"
            style={{ color: "var(--mkrc-text-primary)", letterSpacing: "0.2em" }}
          >
            Connect
          </h4>
          <div className="flex flex-col gap-2.5">
            {FOOTER_LINKS.connect.map((l) => (
              <FooterLink key={l.label} {...l} />
            ))}
            <p style={{ color: "var(--mkrc-text-tertiary)", fontSize: "0.85rem", marginTop: 8 }}>
              Marc Bexon, LC04 301, Saint Lucia
            </p>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div
        className="mx-auto mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          maxWidth: 1200,
          padding: "0 24px",
          borderTop: "1px solid var(--mkrc-border-subtle)",
        }}
      >
        <p style={{ color: "var(--mkrc-text-tertiary)", fontSize: "0.8rem" }}>
          © 2026 Mount Kailash Rejuvenation Centre
        </p>
        <div className="flex items-center gap-5">
          <a
            href="https://www.instagram.com/mountkailashslu/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{ color: "var(--mkrc-text-tertiary)", fontSize: "1.1rem" }}
          >
            📷
          </a>
          <a
            href="https://youtube.com/@KAILASHLEONCE"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            style={{ color: "var(--mkrc-text-tertiary)", fontSize: "1.1rem" }}
          >
            ▶
          </a>
          <a
            href="mailto:blessedlove@mountkailashslu.com"
            aria-label="Email"
            style={{ color: "var(--mkrc-text-tertiary)", fontSize: "1.1rem" }}
          >
            ✉
          </a>
        </div>
      </div>
    </footer>
  );
}
