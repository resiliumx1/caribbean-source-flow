import { Link } from "react-router-dom";

const NAV = [
  { label: "Shop", href: "/shop" },
  { label: "Retreats", href: "/retreats" },
  { label: "School", href: "/school/herbal-physician" },
  { label: "Webinars", href: "/webinars" },
];

export default function WebinarFooter() {
  return (
    <footer style={{ backgroundColor: "var(--site-bg-primary)", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-cormorant font-semibold text-lg" style={{ color: "var(--site-text-primary)" }}>
          MKRC
        </span>
        <nav className="flex gap-6">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.href}
              className="font-jost font-light text-sm transition-colors duration-200 hover:brightness-125"
              style={{ color: "var(--site-text-primary)", textDecoration: "none" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <span className="font-jost font-light text-xs" style={{ color: "var(--site-text-secondary)" }}>
          © Mount Kailash Rejuvenation Centre
        </span>
      </div>
    </footer>
  );
}
