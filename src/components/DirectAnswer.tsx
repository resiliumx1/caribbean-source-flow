/**
 * "Direct-answer" lead block.
 * One self-contained 40–60 word paragraph that answers the core question
 * for a page in plain, factual language — designed for AI-search quoting.
 * Wraps in semantic <section> so crawlers can identify it.
 */
interface DirectAnswerProps {
  question: string;
  answer: string;
  /** Optional id for in-page anchoring */
  id?: string;
}

export function DirectAnswer({ question, answer, id }: DirectAnswerProps) {
  return (
    <section
      id={id}
      aria-label="Direct answer"
      className="direct-answer-lead w-full"
      style={{
        background: "var(--site-bg-card, #f7f4ee)",
        borderBottom: "1px solid var(--site-card-hover-border, rgba(0,0,0,0.06))",
        padding: "1.5rem 1rem",
      }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "880px", color: "var(--site-text-primary, #1b1b1b)" }}
      >
        <h2
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: "0.5rem",
          }}
        >
          {question}
        </h2>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.05rem, 1.6vw, 1.25rem)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {answer}
        </p>
      </div>
    </section>
  );
}

export default DirectAnswer;