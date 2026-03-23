import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--site-bg-primary, #0a1a0f)" }}
    >
      <div className="text-center max-w-md">
        <img
          src="/star-seal-for-lovable.png"
          alt="Mount Kailash"
          className="mx-auto mb-8"
          style={{ width: 80, height: 80, filter: "brightness(0) invert(1)", opacity: 0.6 }}
        />
        <h1
          className="mb-3"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 5vw, 40px)",
            color: "var(--site-text-primary, #F4EFEA)",
          }}
        >
          Page Not Found
        </h1>
        <p
          className="mb-8"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: "15px",
            color: "var(--site-text-muted, rgba(244,239,234,0.6))",
            lineHeight: 1.6,
          }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full transition-all hover:brightness-110"
          style={{
            background: "var(--site-gold, #c9a84c)",
            color: "var(--site-green-dark, #0a1a0f)",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            padding: "14px 32px",
            minHeight: "48px",
          }}
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
