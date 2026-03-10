import { useState } from "react";
import { useRetreatGallery, RETREAT_CATEGORIES } from "@/hooks/use-retreat-gallery";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import heroFarm from "@/assets/hero-farm.jpg";
import herbProcessing from "@/assets/herb-processing.jpg";
import seamossHarvest from "@/assets/seamoss-harvest.jpg";
import retreatHero from "@/assets/retreat-hero-yoga.webp";

const fallbackImages = [heroFarm, herbProcessing, seamossHarvest, retreatHero];

const TAB_MAP: Record<string, string> = {
  space: "The Space",
  medicine: "The Medicine",
  food: "The Food",
  experience: "The Moments",
};

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
      <section className="py-24" style={{ background: 'var(--site-green-dark)' }}>
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const hasDbImages = images.length > 0;
  const displayImages = hasDbImages ? images.map((img) => img.image_url) : fallbackImages;

  return (
    <section className="py-24" style={{ background: 'var(--site-green-dark)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: '#F5F1E8', marginBottom: '16px' }}>
            Life at the Retreat
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'rgba(245,241,232,0.7)', maxWidth: '500px', margin: '0 auto 28px' }}>
            Glimpses of connection, healing, food, and nature in St. Lucia.
          </p>

          {hasDbImages && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={activeCategory === undefined ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(undefined)}
                className="rounded-full"
                style={activeCategory === undefined ? { background: 'var(--site-gold)', color: 'var(--site-green-dark)' } : { color: '#F5F1E8' }}
              >
                All
              </Button>
              {RETREAT_CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={activeCategory === cat.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.value)}
                  className="rounded-full"
                  style={activeCategory === cat.value ? { background: 'var(--site-gold)', color: 'var(--site-green-dark)' } : { color: '#F5F1E8' }}
                >
                  {TAB_MAP[cat.value] || cat.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayImages.slice(0, 8).map((src, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-xl cursor-pointer group ${i === 0 || i === 3 ? 'md:row-span-2' : ''}`}
              onClick={() => openLightbox(i)}
            >
              <img
                src={typeof src === 'string' ? src : src}
                alt="Retreat gallery"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                style={{ minHeight: '200px' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <ImageLightbox
        images={displayImages as string[]}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt="Retreat gallery"
      />
    </section>
  );
}
