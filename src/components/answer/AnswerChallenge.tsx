import { Video, Share2, Trophy, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Video,
    title: "Record",
    description: "Film a short video (30–90 seconds) of you using The Answer and sharing how it's helped your health.",
  },
  {
    icon: Share2,
    title: "Share",
    description: "Post your video on TikTok or Instagram with #MyAnswerStory and tag @mountkailashslu",
  },
  {
    icon: Trophy,
    title: "Win",
    description: "Our team picks a winner each month. The prize: a free 3-month supply of The Answer shipped to your door.",
  },
];

export function AnswerChallenge() {
  return (
    <section
      className="py-20 md:py-24"
      style={{ background: "linear-gradient(135deg, #1b4332 0%, #0d2818 100%)" }}
    >
      <div className="container mx-auto max-w-5xl px-4 text-center">
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c9a84c",
          }}
        >
          COMMUNITY CHALLENGE
        </span>

        {/* Headline */}
        <h2
          className="mt-4 mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "clamp(28px, 4vw, 36px)",
            color: "#f5f0e8",
          }}
        >
          Share Your Answer Story
        </h2>

        {/* Subtitle */}
        <p
          className="mx-auto mb-14"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            color: "rgba(245,240,232,0.8)",
            maxWidth: "560px",
          }}
        >
          Show the world how The Answer has changed your wellness journey — and win a 3-month supply
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}
              >
                <step.icon className="w-7 h-7" style={{ color: "#c9a84c" }} />
              </div>
              <h3
                className="mb-2"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "20px",
                  color: "#f5f0e8",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: "14px",
                  color: "rgba(245,240,232,0.7)",
                  lineHeight: 1.7,
                  maxWidth: "280px",
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="https://www.instagram.com/mountkailashslu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium transition-all hover:brightness-110 hover:scale-[1.02]"
          style={{
            background: "#c9a84c",
            color: "#0d2818",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
          }}
        >
          Enter the Challenge <ArrowRight className="w-4 h-4" />
        </a>

        {/* Fine print */}
        <p
          className="mt-6"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: "12px",
            color: "rgba(245,240,232,0.45)",
          }}
        >
          Challenge runs monthly. Winners announced on our social media. Must be 18+ to enter. Open worldwide.
        </p>
      </div>
    </section>
  );
}
