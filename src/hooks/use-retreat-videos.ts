import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RetreatVideo {
  id: string;
  title: string | null;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
}

export const RETREAT_VIDEO_CATEGORIES = [
  { value: "experience", label: "Experience" },
  { value: "healing", label: "Healing" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
] as const;

export function useRetreatVideos(category?: string) {
  return useQuery({
    queryKey: ["retreat-videos", category],
    queryFn: async () => {
      let query = supabase
        .from("retreat_videos" as any)
        .select("*")
        .order("display_order", { ascending: true });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as RetreatVideo[];
    },
  });
}

export function useRetreatVideoMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadVideo = useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      category,
      thumbnailFile,
    }: {
      file?: File;
      videoUrl?: string;
      title?: string;
      description?: string;
      category: string;
      thumbnailFile?: File;
    } & ({ file: File } | { videoUrl: string })) => {
      let videoUrl: string;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `videos/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("retreat-images")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("retreat-images")
          .getPublicUrl(fileName);
        videoUrl = urlData.publicUrl;
      } else {
        videoUrl = (arguments[0] as any).videoUrl;
      }

      let thumbnailUrl: string | null = null;
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split(".").pop();
        const thumbName = `thumbnails/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("retreat-images")
          .upload(thumbName, thumbnailFile);
        if (!error) {
          const { data } = supabase.storage
            .from("retreat-images")
            .getPublicUrl(thumbName);
          thumbnailUrl = data.publicUrl;
        }
      }

      const { data: existing } = await (supabase
        .from("retreat_videos" as any)
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1) as any);

      const nextOrder = existing?.length ? (existing[0] as any).display_order + 1 : 0;

      const { error: insertError } = await (supabase.from("retreat_videos" as any) as any).insert({
        title: title || null,
        description: description || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        category,
        display_order: nextOrder,
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retreat-videos"] });
      toast({ title: "Video added successfully" });
    },
    onError: (error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { data: video } = await (supabase
        .from("retreat_videos" as any)
        .select("video_url, thumbnail_url")
        .eq("id", id)
        .single() as any);

      // Clean up storage files
      if (video) {
        for (const url of [video.video_url, video.thumbnail_url]) {
          if (url && url.includes("retreat-images")) {
            const parts = url.split("/retreat-images/");
            if (parts[1]) {
              await supabase.storage.from("retreat-images").remove([parts[1]]);
            }
          }
        }
      }

      const { error } = await (supabase.from("retreat_videos" as any) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retreat-videos"] });
      toast({ title: "Video deleted" });
    },
    onError: (error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  return { uploadVideo, deleteVideo };
}
