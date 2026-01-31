import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, DollarSign } from "lucide-react";

export function CurrencyToggle() {
  const { currency, setCurrency } = useStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 font-medium">
          <DollarSign className="w-4 h-4" />
          {currency === "USD" ? "US$" : "EC$"}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setCurrency("USD")}
          className={currency === "USD" ? "bg-accent" : ""}
        >
          <span className="mr-2">🇺🇸</span>
          USD (US$)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setCurrency("XCD")}
          className={currency === "XCD" ? "bg-accent" : ""}
        >
          <span className="mr-2">🇱🇨</span>
          XCD (EC$)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
