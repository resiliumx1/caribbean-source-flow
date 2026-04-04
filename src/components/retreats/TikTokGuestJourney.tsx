export function TikTokGuestJourney() {
  return (
    <section className="py-16 md:py-20" style={{ background: "#f5f0e8" }}>
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2
          className="mb-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "clamp(24px, 3.5vw, 28px)",
            color: "#1b4332",
          }}
        >
          A Guest's Journey
        </h2>
        <p
          className="mx-auto mb-10"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: "15px",
            color: "#666",
            maxWidth: "480px",
          }}
        >
          See what a solo retreat at Mount Kailash looks like through the eyes of a guest
        </p>

        <div className="flex justify-center">
          <iframe
            src="https://www.tiktok.com/embed/v2/7414056557769411873"
            style={{
              maxWidth: 400,
              width: "100%",
              aspectRatio: "9/16",
              border: "none",
              borderRadius: 16,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
            allowFullScreen
            allow="autoplay"
            title="Guest retreat experience on TikTok"
          />
        </div>

        <a
          href="https://www.tiktok.com/@tishwonders"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-5 transition-opacity hover:opacity-80"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: "13px",
            color: "#888",
            textDecoration: "none",
          }}
        >
          @tishwonders on TikTok
        </a>
      </div>
    </section>
  );
}
