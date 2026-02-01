import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "./ProductPlaceholder";

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
  const selectedImage = allImages[selectedIndex] ?? null;

  // If no images at all, show placeholder
  if (allImages.length === 0) {
    return (
      <div className="aspect-square rounded-xl overflow-hidden bg-muted">
        <ProductPlaceholder productType={productType} className="w-full h-full" />
      </div>
    );
  }

  // Single image - no thumbnails needed
  if (allImages.length === 1) {
    return (
      <div className="aspect-square rounded-xl overflow-hidden bg-muted">
        <img
          src={allImages[0]}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Multiple images - show gallery with thumbnails
  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="aspect-square rounded-xl overflow-hidden bg-muted relative">
        <img
          src={selectedImage!}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {selectedIndex + 1} / {allImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 justify-center">
        {allImages.map((url, index) => (
          <button
            key={url}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
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
    </div>
  );
}
