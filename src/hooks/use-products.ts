import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products"> & {
  product_categories?: Tables<"product_categories"> | null;
};

export type ProductCategory = Tables<"product_categories">;

export function useProducts(categorySlug?: string) {
  return useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, product_categories(*)")
        .eq("is_active", true)
        .order("image_url", { ascending: false, nullsFirst: false })
        .order("display_order", { ascending: true });

      if (categorySlug) {
        const { data: category } = await supabase
          .from("product_categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();

        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories(*)")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["product_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as ProductCategory[];
    },
  });
}

export function useBundleItems(bundleId: string) {
  return useQuery({
    queryKey: ["bundle_items", bundleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_items")
        .select("*, products(*)")
        .eq("bundle_id", bundleId);

      if (error) throw error;
      return data;
    },
    enabled: !!bundleId,
  });
}
