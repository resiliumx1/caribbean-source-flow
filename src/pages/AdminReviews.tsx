import { useState } from "react";
import { Star, Eye, Check, X, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminReviews, useUpdateReviewStatus, useDeleteReviews, type Review } from "@/hooks/use-reviews";
import { StarRating } from "@/components/reviews/StarRating";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminReviews() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewReview, setPreviewReview] = useState<(Review & { products: { name: string; slug: string } | null }) | null>(null);

  const { data: reviews = [], isLoading } = useAdminReviews(statusFilter, sort);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateReviewStatus();
  const { mutate: deleteReviews, isPending: isDeleting } = useDeleteReviews();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === reviews.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(reviews.map((r) => r.id)));
    }
  };

  const handleBulk = (action: "approved" | "rejected" | "delete") => {
    const ids = Array.from(selected);
    if (action === "delete") {
      deleteReviews(ids, { onSuccess: () => setSelected(new Set()) });
    } else {
      updateStatus({ ids, status: action }, { onSuccess: () => setSelected(new Set()) });
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-serif font-bold text-foreground">Reviews</h1>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="rating_high">Rating: High → Low</SelectItem>
            <SelectItem value="rating_low">Rating: Low → High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setSelected(new Set()); }}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => handleBulk("approved")} disabled={isUpdating}>
            <Check className="w-3 h-3" /> Approve
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => handleBulk("rejected")} disabled={isUpdating}>
            <X className="w-3 h-3" /> Reject
          </Button>
          <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleBulk("delete")} disabled={isDeleting}>
            <Trash2 className="w-3 h-3" /> Delete
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No {statusFilter !== "all" ? statusFilter : ""} reviews found.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 w-10">
                  <Checkbox
                    checked={selected.size === reviews.length && reviews.length > 0}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="p-3 text-left font-medium text-muted-foreground">User</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Rating</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3">
                    <Checkbox
                      checked={selected.has(review.id)}
                      onCheckedChange={() => toggleSelect(review.id)}
                      aria-label={`Select review by ${review.user_name}`}
                    />
                  </td>
                  <td className="p-3 font-medium text-foreground">
                    {review.products?.name || "Unknown"}
                  </td>
                  <td className="p-3 text-muted-foreground">{review.user_name}</td>
                  <td className="p-3">
                    <StarRating rating={review.rating} size="sm" />
                  </td>
                  <td className="p-3">
                    <Badge className={`text-xs ${STATUS_COLORS[review.status] || ""}`}>
                      {review.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{fmtDate(review.created_at)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setPreviewReview(review)} aria-label="Preview">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {review.status !== "approved" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatus({ ids: [review.id], status: "approved" })}
                          aria-label="Approve"
                        >
                          <Check className="w-4 h-4 text-primary" />
                        </Button>
                      )}
                      {review.status !== "rejected" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatus({ ids: [review.id], status: "rejected" })}
                          aria-label="Reject"
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewReview} onOpenChange={(open) => !open && setPreviewReview(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Review Details</DialogTitle>
          </DialogHeader>
          {previewReview && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{previewReview.products?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <StarRating rating={previewReview.rating} />
                <Badge className={STATUS_COLORS[previewReview.status]}>{previewReview.status}</Badge>
              </div>
              <div>
                <p className="font-semibold">{previewReview.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{previewReview.content}</p>
              </div>
              {Array.isArray(previewReview.images) && previewReview.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {previewReview.images.map((url, i) => (
                    <img key={i} src={url as string} alt="" className="w-24 h-24 object-cover rounded-lg border border-border" />
                  ))}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <p>{previewReview.user_name} · {previewReview.user_email}</p>
                <p>{fmtDate(previewReview.created_at)}</p>
                {previewReview.is_verified_purchase && <p className="text-primary font-medium mt-1">✓ Verified Purchase</p>}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    updateStatus({ ids: [previewReview.id], status: "approved" });
                    setPreviewReview(null);
                  }}
                >
                  <Check className="w-3 h-3" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => {
                    updateStatus({ ids: [previewReview.id], status: "rejected" });
                    setPreviewReview(null);
                  }}
                >
                  <X className="w-3 h-3" /> Reject
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1"
                  onClick={() => {
                    deleteReviews([previewReview.id]);
                    setPreviewReview(null);
                  }}
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
