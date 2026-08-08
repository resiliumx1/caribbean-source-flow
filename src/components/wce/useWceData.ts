import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useWcePathways() {
  return useQuery({
    queryKey: ["wce_pathways"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wce_pathways").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useWceSpeakers() {
  return useQuery({
    queryKey: ["wce_speakers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wce_speakers").select("*").eq("published", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useWceMedia() {
  return useQuery({
    queryKey: ["wce_media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wce_media").select("*").eq("published", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useWceFaqs() {
  return useQuery({
    queryKey: ["wce_faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wce_faqs").select("*").eq("published", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useWceItinerary() {
  return useQuery({
    queryKey: ["wce_itinerary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wce_itinerary").select("*").eq("published", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useWcePartners() {
  return useQuery({
    queryKey: ["wce_partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wce_partners").select("*").eq("published", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useWceSettings() {
  return useQuery({
    queryKey: ["wce_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wce_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function pathwayFeatures(features: unknown): string[] {
  return Array.isArray(features) ? (features as unknown[]).map(String) : [];
}
