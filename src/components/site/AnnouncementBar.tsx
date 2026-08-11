/**
 * Slim site-wide announcement strip for Caribbean Wellness Saint Lucia 2026.
 *
 * Rendered as the first row inside the fixed site header so the header stays
 * sticky and every existing sticky/scroll offset keeps working; the bar's
 * height is published as `--announcement-h` and applied as body padding, so no
 * page content ends up underneath it.
 *
 * All styles are self-contained (no WCE tokens) so nothing leaks site-wide.
 * Dismissal is remembered for 7 days in localStorage.
 * Visibility is controlled from the admin via wce_settings.announcement_enabled.
 */
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useWceSettings } from "@/components/wce/useWceData";

const STORAGE_KEY = "mkrc-wce-announcement-dismissed";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const STYLES = `
.mk-announce{position:relative;overflow:hidden;background:#0F2A1D;border-bottom:1px solid rgba(201,162,39,.42)}
.mk-announce-link{display:flex;align-items:center;justify-content:center;gap:.55rem;flex-wrap:wrap;
  min-height:44px;padding:6px 44px;text-align:center;text-decoration:none;position:relative;z-index:2}
.mk-announce-text{font-family:'Jost','DM Sans',system-ui,sans-serif;font-weight:500;font-size:12.5px;
  letter-spacing:.13em;text-transform:uppercase;color:#F5EFE0}
.mk-announce-dot{color:#C9A227;font-size:12px;line-height:1}
.mk-announce-cta{font-family:'Jost','DM Sans',system-ui,sans-serif;font-weight:600;font-size:12.5px;
  letter-spacing:.13em;text-transform:uppercase;color:#E4C766}
.mk-announce-link:hover .mk-announce-cta{text-decoration:underline}
.mk-announce-link:focus-visible{outline:2px solid #E4C766;outline-offset:-3px}
.mk-announce-close{position:absolute;top:50%;right:6px;transform:translateY(-50%);z-index:3;
  display:flex;align-items:center;justify-content:center;width:36px;height:36px;border:0;background:none;
  color:rgba(245,239,224,.72);cursor:pointer;border-radius:9999px}
.mk-announce-close:hover{color:#E4C766;background:rgba(245,239,224,.08)}
.mk-announce::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(100deg,transparent 42%,rgba(255,236,175,.22) 50%,transparent 58%);
  background-size:260% 100%;background-repeat:no-repeat;background-position:170% 0;
  animation:mk-announce-shimmer 9s ease-in-out infinite}
@keyframes mk-announce-shimmer{0%,80%{background-position:170% 0}100%{background-position:-70% 0}}
@media (min-width:768px){
  .mk-announce-link{min-height:38px;padding:4px 48px}
}
@media (prefers-reduced-motion: reduce){
  .mk-announce::after{animation:none;background:none}
}
`;

function dismissedRecently() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < SEVEN_DAYS;
  } catch {
    return false;
  }
}

export function AnnouncementBar() {
  const { data: settings } = useWceSettings();
  const [dismissed, setDismissed] = useState(() => dismissedRecently());

  // Only once the setting has loaded, so the bar never flashes when switched off.
  const enabled = !!settings && (settings as { announcement_enabled?: boolean }).announcement_enabled !== false;
  const visible = enabled && !dismissed;

  // Publish the height so sticky offsets / scroll-spy maths can account for it,
  // and shift page content down by exactly that much.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.setProperty("--announcement-h", "0px");
      document.body.style.paddingTop = "";
      return;
    }
    const apply = () => {
      const h = window.matchMedia("(min-width: 768px)").matches ? 38 : 44;
      root.style.setProperty("--announcement-h", `${h}px`);
      document.body.style.paddingTop = `${h}px`;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      root.style.setProperty("--announcement-h", "0px");
      document.body.style.paddingTop = "";
    };
  }, [visible]);

  if (!visible) return null;

  const close = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* private mode — the bar simply returns next visit */
    }
    setDismissed(true);
  };

  return (
    <div className="mk-announce">
      <style>{STYLES}</style>
      <a className="mk-announce-link" href="/wce-2026">
        <span className="mk-announce-text">Caribbean Wellness Saint Lucia 2026 · October 11–17</span>
        <span className="mk-announce-dot" aria-hidden="true">•</span>
        <span className="mk-announce-cta">Explore the Experience →</span>
      </a>
      <button type="button" className="mk-announce-close" onClick={close} aria-label="Dismiss announcement">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}