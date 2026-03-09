/** Half-wreath SVG used on each gate panel — identical to the HTML source */
export function GateWreathSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" fill="none">
      <circle cx="260" cy="260" r="224" stroke="rgba(201,169,110,0.07)" strokeWidth="1"/>
      <circle cx="260" cy="260" r="192" stroke="rgba(201,169,110,0.13)" strokeWidth="1.2" fill="none" strokeDasharray="6 4"/>
      <circle cx="260" cy="260" r="164" stroke="rgba(201,169,110,0.09)" strokeWidth="0.8" fill="none"/>

      <g transform="rotate(0,260,260)">
        <line x1="260" y1="68" x2="260" y2="44" stroke="#c9a96e" strokeWidth="0.9"/>
        <ellipse cx="260" cy="42" rx="3" ry="5" fill="rgba(201,169,110,0.55)" stroke="#c9a96e" strokeWidth="0.6"/>
        <ellipse cx="256" cy="50" rx="2.5" ry="4" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(-18,256,50)"/>
        <ellipse cx="264" cy="50" rx="2.5" ry="4" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(18,264,50)"/>
        <ellipse cx="254" cy="58" rx="2" ry="3.5" fill="rgba(201,169,110,0.35)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(-25,254,58)"/>
        <ellipse cx="266" cy="58" rx="2" ry="3.5" fill="rgba(201,169,110,0.35)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(25,266,58)"/>
        <path d="M260 68 Q248 72 244 80 Q254 76 260 68Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 68 Q272 72 276 80 Q266 76 260 68Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.5"/>
      </g>
      <g transform="rotate(36,260,260)">
        <line x1="260" y1="68" x2="260" y2="48" stroke="#c9a96e" strokeWidth="0.9"/>
        {[0,30,60,90,120,150].map(r=>(
          <ellipse key={r} cx="260" cy="40" rx="4" ry="7" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.6" transform={`rotate(${r},260,40)`}/>
        ))}
        <circle cx="260" cy="40" r="5" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.7"/>
      </g>
      <g transform="rotate(72,260,260)">
        <path d="M260 70 Q260 52 260 38" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 65 Q252 60 248 54" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M248 54 Q244 50 244 46 Q248 49 250 53Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 58 Q252 52 248 46" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M248 46 Q244 42 243 38 Q247 41 249 45Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 65 Q268 60 272 54" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M272 54 Q276 50 276 46 Q272 49 270 53Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 58 Q268 52 272 46" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M272 46 Q276 42 277 38 Q273 41 271 45Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
      </g>
      <g transform="rotate(108,260,260)">
        <line x1="260" y1="70" x2="260" y2="52" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 52 Q252 46 250 38 Q258 42 261 50Z" fill="rgba(201,169,110,0.25)" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M260 52 Q268 46 270 38 Q262 42 259 50Z" fill="rgba(201,169,110,0.25)" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M260 52 Q260 41 260 36 Q256 42 258 51Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="52" x2="260" y2="44" stroke="#c9a96e" strokeWidth="0.8"/>
        <circle cx="260" cy="43" r="2.5" fill="rgba(201,169,110,0.6)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 68 Q252 70 250 76 Q257 72 260 68Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.4"/>
        <path d="M260 68 Q268 70 270 76 Q263 72 260 68Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.4"/>
      </g>
      <g transform="rotate(144,260,260)">
        <path d="M260 70 L260 36" stroke="#c9a96e" strokeWidth="1"/>
        <path d="M260 66 L253 62 M260 66 L267 62" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 60 L252 56 M260 60 L268 56" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 54 L253 50 M260 54 L267 50" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 48 L254 44 M260 48 L266 44" stroke="#c9a96e" strokeWidth="0.7"/>
        <circle cx="253" cy="62" r="1.2" fill="rgba(201,169,110,0.5)"/>
        <circle cx="267" cy="62" r="1.2" fill="rgba(201,169,110,0.5)"/>
        <circle cx="252" cy="56" r="1.2" fill="rgba(201,169,110,0.5)"/>
        <circle cx="268" cy="56" r="1.2" fill="rgba(201,169,110,0.5)"/>
      </g>
      <g transform="rotate(180,260,260)">
        <line x1="260" y1="68" x2="260" y2="46" stroke="#c9a96e" strokeWidth="0.9"/>
        <line x1="260" y1="50" x2="250" y2="44" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="50" x2="260" y2="40" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="50" x2="270" y2="44" stroke="#c9a96e" strokeWidth="0.5"/>
        <circle cx="250" cy="43" r="2.5" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5"/>
        <circle cx="260" cy="39" r="2.8" fill="rgba(201,169,110,0.5)" stroke="#c9a96e" strokeWidth="0.6"/>
        <circle cx="270" cy="43" r="2.5" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5"/>
      </g>
      <g transform="rotate(216,260,260)">
        <path d="M260 70 Q260 55 260 42" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 46 Q250 40 248 34 Q256 38 260 44Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M260 46 Q270 40 272 34 Q264 38 260 44Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.6"/>
        <line x1="260" y1="44" x2="258" y2="36" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="44" x2="262" y2="36" stroke="#c9a96e" strokeWidth="0.5"/>
        <circle cx="260" cy="33" r="1.4" fill="rgba(201,169,110,0.65)"/>
        <path d="M260 62 Q248 64 244 72 Q254 68 260 62Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.4"/>
        <path d="M260 62 Q272 64 276 72 Q266 68 260 62Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.4"/>
      </g>
      <g transform="rotate(252,260,260)">
        <path d="M260 70 Q256 58 254 46 Q260 52 260 44" stroke="#c9a96e" strokeWidth="0.85"/>
        <ellipse cx="256" cy="66" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.4" transform="rotate(-20,256,66)"/>
        <ellipse cx="264" cy="64" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.4" transform="rotate(20,264,64)"/>
        <ellipse cx="255" cy="58" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.4" transform="rotate(-25,255,58)"/>
        <ellipse cx="265" cy="56" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.4" transform="rotate(25,265,56)"/>
        <circle cx="259" cy="44" r="1.5" fill="rgba(201,169,110,0.5)" stroke="#c9a96e" strokeWidth="0.4"/>
        <circle cx="261" cy="42" r="1.5" fill="rgba(201,169,110,0.5)" stroke="#c9a96e" strokeWidth="0.4"/>
      </g>
      <g transform="rotate(288,260,260)">
        <line x1="260" y1="70" x2="260" y2="50" stroke="#c9a96e" strokeWidth="0.9"/>
        {[0,36,72,108,144].map(r=>(
          <ellipse key={r} cx="260" cy="42" rx="3.5" ry="8" fill="rgba(201,169,110,0.15)" stroke="#c9a96e" strokeWidth="0.5" transform={`rotate(${r},260,42)`}/>
        ))}
        <circle cx="260" cy="42" r="5" stroke="rgba(201,169,110,0.35)" strokeWidth="0.5" fill="none"/>
        <circle cx="260" cy="42" r="3" fill="rgba(201,169,110,0.4)" stroke="#c9a96e" strokeWidth="0.6"/>
      </g>
      <g transform="rotate(324,260,260)">
        <path d="M260 70 L260 42" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 65 Q250 60 248 52 Q256 56 260 63Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.55"/>
        <path d="M260 65 Q270 60 272 52 Q264 56 260 63Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.55"/>
        <path d="M260 55 Q251 50 250 42 Q257 46 260 53Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 55 Q269 50 270 42 Q263 46 260 53Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.5"/>
      </g>
      {/* Small dot accents between sprigs */}
      {[18,54,90,126,162,198,234,270,306,342].map((angle, i) => (
        <g key={angle} transform={`rotate(${angle},260,260)`}>
          <circle cx="260" cy="68" r={i % 2 === 0 ? 1.2 : 1.3} fill={`rgba(201,169,110,${i % 2 === 0 ? 0.3 : 0.35})`}/>
        </g>
      ))}
    </svg>
  );
}
