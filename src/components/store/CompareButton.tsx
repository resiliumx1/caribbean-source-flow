import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/lib/comparison-context";
import { cn } from "@/lib/utils";

interface CompareButtonProps {
  productId: string;
  size?: "sm" | "default";
  className?: string;
}

export function CompareButton({ productId, size = "sm", className }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, items } = useComparison();
  const active = isInCompare(productId);
  const full = items.length >= 3 && !active;

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size={size}
      className={cn("gap-1.5", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        active ? removeFromCompare(productId) : addToCompare(productId);
      }}
      disabled={full}
      title={full ? "Remove one to add another" : active ? "Remove from compare" : "Add to compare"}
    >
      <Scale className="w-4 h-4" />
      {active ? "Remove" : "Compare"}
    </Button>
  );
}
