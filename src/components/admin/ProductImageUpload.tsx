import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageUploadProps {
  productId: string;
  productName: string;
  currentImageUrl: string | null;
  additionalImages: string[];
  onUploadComplete: () => void;
}

interface ImageSlot {
  url: string | null;
  isPrimary: boolean;
  index: number;
}

export default function ProductImageUpload({
  productId,
  productName,
  currentImageUrl,
  additionalImages = [],
  onUploadComplete,
}: ProductImageUploadProps) {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Build the 4 slots: primary + up to 3 additional
  const slots: ImageSlot[] = [
    { url: currentImageUrl, isPrimary: true, index: 0 },
    { url: additionalImages[0] ?? null, isPrimary: false, index: 1 },
    { url: additionalImages[1] ?? null, isPrimary: false, index: 2 },
    { url: additionalImages[2] ?? null, isPrimary: false, index: 3 },
  ];

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image.",
      });
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File, slotIndex: number) => {
    if (!validateFile(file)) return;

    setUploadingSlot(slotIndex);
    setUploadProgress(0);

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}-${slotIndex}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update product record based on slot
      if (slotIndex === 0) {
        // Primary image
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: publicUrl })
          .eq("id", productId);

        if (updateError) throw updateError;
      } else {
        // Additional image - update the array
        const newAdditionalImages = [...additionalImages];
        newAdditionalImages[slotIndex - 1] = publicUrl;

        const { error: updateError } = await supabase
          .from("products")
          .update({ additional_images: newAdditionalImages })
          .eq("id", productId);

        if (updateError) throw updateError;
      }

      setUploadProgress(100);

      toast({
        title: "Image uploaded",
        description: `Image ${slotIndex + 1} for "${productName}" has been updated.`,
      });

      onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setUploadingSlot(null);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async (slotIndex: number) => {
    try {
      if (slotIndex === 0) {
        // Remove primary image
        const { error } = await supabase
          .from("products")
          .update({ image_url: null })
          .eq("id", productId);

        if (error) throw error;
      } else {
        // Remove from additional images array
        const newAdditionalImages = [...additionalImages];
        newAdditionalImages.splice(slotIndex - 1, 1);

        const { error } = await supabase
          .from("products")
          .update({ additional_images: newAdditionalImages })
          .eq("id", productId);

        if (error) throw error;
      }

      toast({
        title: "Image removed",
        description: `Image ${slotIndex + 1} for "${productName}" has been removed.`,
      });

      onUploadComplete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to remove image",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleSetAsPrimary = async (slotIndex: number) => {
    if (slotIndex === 0 || !slots[slotIndex].url) return;

    try {
      const newPrimaryUrl = slots[slotIndex].url;
      const oldPrimaryUrl = currentImageUrl;

      // Swap: new primary goes to image_url, old primary goes to additional_images
      const newAdditionalImages = [...additionalImages];
      newAdditionalImages[slotIndex - 1] = oldPrimaryUrl ?? "";

      // Filter out empty strings
      const cleanedAdditionalImages = newAdditionalImages.filter((url) => url);

      const { error } = await supabase
        .from("products")
        .update({
          image_url: newPrimaryUrl,
          additional_images: cleanedAdditionalImages,
        })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Primary image updated",
        description: `Image ${slotIndex + 1} is now the primary image.`,
      });

      onUploadComplete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update primary image",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, slotIndex);
    e.target.value = ""; // Reset input
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file, slotIndex);
    },
    [productId, additionalImages]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-3">
      {/* 2x2 Grid of Image Slots */}
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot, index) => (
          <ImageSlotComponent
            key={index}
            slot={slot}
            isUploading={uploadingSlot === index}
            uploadProgress={uploadProgress}
            onFileSelect={(e) => handleFileSelect(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
            onRemove={() => handleRemoveImage(index)}
            onSetAsPrimary={() => handleSetAsPrimary(index)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
        <span>Primary image (shown on product cards)</span>
      </div>
    </div>
  );
}

interface ImageSlotComponentProps {
  slot: ImageSlot;
  isUploading: boolean;
  uploadProgress: number;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemove: () => void;
  onSetAsPrimary: () => void;
}

function ImageSlotComponent({
  slot,
  isUploading,
  uploadProgress,
  onFileSelect,
  onDrop,
  onDragOver,
  onRemove,
  onSetAsPrimary,
}: ImageSlotComponentProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDropWrapper = (e: React.DragEvent) => {
    setIsDragging(false);
    onDrop(e);
  };

  if (isUploading) {
    return (
      <div className="aspect-square rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 flex flex-col items-center justify-center p-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
        <Progress value={uploadProgress} className="h-1.5 w-full" />
        <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
      </div>
    );
  }

  if (slot.url) {
    return (
      <div className="relative aspect-square group">
        <img
          src={slot.url}
          alt={`Product image ${slot.index + 1}`}
          className={cn(
            "w-full h-full object-cover rounded-lg border-2 transition-all",
            slot.isPrimary
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-border hover:border-primary/50"
          )}
        />

        {/* Primary Badge */}
        {slot.isPrimary && (
          <div className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 fill-current" />
            Primary
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
          {/* Set as Primary (only for non-primary slots) */}
          {!slot.isPrimary && (
            <button
              onClick={onSetAsPrimary}
              className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
              title="Set as primary image"
            >
              <Star className="h-4 w-4" />
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={onRemove}
            className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Upload replacement overlay */}
        <label className="absolute inset-0 cursor-pointer opacity-0">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onFileSelect}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  // Empty slot
  return (
    <label
      onDrop={handleDropWrapper}
      onDragOver={onDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={cn(
        "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        slot.isPrimary && "border-amber-500/50"
      )}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onFileSelect}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-1">
        {slot.isPrimary ? (
          <>
            <div className="flex items-center gap-1 text-amber-600">
              <Star className="h-4 w-4" />
              <ImageIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-amber-600 font-medium">Primary</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Add</span>
          </>
        )}
      </div>
    </label>
  );
}
