/**
 * Line-art consultation icons in the practice's botanical vocabulary.
 *
 * Every icon is a 48×48 line drawing that inherits the surrounding text colour,
 * so it holds up in both themes. Each stroke carries `pathLength={1}` so the
 * draw-in animation in consultation.css works from one dasharray value, and the
 * `--i` custom property on individual strokes is used as the stagger multiplier
 * so leaves, ring segments and bars arrive in sequence rather than together.
 */
import type { CSSProperties, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Shared frame: sizing comes from the caller, colour from `currentColor`. */
function Frame({ children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** `--i` is a plain custom property, which TS needs to be told about. */
const i = (n: number) => ({ "--i": n } as CSSProperties);

/** MKRC Consultation — two leaves rising from a stem inside an open ring. */
export function ConsultationIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="24" cy="24" r="17" className="ic-ring" pathLength={1} style={i(0)} />
      <path d="M24 33c0-7 3-12 8-15 1 8-2 14-8 15Z" className="ic-leaf" pathLength={1} style={i(1)} />
      <path d="M24 33c0-7-3-12-8-15-1 8 2 14 8 15Z" className="ic-leaf2" pathLength={1} style={i(2)} />
      <path d="M24 33v5" className="ic-stem" pathLength={1} style={i(3)} />
      <path d="M14.5 12.5a15 15 0 0 1 19 0" className="ic-arc" pathLength={1} style={i(4)} />
    </Frame>
  );
}

/** 5 Sessions Package — five leaves fanned from one stem. */
export function PackageIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M24 34 Q21.7 25.6 13.0 25.4 Q15.3 33.8 24 34Z" className="ic-leaf" pathLength={1} style={i(0)} />
      <path d="M24 34 Q25.6 25.4 17.9 21.4 Q16.3 30.0 24 34Z" className="ic-leaf" pathLength={1} style={i(1)} />
      <path d="M24 34 Q29.2 27.0 24.0 20.0 Q18.8 27.0 24 34Z" className="ic-leaf" pathLength={1} style={i(2)} />
      <path d="M24 34 Q31.7 30.0 30.1 21.4 Q22.4 25.4 24 34Z" className="ic-leaf" pathLength={1} style={i(3)} />
      <path d="M24 34 Q32.7 33.8 35.0 25.4 Q26.3 25.6 24 34Z" className="ic-leaf" pathLength={1} style={i(4)} />
      <path d="M24 34v6" className="ic-stem" pathLength={1} style={i(5)} />
    </Frame>
  );
}

/** Sessions 2–5 — a five-segment progress ring with the first segment complete. */
export function ContinuingIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M25.0 8.0 A16 16 0 0 1 38.9 18.1" className="ic-seg ic-seg--done" pathLength={1} style={i(0)} />
      <path d="M39.5 20.0 A16 16 0 0 1 34.2 36.3" className="ic-seg" pathLength={1} style={i(1)} />
      <path d="M32.6 37.5 A16 16 0 0 1 15.4 37.5" className="ic-seg" pathLength={1} style={i(2)} />
      <path d="M13.8 36.3 A16 16 0 0 1 8.5 20.0" className="ic-seg" pathLength={1} style={i(3)} />
      <path d="M9.1 18.1 A16 16 0 0 1 23.0 8.0" className="ic-seg" pathLength={1} style={i(4)} />
      <path d="M24 29c0-4.5 2-7.5 5.5-9.5.5 5-1.5 8.5-5.5 9.5Z" className="ic-leaf" pathLength={1} style={i(5)} />
      <path d="M24 29v3.5" className="ic-stem" pathLength={1} style={i(6)} />
    </Frame>
  );
}

/** Business Consultation — three ascending stems, the tallest crowned by a leaf. */
export function BusinessIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M13 36V27" className="ic-bar" pathLength={1} style={i(0)} />
      <path d="M24 36V22" className="ic-bar" pathLength={1} style={i(1)} />
      <path d="M35 36V16" className="ic-bar" pathLength={1} style={i(2)} />
      <path d="M35 16c0-4.5 2-7.5 5.5-9.5.5 5-1.5 8.5-5.5 9.5Z" className="ic-leaf" pathLength={1} style={i(3)} />
      <path d="M8 40h32" className="ic-base" pathLength={1} style={i(4)} />
    </Frame>
  );
}

export type ConsultationIconKey = "consultation" | "package" | "continuing" | "business";

/** Selectable keys, in the order they are offered in the admin. */
export const CONSULTATION_ICON_OPTIONS: { key: ConsultationIconKey; label: string; Icon: (p: IconProps) => JSX.Element }[] = [
  { key: "consultation", label: "Single consultation — leaves in a ring", Icon: ConsultationIcon },
  { key: "package", label: "Package — five fanned leaves", Icon: PackageIcon },
  { key: "continuing", label: "Continuing sessions — progress ring", Icon: ContinuingIcon },
  { key: "business", label: "Business — ascending stems", Icon: BusinessIcon },
];

/** Legacy lucide keys kept working so existing rows never lose their icon. */
const ICON_MAP: Record<string, (p: IconProps) => JSX.Element> = {
  consultation: ConsultationIcon,
  package: PackageIcon,
  continuing: ContinuingIcon,
  business: BusinessIcon,
  leaf: ConsultationIcon,
  repeat: PackageIcon,
  "clipboard-list": ContinuingIcon,
  mountain: BusinessIcon,
};

/** Unknown or missing keys fall back to the single-consultation mark. */
export function consultationIcon(key?: string | null) {
  return ICON_MAP[(key ?? "").trim()] ?? ConsultationIcon;
}
