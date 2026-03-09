interface GateBotanicalArtProps {
  side: "left" | "right";
}

export function GateBotanicalArt({ side }: GateBotanicalArtProps) {
  if (side === "left") {
    return (
      <svg
        className="gate-art"
        viewBox="0 0 200 560"
        width="200"
        height="560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Vine trunk */}
        <path
          d="M100 540 C100 480 95 420 100 360 C105 300 98 240 100 180 C102 120 100 60 100 20"
          stroke="#c9a96e"
          strokeWidth="0.8"
          opacity="0.1"
        />
        {/* Left leaves */}
        <path d="M100 480 C80 470 60 460 50 440" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
        <ellipse cx="48" cy="438" rx="12" ry="6" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(-30 48 438)" />
        <path d="M100 380 C75 365 55 350 45 330" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
        <ellipse cx="43" cy="328" rx="14" ry="7" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(-25 43 328)" />
        <path d="M100 280 C80 270 60 255 50 240" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
        <ellipse cx="48" cy="238" rx="11" ry="6" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(-35 48 238)" />
        {/* Right leaves */}
        <path d="M100 430 C120 420 140 405 150 390" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
        <ellipse cx="152" cy="388" rx="12" ry="6" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(30 152 388)" />
        <path d="M100 330 C125 320 145 305 155 290" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
        <ellipse cx="157" cy="288" rx="13" ry="6" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(25 157 288)" />
        <path d="M100 230 C120 215 140 200 148 185" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
        <ellipse cx="150" cy="183" rx="11" ry="5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(35 150 183)" />
        {/* Flower clusters */}
        <circle cx="50" cy="180" r="3" stroke="#c9a96e" strokeWidth="0.5" opacity="0.1" />
        <circle cx="56" cy="176" r="2.5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
        <circle cx="53" cy="185" r="2" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
        {/* Top bloom */}
        <circle cx="100" cy="20" r="16" stroke="#c9a96e" strokeWidth="0.8" opacity="0.1" />
        <circle cx="100" cy="20" r="8" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" fill="rgba(201,169,110,0.03)" />
        {/* Petal lines */}
        <path d="M100 4 L100 -2" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
        <path d="M88 10 L82 6" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
        <path d="M112 10 L118 6" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
      </svg>
    );
  }

  // Right gate: bottle/vessel with branches
  return (
    <svg
      className="gate-art"
      viewBox="0 0 200 560"
      width="200"
      height="560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bottle body */}
      <path
        d="M85 180 L85 350 C85 370 90 380 100 380 C110 380 115 370 115 350 L115 180"
        stroke="#c9a96e"
        strokeWidth="0.8"
        opacity="0.1"
      />
      {/* Bottle neck */}
      <path d="M92 180 L92 150 L108 150 L108 180" stroke="#c9a96e" strokeWidth="0.7" opacity="0.1" />
      {/* Stopper */}
      <rect x="88" y="140" width="24" height="12" rx="4" stroke="#c9a96e" strokeWidth="0.7" opacity="0.1" />
      <circle cx="100" cy="135" r="5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
      {/* Label area */}
      <rect x="90" y="240" width="20" height="40" rx="2" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
      {/* Left branch */}
      <path d="M85 350 C60 360 40 380 30 410 C25 430 28 450 35 470" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
      <ellipse cx="28" cy="415" rx="10" ry="5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(-20 28 415)" />
      <ellipse cx="32" cy="450" rx="9" ry="5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(-10 32 450)" />
      {/* Right branch */}
      <path d="M115 350 C140 360 160 380 170 410 C175 430 172 450 165 470" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
      <ellipse cx="172" cy="415" rx="10" ry="5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(20 172 415)" />
      <ellipse cx="168" cy="450" rx="9" ry="5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" transform="rotate(10 168 450)" />
      {/* Root tendrils */}
      <path d="M35 470 C38 490 36 510 30 530" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
      <path d="M165 470 C162 490 164 510 170 530" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
    </svg>
  );
}
