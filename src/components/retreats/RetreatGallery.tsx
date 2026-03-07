import { useState } from "react";
import { useRetreatGallery, RETREAT_CATEGORIES } from "@/hooks/use-retreat-gallery";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";
import herbProcessing from "@/assets/herb-processing.jpg";
import seamossHarvest from "@/assets/seamoss-harvest.jpg";
import retreatHero from "@/assets/retreat-hero-yoga.webp";

const fallbackImages = [heroFarm, herbProcessing, seamossHarvest, retreatHero];

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
      <section className="py-24" style={{ background: '#0f0f0d' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Use DB images if available, otherwise show fallback gallery
  const hasDbImages = images.length > 0;

  if (!hasDbImages) {
    return (
      <section className="py-24" style={{ background: '#0f0f0d' }}>
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: '#f2ead8', marginBottom: '16px' }}>
              Experience the Journey
            </h2>
          </div>

          {/* 2x2 fallback gallery */}
          <div className="rounded-2xl p-1" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
            <div className="grid grid-cols-2 gap-3">
              {fallbackImages.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-2xl cursor-pointer" onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}>
                  <img
                    src={img}
                    alt="Retreat experience"
                    className="w-full aspect-[4/3] object-cover transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                    width={400}
                    height={300}
                  />
                </div>
              ))}
            </div>
          </div>
          <p className="text-center mt-6" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '14px', color: '#c9a84c' }}>
            Your healing environment awaits.
          </p>
        </div>
        <ImageLightbox
          images={fallbackImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt="Retreat gallery"
        />
      </section>
    );
  }

  return (
    <section className="py-24" style={{ background: '#0f0f0d' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: '#f2ead8', marginBottom: '16px' }}>
            Experience the Journey
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: '#8a8070', maxWidth: '600px', margin: '0 auto 32px' }}>
            Glimpses of transformation, healing, and connection with nature in the heart of St. Lucia.
          </p>

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

        <div className="rounded-2xl p-1" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
          <div className="grid grid-cols-2 gap-3">
            {images.slice(0, 4).map((image, index) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.image_url}
                  alt={image.title || "Retreat gallery image"}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  width={400}
                  height={300}
                />
              </div>
            ))}
          </div>
        </div>
        <p className="text-center mt-6" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '14px', color: '#c9a84c' }}>
          Your healing environment awaits.
        </p>
      </div>

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
