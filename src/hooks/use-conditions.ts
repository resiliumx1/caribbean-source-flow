import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductCondition {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
}

export function useConditions() {
  return useQuery({
    queryKey: ["product-conditions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_conditions" as any)
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data || []) as unknown as ProductCondition[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useProductConditionAssignments() {
  return useQuery({
    queryKey: ["product-condition-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_condition_assignments" as any)
        .select("product_id, condition_id");
      if (error) throw error;
      return (data || []) as unknown as { product_id: string; condition_id: string }[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
