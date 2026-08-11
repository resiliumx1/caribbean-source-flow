/**
 * Small Pitons mark, taken from the WCE event's own visual language rather
 * than a generic dot. Inherits colour and size from its class.
 */
export function PeakGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 19 L8.5 8 L12 13 L15.5 6 L22 19 Z" />
    </svg>
  );
}
