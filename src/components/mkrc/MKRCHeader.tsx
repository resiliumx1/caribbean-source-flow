import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import MKRCThemeToggle from "./MKRCThemeToggle";

const NAV_LINKS = [
  { label: "Shop", href: "https://mountkailashslu.com/shop/", external: true },
  { label: "The Answer", href: "/the-answer", external: false },
  { label: "Webinars", href: "/webinars", external: false },
  { label: "Programs", href: "https://mountkailashslu.com/hsek-application/", external: true },
  { label: "Retreats", href: "https://mountkailashslu.com/", external: true },
];

export default function MKRCHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled
            ? "var(--mkrc-bg-primary)"
            : "transparent",
          borderBottom: scrolled
            ? "1px solid var(--mkrc-border-subtle)"
            : "1px solid transparent",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: 1200, padding: "0 24px", height: 64 }}
        >
          {/* Logo */}
          <a
            href="https://mountkailashslu.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mkrc-label"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              color: "var(--mkrc-text-primary)",
              textDecoration: "none",
            }}
          >
            Mount Kailash
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mkrc-label transition-colors duration-200"
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--mkrc-text-secondary)",
                    textDecoration: "none",
                    letterSpacing: "0.15em",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--mkrc-accent-gold)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--mkrc-text-secondary)")
                  }
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="mkrc-label transition-colors duration-200"
                  style={{
                    fontSize: "0.8rem",
                    color:
                      location.pathname === link.href
                        ? "var(--mkrc-accent-gold)"
                        : "var(--mkrc-text-secondary)",
                    textDecoration: "none",
                    letterSpacing: "0.15em",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--mkrc-accent-gold)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      location.pathname === link.href
                        ? "var(--mkrc-accent-gold)"
                        : "var(--mkrc-text-secondary)")
                  }
                >
                  {link.label}
                </Link>
              )
            )}
            <MKRCThemeToggle />
          </nav>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <MKRCThemeToggle />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex flex-col gap-1.5 p-2"
              style={{ color: "var(--mkrc-text-primary)" }}
            >
              <span className="block w-6 h-0.5" style={{ backgroundColor: "currentColor" }} />
              <span className="block w-6 h-0.5" style={{ backgroundColor: "currentColor" }} />
              <span className="block w-4 h-0.5" style={{ backgroundColor: "currentColor" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: "var(--mkrc-bg-primary)" }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="absolute top-5 right-6 text-3xl"
            style={{ color: "var(--mkrc-text-primary)", background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mkrc-label"
                style={{
                  fontSize: "1rem",
                  color: "var(--mkrc-text-primary)",
                  textDecoration: "none",
                  letterSpacing: "0.2em",
                }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="mkrc-label"
                style={{
                  fontSize: "1rem",
                  color:
                    location.pathname === link.href
                      ? "var(--mkrc-accent-gold)"
                      : "var(--mkrc-text-primary)",
                  textDecoration: "none",
                  letterSpacing: "0.2em",
                }}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      )}
    </>
  );
}
