import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        className="product-image-container relative cursor-zoom-in group rounded-2xl"
        onClick={handleImageClick}
      >
        <img
          src={selectedImage!}
          alt={`${productName} | Mount Kailash Rejuvenation Centre`}
          className="transition-transform duration-300 group-hover:scale-105"
          decoding="async"
        />

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i - 1 + allImages.length) % allImages.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i + 1) % allImages.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}

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
                alt={`${productName} - view ${index + 1} | Mount Kailash Rejuvenation Centre`}
                className="w-full h-full object-contain"
                style={{ padding: '6%', backgroundColor: 'hsl(var(--site-green-dark, 152 33% 12%))' }}
                loading="lazy"
                decoding="async"
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
