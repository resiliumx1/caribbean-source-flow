interface WreathSVGProps {
  className?: string;
}

export function WreathSVG({ className }: WreathSVGProps) {
  const motifs = Array.from({ length: 10 }, (_, i) => i * 36);
  
  return (
    <svg
      className={className}
      viewBox="0 0 520 520"
      width="520"
      height="520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Guide circles */}
      <circle cx="260" cy="260" r="192" stroke="#c9a96e" strokeWidth="0.5" opacity="0.06" strokeDasharray="4 6" />
      <circle cx="260" cy="260" r="207" stroke="#c9a96e" strokeWidth="0.3" opacity="0.04" />

      {/* Botanical motifs arranged around the circle */}
      {motifs.map((deg, i) => (
        <g key={i} transform={`rotate(${deg} 260 260)`}>
          {i % 5 === 0 && (
            /* Leaf sprig */
            <g>
              <path d="M260 68 C255 55 248 42 260 30 C272 42 265 55 260 68" stroke="#c9a96e" strokeWidth="0.7" opacity="0.1" fill="rgba(201,169,110,0.02)" />
              <line x1="260" y1="68" x2="260" y2="78" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
            </g>
          )}
          {i % 5 === 1 && (
            /* Multi-petal flower */
            <g>
              <circle cx="260" cy="60" r="8" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
              <circle cx="260" cy="60" r="3" stroke="#c9a96e" strokeWidth="0.4" opacity="0.08" fill="rgba(201,169,110,0.03)" />
              <line x1="260" y1="52" x2="260" y2="46" stroke="#c9a96e" strokeWidth="0.4" opacity="0.06" />
              <line x1="254" y1="55" x2="250" y2="50" stroke="#c9a96e" strokeWidth="0.4" opacity="0.06" />
              <line x1="266" y1="55" x2="270" y2="50" stroke="#c9a96e" strokeWidth="0.4" opacity="0.06" />
            </g>
          )}
          {i % 5 === 2 && (
            /* Fern frond */
            <g>
              <path d="M260 75 L260 48" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
              <path d="M260 70 C254 66 250 62 248 58" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
              <path d="M260 65 C266 61 270 57 272 53" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
              <path d="M260 58 C254 54 250 50 249 46" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
              <path d="M260 53 C266 49 270 45 271 41" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
            </g>
          )}
          {i % 5 === 3 && (
            /* Berry cluster */
            <g>
              <circle cx="256" cy="58" r="3" stroke="#c9a96e" strokeWidth="0.5" opacity="0.1" fill="rgba(201,169,110,0.03)" />
              <circle cx="264" cy="58" r="3" stroke="#c9a96e" strokeWidth="0.5" opacity="0.1" fill="rgba(201,169,110,0.03)" />
              <circle cx="260" cy="52" r="3" stroke="#c9a96e" strokeWidth="0.5" opacity="0.1" fill="rgba(201,169,110,0.03)" />
              <line x1="260" y1="62" x2="260" y2="74" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
            </g>
          )}
          {i % 5 === 4 && (
            /* Seed pod */
            <g>
              <ellipse cx="260" cy="58" rx="5" ry="10" stroke="#c9a96e" strokeWidth="0.6" opacity="0.1" />
              <line x1="260" y1="68" x2="260" y2="76" stroke="#c9a96e" strokeWidth="0.5" opacity="0.08" />
              <line x1="260" y1="48" x2="260" y2="44" stroke="#c9a96e" strokeWidth="0.4" opacity="0.06" />
            </g>
          )}
          {/* Dot accent between motifs */}
          <circle cx="260" cy="82" r="1.2" fill="#c9a96e" opacity="0.08" />
        </g>
      ))}
    </svg>
  );
}
