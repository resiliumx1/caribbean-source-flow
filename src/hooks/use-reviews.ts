import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PAGE_SIZE = 10;

function getSessionId(): string {
  let id = localStorage.getItem("kailash_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("kailash_session_id", id);
  }
  return id;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  status: string;
  helpful_count: number;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

export function useProductReviews(productId: string | undefined, page: number = 0) {
  return useQuery({
    queryKey: ["reviews", productId, page],
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("reviews")
        .select("*", { count: "exact" })
        .eq("product_id", productId!)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { reviews: (data ?? []) as Review[], total: count ?? 0 };
    },
    enabled: !!productId,
  });
}

export function useReviewStats(productId: string | undefined) {
  return useQuery({
    queryKey: ["review-stats", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId!)
        .eq("status", "approved");

      if (error) throw error;

      const reviews = data ?? [];
      const total = reviews.length;
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;

      reviews.forEach((r) => {
        sum += r.rating;
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      });

      return {
        average: total > 0 ? sum / total : 0,
        total,
        distribution,
      } as ReviewStats;
    },
    enabled: !!productId,
  });
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 1200;
      let w = img.width;
      let h = img.height;
      if (w > MAX_WIDTH) {
        h = Math.round((h * MAX_WIDTH) / w);
        w = MAX_WIDTH;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8);
    };
    img.src = url;
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      product_id: string;
      user_name: string;
      user_email: string;
      rating: number;
      title: string;
      content: string;
      images: File[];
    }) => {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of input.images) {
        const compressed = await compressImage(file);
        const path = `${input.product_id}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("review-images")
          .upload(path, compressed, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      // Check verified purchase
      const { data: verified } = await supabase.rpc("check_verified_purchase", {
        p_email: input.user_email,
        p_product_id: input.product_id,
      });

      const { error } = await supabase.from("reviews").insert({
        product_id: input.product_id,
        user_name: input.user_name,
        user_email: input.user_email,
        rating: input.rating,
        title: input.title,
        content: input.content,
        images: imageUrls,
        status: "pending",
        is_verified_purchase: !!verified,
      });

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", vars.product_id] });
      queryClient.invalidateQueries({ queryKey: ["review-stats", vars.product_id] });
      toast.success("Thank you! Your review is pending approval.");
    },
    onError: () => {
      toast.error("Failed to submit review. Please try again.");
    },
  });
}

export function useMarkHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, productId }: { reviewId: string; productId: string }) => {
      const sessionId = getSessionId();

      // Insert helpfulness vote
      const { error: voteError } = await supabase
        .from("review_helpfulness")
        .insert({ review_id: reviewId, session_id: sessionId });

      if (voteError) {
        if (voteError.code === "23505") {
          throw new Error("already_voted");
        }
        throw voteError;
      }

      // Increment count
      const { data: review } = await supabase
        .from("reviews")
        .select("helpful_count")
        .eq("id", reviewId)
        .single();

      if (review) {
        await supabase
          .from("reviews")
          .update({ helpful_count: (review.helpful_count || 0) + 1 })
          .eq("id", reviewId);
      }

      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (err: Error) => {
      if (err.message === "already_voted") {
        toast.info("You've already marked this review as helpful.");
      } else {
        toast.error("Could not record your vote.");
      }
    },
  });
}

// Admin hooks
export function useAdminReviews(status: string, sort: string) {
  return useQuery({
    queryKey: ["admin-reviews", status, sort],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("*, products(name, slug)");

      if (status !== "all") {
        query = query.eq("status", status);
      }

      switch (sort) {
        case "rating_high":
          query = query.order("rating", { ascending: false });
          break;
        case "rating_low":
          query = query.order("rating", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Review & { products: { name: string; slug: string } | null })[];
    },
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      for (const id of ids) {
        const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Reviews updated.");
    },
  });
}

export function useDeleteReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        const { error } = await supabase.from("reviews").delete().eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Reviews deleted.");
    },
  });
}
