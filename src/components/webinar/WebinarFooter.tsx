import { Link } from "react-router-dom";

const NAV = [
  { label: "Shop", href: "/shop" },
  { label: "Retreats", href: "/retreats" },
  { label: "School", href: "/school/herbal-physician" },
  { label: "Webinars", href: "/webinars" },
];

export default function WebinarFooter() {
  return (
    <footer style={{ backgroundColor: "#090909", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-cormorant font-semibold text-lg" style={{ color: "#f2ead8" }}>
          MKRC
        </span>
        <nav className="flex gap-6">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.href}
              className="font-jost font-light text-sm transition-colors duration-200 hover:brightness-125"
              style={{ color: "#f2ead8", textDecoration: "none" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <span className="font-jost font-light text-xs" style={{ color: "#8a8070" }}>
          © Mount Kailash Rejuvenation Centre
        </span>
      </div>
    </footer>
  );
}
