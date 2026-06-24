import { FooterVine } from "@/components/decorative/BotanicalVine";

const NAV = [
  { label: "Shop", href: "/shop", external: false },
  { label: "Retreats", href: "/retreats", external: false },
  { label: "School", href: "https://herbalphysicianschoolmountkailash.netlify.app", external: true },
  { label: "Webinars", href: "/webinars", external: false },
];

export default function WebinarFooter() {
  return (
    <footer style={{ backgroundColor: "var(--site-bg-primary)", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
      <FooterVine />
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-cormorant font-semibold text-lg" style={{ color: "var(--site-text-primary)" }}>
          MKRC
        </span>
        <nav className="flex gap-6">
          {NAV.map((n) =>
            n.external ? (
              <a
                key={n.label}
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-jost font-light text-sm transition-colors duration-200 hover:brightness-125"
                style={{ color: "var(--site-text-primary)", textDecoration: "none" }}
              >
                {n.label}
              </a>
            ) : (
              <a
                key={n.label}
                href={n.href}
                className="font-jost font-light text-sm transition-colors duration-200 hover:brightness-125"
                style={{ color: "var(--site-text-primary)", textDecoration: "none" }}
              >
                {n.label}
              </a>
            )
          )}
        </nav>
        <span className="font-jost font-light text-xs" style={{ color: "var(--site-text-secondary)" }}>
          © Mount Kailash Rejuvenation Centre
        </span>
      </div>
    </footer>
  );
}
