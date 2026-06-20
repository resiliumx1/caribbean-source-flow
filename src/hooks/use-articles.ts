import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_markdown: string;
  author: string;
  published_date: string | null;
  updated_date: string | null;
  cover_image: string | null;
  meta_description: string | null;
  is_published: boolean;
}

/** All published articles, newest first. */
export function useArticles() {
  return useQuery({
    queryKey: ["articles", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles" as any)
        .select(
          "id, slug, title, excerpt, author, published_date, updated_date, cover_image, meta_description",
        )
        .eq("is_published", true)
        .order("published_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as unknown as Article[];
    },
  });
}

/** Single published article by slug. */
export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("articles" as any)
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Article | null;
    },
    enabled: !!slug,
  });
}