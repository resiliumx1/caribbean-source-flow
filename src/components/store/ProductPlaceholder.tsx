import { cn } from "@/lib/utils";

interface ProductPlaceholderProps {
  productType: string;
  className?: string;
}

export function ProductPlaceholder({ productType, className }: ProductPlaceholderProps) {
  // SVG placeholders based on product type
  const getPlaceholder = () => {
    switch (productType) {
      case "tincture":
        return (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Amber glass bottle */}
            <defs>
              <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#B8860B" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8B6914" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Bottle body */}
            <rect x="50" y="80" width="100" height="180" rx="10" fill="url(#amberGradient)" stroke="hsl(42, 85%, 55%)" strokeWidth="2" />
            {/* Bottle neck */}
            <rect x="75" y="40" width="50" height="40" rx="5" fill="url(#amberGradient)" stroke="hsl(42, 85%, 55%)" strokeWidth="2" />
            {/* Cap */}
            <rect x="70" y="20" width="60" height="25" rx="3" fill="hsl(150, 35%, 22%)" />
            {/* Label area */}
            <rect x="60" y="120" width="80" height="100" rx="5" fill="hsl(45, 30%, 96%)" fillOpacity="0.8" />
            {/* Star logo */}
            <path d="M100 145 L103 155 L113 155 L105 162 L108 172 L100 166 L92 172 L95 162 L87 155 L97 155 Z" fill="hsl(42, 85%, 55%)" />
            <text x="100" y="195" textAnchor="middle" fontSize="10" fill="hsl(150, 25%, 12%)" fontFamily="serif">MKRC</text>
          </svg>
        );

      case "capsule":
        return (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Black bottle */}
            <defs>
              <linearGradient id="blackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2a2a2a" />
                <stop offset="50%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#2a2a2a" />
              </linearGradient>
            </defs>
            {/* Bottle body */}
            <rect x="45" y="70" width="110" height="190" rx="15" fill="url(#blackGradient)" stroke="#444" strokeWidth="2" />
            {/* Bottle neck */}
            <rect x="70" y="35" width="60" height="35" rx="5" fill="url(#blackGradient)" stroke="#444" strokeWidth="2" />
            {/* Cap */}
            <rect x="65" y="15" width="70" height="25" rx="5" fill="#333" />
            {/* Label area */}
            <rect x="55" y="110" width="90" height="110" rx="5" fill="hsl(45, 30%, 96%)" fillOpacity="0.9" />
            {/* Flame icon */}
            <path d="M100 130 Q110 145 100 160 Q95 150 100 140 Q105 150 100 160 Q90 145 100 130" fill="hsl(20, 85%, 50%)" />
            <text x="100" y="195" textAnchor="middle" fontSize="10" fill="hsl(150, 25%, 12%)" fontFamily="serif">Capsules</text>
          </svg>
        );

      case "powder":
        return (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Powder container */}
            <defs>
              <linearGradient id="powderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4a4a4a" />
                <stop offset="50%" stopColor="#333" />
                <stop offset="100%" stopColor="#4a4a4a" />
              </linearGradient>
            </defs>
            <rect x="40" y="80" width="120" height="180" rx="10" fill="url(#powderGradient)" stroke="#555" strokeWidth="2" />
            <rect x="65" y="50" width="70" height="30" rx="5" fill="url(#powderGradient)" stroke="#555" strokeWidth="2" />
            <rect x="60" y="30" width="80" height="25" rx="3" fill="#666" />
            <rect x="50" y="120" width="100" height="100" rx="5" fill="hsl(45, 30%, 96%)" fillOpacity="0.9" />
            <text x="100" y="170" textAnchor="middle" fontSize="12" fill="hsl(150, 25%, 12%)" fontFamily="serif">Powder</text>
            <text x="100" y="195" textAnchor="middle" fontSize="10" fill="hsl(150, 25%, 12%)" fontFamily="serif">MKRC</text>
          </svg>
        );

      case "tea":
        return (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Kraft paper pouch */}
            <defs>
              <linearGradient id="kraftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C4A35A" />
                <stop offset="50%" stopColor="#B8956F" />
                <stop offset="100%" stopColor="#C4A35A" />
              </linearGradient>
            </defs>
            {/* Pouch body */}
            <path d="M35 60 L165 60 L175 280 L25 280 Z" fill="url(#kraftGradient)" stroke="#8B7355" strokeWidth="2" />
            {/* Top seal */}
            <rect x="35" y="50" width="130" height="20" fill="#A08060" />
            {/* Window */}
            <ellipse cx="100" cy="120" rx="40" ry="30" fill="hsl(45, 30%, 96%)" fillOpacity="0.3" stroke="#8B7355" strokeWidth="1" />
            {/* Label */}
            <rect x="50" y="160" width="100" height="80" rx="5" fill="hsl(45, 30%, 96%)" fillOpacity="0.9" />
            <text x="100" y="200" textAnchor="middle" fontSize="12" fill="hsl(150, 25%, 12%)" fontFamily="serif">Herbal Tea</text>
            <text x="100" y="220" textAnchor="middle" fontSize="10" fill="hsl(150, 25%, 12%)" fontFamily="serif">MKRC</text>
          </svg>
        );

      case "raw_herb":
        return (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Clear bag with herbs */}
            <defs>
              <linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5f5f5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e0e0e0" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <rect x="30" y="50" width="140" height="220" rx="5" fill="url(#bagGradient)" stroke="#ccc" strokeWidth="2" />
            <rect x="30" y="40" width="140" height="20" fill="#888" />
            {/* Herb leaves inside */}
            <ellipse cx="70" cy="150" rx="20" ry="30" fill="hsl(150, 35%, 35%)" fillOpacity="0.6" transform="rotate(-20, 70, 150)" />
            <ellipse cx="100" cy="180" rx="25" ry="35" fill="hsl(150, 40%, 30%)" fillOpacity="0.7" transform="rotate(10, 100, 180)" />
            <ellipse cx="130" cy="140" rx="18" ry="28" fill="hsl(150, 35%, 40%)" fillOpacity="0.5" transform="rotate(15, 130, 140)" />
            {/* Label */}
            <rect x="50" y="220" width="100" height="35" rx="3" fill="hsl(45, 30%, 96%)" />
            <text x="100" y="242" textAnchor="middle" fontSize="10" fill="hsl(150, 25%, 12%)" fontFamily="serif">Raw Herbs</text>
          </svg>
        );

      case "bundle":
        return (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Bundle box */}
            <defs>
              <linearGradient id="bundleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(150, 35%, 25%)" />
                <stop offset="100%" stopColor="hsl(150, 35%, 18%)" />
              </linearGradient>
            </defs>
            {/* Box */}
            <rect x="25" y="80" width="150" height="180" rx="8" fill="url(#bundleGradient)" stroke="hsl(42, 85%, 55%)" strokeWidth="3" />
            {/* Ribbon */}
            <rect x="90" y="80" width="20" height="180" fill="hsl(42, 85%, 55%)" fillOpacity="0.8" />
            <rect x="25" y="160" width="150" height="20" fill="hsl(42, 85%, 55%)" fillOpacity="0.8" />
            {/* Bow */}
            <ellipse cx="100" cy="155" rx="25" ry="15" fill="hsl(42, 85%, 55%)" />
            <ellipse cx="100" cy="175" rx="25" ry="15" fill="hsl(42, 85%, 55%)" />
            {/* Label */}
            <rect x="40" y="200" width="120" height="45" rx="5" fill="hsl(45, 30%, 96%)" fillOpacity="0.95" />
            <text x="100" y="225" textAnchor="middle" fontSize="11" fill="hsl(150, 25%, 12%)" fontFamily="serif">Value Bundle</text>
            <text x="100" y="238" textAnchor="middle" fontSize="8" fill="hsl(150, 25%, 12%)" fontFamily="serif">MKRC</text>
          </svg>
        );

      case "soap":
        return (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Soap bar */}
            <defs>
              <linearGradient id="soapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#B8860B" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect x="30" y="100" width="140" height="100" rx="15" fill="url(#soapGradient)" stroke="hsl(42, 85%, 45%)" strokeWidth="2" />
            {/* Stamp impression */}
            <circle cx="100" cy="150" r="30" fill="none" stroke="hsl(150, 35%, 22%)" strokeWidth="2" />
            <text x="100" y="145" textAnchor="middle" fontSize="8" fill="hsl(150, 35%, 22%)" fontFamily="serif">MOUNT</text>
            <text x="100" y="158" textAnchor="middle" fontSize="8" fill="hsl(150, 35%, 22%)" fontFamily="serif">KAILASH</text>
            {/* Label below */}
            <rect x="40" y="220" width="120" height="40" rx="5" fill="hsl(45, 30%, 96%)" />
            <text x="100" y="245" textAnchor="middle" fontSize="10" fill="hsl(150, 25%, 12%)" fontFamily="serif">Herbal Soap</text>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="40" y="60" width="120" height="180" rx="10" fill="hsl(40, 20%, 90%)" stroke="hsl(40, 20%, 85%)" strokeWidth="2" />
            <text x="100" y="160" textAnchor="middle" fontSize="12" fill="hsl(150, 25%, 40%)" fontFamily="serif">Product Image</text>
            <text x="100" y="180" textAnchor="middle" fontSize="10" fill="hsl(150, 25%, 40%)" fontFamily="serif">Coming Soon</text>
          </svg>
        );
    }
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-cream via-parchment to-cream-warm flex items-center justify-center p-4",
        className
      )}
    >
      {getPlaceholder()}
    </div>
  );
}
