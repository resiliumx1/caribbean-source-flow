interface SectionLabelProps {
  text: string;
  showLine?: boolean;
}

export default function SectionLabel({ text, showLine = true }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {showLine && (
        <span
          className="block w-6 h-px"
          style={{ backgroundColor: "var(--mkrc-accent-gold)" }}
        />
      )}
      <span
        className="mkrc-label text-xs"
        style={{ color: "var(--mkrc-accent-gold)", fontSize: "0.7rem" }}
      >
        {text}
      </span>
    </div>
  );
}
