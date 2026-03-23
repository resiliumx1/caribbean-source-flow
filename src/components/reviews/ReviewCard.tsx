import { ThumbsUp, BadgeCheck } from "lucide-react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@/hooks/use-reviews";

interface ReviewCardProps {
  review: Review;
  onHelpful: (reviewId: string) => void;
}

function getAvatarUrl(name: string) {
  const seed = encodeURIComponent(name.trim().toLowerCase());
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const date = new Date(review.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const images = Array.isArray(review.images) ? review.images : [];

  return (
    <div className="border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <StarRating rating={review.rating} size="sm" />
          <h4 className="font-semibold text-foreground mt-1">{review.title}</h4>
        </div>
        {review.is_verified_purchase && (
          <Badge variant="secondary" className="gap-1 flex-shrink-0 text-xs">
            <BadgeCheck className="w-3 h-3" />
            Verified Purchase
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>

      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {images.map((url, i) => (
            <img
              key={i}
              src={url as string}
              alt={`Review image ${i + 1}`}
              loading="lazy"
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-border"
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
        <span>
          {review.user_name} · {date}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
          onClick={() => onHelpful(review.id)}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          Helpful{review.helpful_count > 0 ? ` (${review.helpful_count})` : ""}
        </Button>
      </div>
    </div>
  );
}
