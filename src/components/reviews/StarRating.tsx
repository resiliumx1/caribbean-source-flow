import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };

export function StarRating({ rating, size = "md", interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(
            "transition-colors",
            interactive && "cursor-pointer hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
            !interactive && "cursor-default"
          )}
          aria-label={interactive ? `Rate ${star} star${star > 1 ? "s" : ""}` : undefined}
        >
          <Star
            className={cn(
              sizes[size],
              star <= rating
                ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}
