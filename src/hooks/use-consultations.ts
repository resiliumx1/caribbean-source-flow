import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Slot } from "@/lib/consultation-utils";

export interface ConsultationService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  duration_minutes: number;
  price_usd: number;
  price_xcd: number;
  mode: "in_person" | "online" | "both";
  image_url: string | null;
  min_notice_hours: number;
  max_advance_days: number;
}

export interface ConsultationPractitioner {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  timezone: string;
}

export interface AvailabilityResponse {
  service: ConsultationService;
  practitioner: ConsultationPractitioner;
  range: { from: string; to: string };
  slots: Slot[];
}

async function fetchAvailability(body: Record<string, unknown>): Promise<AvailabilityResponse> {
  const { data, error } = await supabase.functions.invoke("consultation-availability", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as AvailabilityResponse;
}

/** Full availability for the booking wizard. */
export function useConsultationAvailability(serviceSlug?: string) {
  return useQuery({
    queryKey: ["consultation-availability", serviceSlug ?? "default"],
    queryFn: () => fetchAvailability(serviceSlug ? { service_slug: serviceSlug } : {}),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

/** Just the next open slot — used for the homepage availability signal. */
export function useNextConsultationSlot() {
  return useQuery({
    queryKey: ["consultation-next-slot"],
    queryFn: () => fetchAvailability({ next_only: true }),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export interface IntakeQuestion {
  id: string;
  question: string;
  type: "text" | "textarea" | "select" | "checkbox";
  options: string[];
  is_required: boolean;
  display_order: number;
}

export function useIntakeQuestions(serviceId?: string) {
  return useQuery({
    queryKey: ["consultation-intake", serviceId],
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<IntakeQuestion[]> => {
      const { data, error } = await supabase
        .from("consultation_intake_questions")
        .select("id, question, type, options, is_required, display_order")
        .eq("service_id", serviceId!)
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((q) => ({
        ...q,
        type: q.type as IntakeQuestion["type"],
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
      }));
    },
  });
}
