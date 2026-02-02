import { useState } from "react";
import { useRetreatGallery, RETREAT_CATEGORIES } from "@/hooks/use-retreat-gallery";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera } from "lucide-react";

export function RetreatGallery() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const { data: images = [], isLoading } = useRetreatGallery(activeCategory);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4 text-center">
          <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Gallery Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're preparing beautiful images of our retreat experience. Check back soon to see
            our accommodations, ceremonies, and the natural beauty of St. Lucia.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-cream">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Experience the Journey
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Glimpses of transformation, healing, and connection with nature in the heart of St. Lucia.
          </p>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={activeCategory === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(undefined)}
              className="rounded-full"
            >
              All
            </Button>
            {RETREAT_CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className="rounded-full"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Masonry grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="break-inside-avoid group relative overflow-hidden rounded-xl cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.image_url}
                alt={image.title || "Retreat gallery image"}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Overlay with caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                {image.title && (
                  <h3 className="text-white font-serif font-semibold text-lg">
                    {image.title}
                  </h3>
                )}
                {image.description && (
                  <p className="text-white/80 text-sm line-clamp-2">
                    {image.description}
                  </p>
                )}
                <span className="text-white/60 text-xs mt-1 capitalize">
                  {image.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={images.map((img) => img.image_url)}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt="Retreat gallery"
      />
    </section>
  );
}
