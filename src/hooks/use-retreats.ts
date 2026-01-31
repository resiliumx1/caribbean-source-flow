import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RetreatType {
  id: string;
  slug: string;
  name: string;
  type: "group" | "solo";
  min_nights: number;
  max_nights: number;
  base_price_usd: number;
  price_type: "per_person" | "per_night";
  max_capacity: number;
  description: string | null;
  includes: string[];
  is_active: boolean;
}

export interface RetreatDate {
  id: string;
  retreat_type_id: string;
  start_date: string;
  end_date: string;
  spots_total: number;
  spots_booked: number;
  price_override_usd: number | null;
  is_published: boolean;
  retreat_types?: RetreatType | { slug: string; name: string; type: string };
}

export interface SoloPricingTier {
  id: string;
  min_nights: number;
  max_nights: number;
  nightly_rate_usd: number;
  discount_percent: number;
}

export function useRetreatTypes() {
  return useQuery({
    queryKey: ["retreat-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retreat_types")
        .select("*")
        .eq("is_active", true)
        .order("type", { ascending: true });

      if (error) throw error;
      return data as RetreatType[];
    },
  });
}

export function useRetreatDates(retreatTypeId?: string) {
  return useQuery({
    queryKey: ["retreat-dates", retreatTypeId],
    queryFn: async () => {
      let query = supabase
        .from("retreat_dates")
        .select(`
          *,
          retreat_types(*)
        `)
        .eq("is_published", true)
        .gte("start_date", new Date().toISOString().split("T")[0])
        .order("start_date", { ascending: true });

      if (retreatTypeId) {
        query = query.eq("retreat_type_id", retreatTypeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as RetreatDate[];
    },
  });
}

export function useSoloPricingTiers() {
  return useQuery({
    queryKey: ["solo-pricing-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solo_pricing_tiers")
        .select("*")
        .order("min_nights", { ascending: true });

      if (error) throw error;
      return data as SoloPricingTier[];
    },
  });
}

export function useNextGroupRetreat() {
  return useQuery({
    queryKey: ["next-group-retreat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retreat_dates")
        .select(`
          *,
          retreat_types!inner(slug, name, type)
        `)
        .eq("retreat_types.type", "group")
        .eq("is_published", true)
        .gte("start_date", new Date().toISOString().split("T")[0])
        .order("start_date", { ascending: true })
        .limit(1)
        .single();

      if (error) return null;
      // Return the data - type is compatible with RetreatDate since retreat_types is a union
      return data as RetreatDate;
    },
  });
}

export function calculateSoloPrice(
  nights: number,
  tiers: SoloPricingTier[]
): { nightly: number; total: number; discount: number } | null {
  if (!tiers || tiers.length === 0) return null;

  const tier = tiers.find(
    (t) => nights >= t.min_nights && nights <= t.max_nights
  );

  if (!tier) {
    // Use highest tier for nights exceeding max
    const maxTier = tiers[tiers.length - 1];
    return {
      nightly: maxTier.nightly_rate_usd,
      total: maxTier.nightly_rate_usd * nights,
      discount: maxTier.discount_percent,
    };
  }

  return {
    nightly: tier.nightly_rate_usd,
    total: tier.nightly_rate_usd * nights,
    discount: tier.discount_percent,
  };
}
