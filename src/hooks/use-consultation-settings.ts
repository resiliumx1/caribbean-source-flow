import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ConsultationSettings } from "@/components/consultation/ConsultationBookingForm";

export function useConsultationSettings() {
  return useQuery<ConsultationSettings | null>({
    queryKey: ["consultation_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultation_settings")
        .select("value")
        .eq("key", "consultation")
        .single();
      if (error) {
        console.error("consultation_settings error:", error);
        return null;
      }
      return (data?.value as ConsultationSettings) || null;
    },
    staleTime: 1000 * 60 * 5,
  });
}
