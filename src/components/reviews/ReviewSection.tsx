import { useState } from "react";
import { StarRating } from "./StarRating";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { useProductReviews, useReviewStats, useMarkHelpful } from "@/hooks/use-reviews";
import { MessageSquarePlus } from "lucide-react";

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const { data: reviewData, isLoading } = useProductReviews(productId, page);
  const { data: stats } = useReviewStats(productId);
  const { mutate: markHelpful } = useMarkHelpful();

  const reviews = reviewData?.reviews ?? [];
  const total = reviewData?.total ?? 0;
  const hasMore = (page + 1) * 10 < total;

  const handleHelpful = (reviewId: string) => {
    markHelpful({ reviewId, productId });
  };

  return (
    <section className="py-12 border-t border-border">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Customer Reviews</h2>

          {stats && stats.total > 0 ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-foreground">{stats.average.toFixed(1)}</span>
                <StarRating rating={Math.round(stats.average)} size="md" />
              </div>
              <span className="text-sm text-muted-foreground">Based on {stats.total} review{stats.total !== 1 ? "s" : ""}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet</p>
          )}

          {/* Distribution bars */}
          {stats && stats.total > 0 && (
            <div className="mt-4 space-y-1.5 max-w-xs">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-muted-foreground">{star}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[hsl(var(--gold))] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button variant="outline" className="gap-2" onClick={() => setFormOpen(true)}>
          <MessageSquarePlus className="w-4 h-4" />
          Write a Review
        </Button>
      </div>

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onHelpful={handleHelpful} />
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">Be the first to share your journey</p>
          <p className="text-sm text-muted-foreground mb-4">Your experience helps others on their wellness path.</p>
          <Button variant="outline" onClick={() => setFormOpen(true)}>Write a Review</Button>
        </div>
      )}

      <ReviewForm productId={productId} open={formOpen} onOpenChange={setFormOpen} />
    </section>
  );
}
