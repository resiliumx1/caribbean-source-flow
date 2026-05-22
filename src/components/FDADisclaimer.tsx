interface FDADisclaimerProps {
  variant?: "compact" | "banner";
  className?: string;
}

const TEXT =
  "* These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

export function FDADisclaimer({ variant = "compact", className = "" }: FDADisclaimerProps) {
  if (variant === "banner") {
    return (
      <div
        role="note"
        aria-label="FDA disclaimer"
        className={`w-full rounded-md border border-border bg-muted/40 px-4 py-3 mb-6 ${className}`}
      >
        <p className="text-xs sm:text-sm italic text-muted-foreground leading-relaxed text-center">
          {TEXT}
        </p>
      </div>
    );
  }
  return (
    <div
      role="note"
      aria-label="FDA disclaimer"
      className={`rounded-md border border-border bg-muted/30 px-3 py-2 ${className}`}
    >
      <p className="text-xs italic text-muted-foreground leading-relaxed">{TEXT}</p>
    </div>
  );
}

export default FDADisclaimer;