/**
 * SVG star-seal placeholder. Will be replaced with the real star-seal.png
 * when the user uploads it.
 */
export function StarSealFallback() {
  return (
    <svg
      className="star-seal-fallback"
      viewBox="0 0 160 160"
      width="160"
      height="160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <circle cx="80" cy="80" r="72" stroke="#c9a96e" strokeWidth="1.5" opacity="0.6" />
      <circle cx="80" cy="80" r="66" stroke="#c9a96e" strokeWidth="0.5" opacity="0.3" />
      
      {/* 8-pointed star */}
      <polygon
        points="80,12 92,58 138,58 100,84 112,130 80,104 48,130 60,84 22,58 68,58"
        stroke="#c9a96e"
        strokeWidth="1"
        fill="rgba(201,169,110,0.15)"
        opacity="0.8"
      />
      
      {/* Inner diamond star overlay */}
      <polygon
        points="80,24 96,68 140,80 96,92 80,136 64,92 20,80 64,68"
        stroke="#c9a96e"
        strokeWidth="0.7"
        fill="rgba(201,169,110,0.08)"
        opacity="0.6"
      />
      
      {/* Center circle */}
      <circle cx="80" cy="80" r="16" stroke="#c9a96e" strokeWidth="1" fill="rgba(201,169,110,0.2)" opacity="0.7" />
      <circle cx="80" cy="80" r="6" fill="#c9a96e" opacity="0.5" />
    </svg>
  );
}
