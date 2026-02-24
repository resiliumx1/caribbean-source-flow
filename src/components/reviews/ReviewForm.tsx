import { useState } from "react";
import { z } from "zod";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useSubmitReview } from "@/hooks/use-reviews";

const reviewSchema = z.object({
  user_name: z.string().trim().min(1, "Name is required").max(100),
  user_email: z.string().trim().email("Valid email required").max(255),
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(10, "Review must be at least 10 characters").max(5000),
});

interface ReviewFormProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewForm({ productId, open, onOpenChange }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitReview, isPending } = useSubmitReview();

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 2 * 1024 * 1024);
    setImages((prev) => [...prev, ...valid].slice(0, 3));
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // spam bot

    const result = reviewSchema.safeParse({ user_name: name, user_email: email, title, content });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (rating === 0) {
      setErrors({ rating: "Please select a rating" });
      return;
    }

    setErrors({});
    submitReview(
      {
        product_id: productId,
        user_name: name,
        user_email: email,
        rating,
        title,
        content,
        images,
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    );
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // reset
      setRating(0);
      setName("");
      setEmail("");
      setTitle("");
      setContent("");
      setImages([]);
      setErrors({});
      setSubmitted(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Write a Review</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-3xl">✓</span>
            </div>
            <p className="font-semibold text-foreground">Thank you!</p>
            <p className="text-sm text-muted-foreground">Your review is pending approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 block">Rating</Label>
              <StarRating rating={rating} size="lg" interactive onChange={setRating} />
              {errors.rating && <p className="text-sm text-destructive mt-1">{errors.rating}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="review-name">Name</Label>
                <Input id="review-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                {errors.user_name && <p className="text-sm text-destructive mt-1">{errors.user_name}</p>}
              </div>
              <div>
                <Label htmlFor="review-email">Email</Label>
                <Input id="review-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                {errors.user_email && <p className="text-sm text-destructive mt-1">{errors.user_email}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="review-title">Review Title</Label>
              <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="review-content">Your Review</Label>
              <Textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with this product..."
                className="min-h-[120px]"
              />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content}</p>}
            </div>

            <div>
              <Label>Images (optional, max 3)</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((file, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageAdd} />
                  </label>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit Review
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
