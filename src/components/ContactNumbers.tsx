import { useStore } from "@/lib/store-context";

interface ContactNumbersProps {
  variant?: "stacked" | "inline";
  className?: string;
  linkClassName?: string;
}

const formatDisplay = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    const a = digits.slice(1, 4);
    const b = digits.slice(4, 7);
    const c = digits.slice(7, 11);
    // US format for 305, international format for 758
    return a === "305" ? `${a}-${b}-${c}` : `+1 (${a}) ${b}-${c}`;
  }
  return raw;
};

export function ContactNumbers({
  variant = "stacked",
  className = "",
  linkClassName = "",
}: ContactNumbersProps) {
  const { storePhone, saintLuciaPhone1, saintLuciaPhone2 } = useStore();

  const numbers = [
    { flag: "🇺🇸", tel: storePhone, display: formatDisplay(storePhone) },
    { flag: "🇱🇨", tel: saintLuciaPhone1, display: formatDisplay(saintLuciaPhone1) },
    { flag: "🇱🇨", tel: saintLuciaPhone2, display: formatDisplay(saintLuciaPhone2) },
  ];

  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center flex-wrap gap-x-3 gap-y-1 ${className}`}>
        {numbers.map((n, i) => (
          <span key={n.tel} className="inline-flex items-center gap-1 whitespace-nowrap">
            <span aria-hidden="true">{n.flag}</span>
            <a
              href={`tel:${n.tel}`}
              className={`transition-colors ${linkClassName}`}
            >
              {n.display}
            </a>
            {i < numbers.length - 1 && (
              <span className="ml-1 opacity-40">·</span>
            )}
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {numbers.map((n) => (
        <a
          key={n.tel}
          href={`tel:${n.tel}`}
          className={`inline-flex items-center gap-2 min-h-[44px] transition-colors ${linkClassName}`}
        >
          <span aria-hidden="true" className="text-base">{n.flag}</span>
          <span>{n.display}</span>
        </a>
      ))}
    </div>
  );
}
