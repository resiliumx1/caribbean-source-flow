import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductVariant {
  id: string;
  product_id: string;
  size_label: string;
  size_oz: number;
  price_usd: number;
  price_xcd: number;
  discount_percent: number;
  stock_status: string;
  is_default: boolean;
  created_at: string;
}

export function useProductVariants(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("size_oz", { ascending: true });

      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });
}

export function useDefaultVariant(productId: string | undefined) {
  const { data: variants = [] } = useProductVariants(productId);
  return variants.find((v) => v.is_default) || variants[0] || null;
}
