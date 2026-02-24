import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/image-utils";

export interface RetreatGalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
}

export const RETREAT_CATEGORIES = [
  { value: "experience", label: "Experience" },
  { value: "healing", label: "Healing" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
] as const;

export function useRetreatGallery(category?: string) {
  return useQuery({
    queryKey: ["retreat-gallery", category],
    queryFn: async () => {
      let query = supabase
        .from("retreat_gallery")
        .select("*")
        .order("display_order", { ascending: true });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RetreatGalleryImage[];
    },
  });
}

export function useFeaturedRetreatImages() {
  return useQuery({
    queryKey: ["retreat-gallery", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retreat_gallery")
        .select("*")
        .eq("is_featured", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as RetreatGalleryImage[];
    },
  });
}

export function useRetreatGalleryMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadImage = useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      category,
      isFeatured,
    }: {
      file: File;
      title?: string;
      description?: string;
      category: string;
      isFeatured?: boolean;
    }) => {
      // Compress before upload
      const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 1600 });

      // Upload to storage
      const fileExt = compressed.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("retreat-images")
        .upload(fileName, compressed);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("retreat-images")
        .getPublicUrl(fileName);

      // Get max display order
      const { data: existing } = await supabase
        .from("retreat_gallery")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

      // Insert record
      const { error: insertError } = await supabase.from("retreat_gallery").insert({
        title: title || null,
        description: description || null,
        image_url: urlData.publicUrl,
        category,
        display_order: nextOrder,
        is_featured: isFeatured || false,
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retreat-gallery"] });
      toast({ title: "Image uploaded successfully" });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateImage = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<RetreatGalleryImage> & { id: string }) => {
      const { error } = await supabase
        .from("retreat_gallery")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retreat-gallery"] });
      toast({ title: "Image updated" });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      // Get the image URL first
      const { data: image } = await supabase
        .from("retreat_gallery")
        .select("image_url")
        .eq("id", id)
        .single();

      // Delete from storage
      if (image?.image_url) {
        const fileName = image.image_url.split("/").pop();
        if (fileName) {
          await supabase.storage.from("retreat-images").remove([fileName]);
        }
      }

      // Delete record
      const { error } = await supabase
        .from("retreat_gallery")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retreat-gallery"] });
      toast({ title: "Image deleted" });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    uploadImage,
    updateImage,
    deleteImage,
  };
}
