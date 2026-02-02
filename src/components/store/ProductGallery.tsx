import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  primaryImage: string | null;
  productType?: string;
  additionalImages: string[];
  productName: string;
}

export function ProductGallery({
  primaryImage,
  additionalImages = [],
  productType = "default",
  productName,
}: ProductGalleryProps) {
  // Combine primary + additional images into a single array
  const allImages = [primaryImage, ...additionalImages].filter(
    (url): url is string => !!url
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedImage = allImages[selectedIndex] ?? null;

  const handleImageClick = () => {
    if (allImages.length > 0) {
      setLightboxOpen(true);
    }
  };

  // If no images at all, show placeholder
  if (allImages.length === 0) {
    return (
      <div className="sticky top-24">
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          <ProductPlaceholder productType={productType} className="w-full h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24 space-y-4">
      {/* Main Image - clickable for zoom */}
      <div
        className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 relative cursor-zoom-in group"
        onClick={handleImageClick}
      >
        <img
          src={selectedImage!}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
        />

        {/* Zoom indicator overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <ZoomIn className="w-6 h-6 text-foreground" />
          </div>
        </div>

        {/* Image counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.map((url, index) => (
            <button
              key={url}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                index === selectedIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border opacity-70 hover:opacity-100 hover:border-primary/50"
              )}
            >
              <img
                src={url}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox for zoom */}
      <ImageLightbox
        images={allImages}
        initialIndex={selectedIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={productName}
      />
    </div>
  );
}
