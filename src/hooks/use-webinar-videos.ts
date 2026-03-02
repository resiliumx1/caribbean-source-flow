import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WebinarVideo {
  id: string;
  youtube_video_id: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  category: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export function useWebinarVideos(category?: string) {
  return useQuery({
    queryKey: ["webinar-videos", category],
    queryFn: async () => {
      let query = supabase
        .from("webinar_videos" as any)
        .select("*")
        .order("published_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as WebinarVideo[];
    },
  });
}
