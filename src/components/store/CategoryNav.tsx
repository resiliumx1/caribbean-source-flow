import { Link, useLocation } from "react-router-dom";
import { useCategories } from "@/hooks/use-products";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export function CategoryNav() {
  const { data: categories, isLoading } = useCategories();
  const location = useLocation();
  const currentPath = location.pathname;

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-11 w-32 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Link
        to="/shop"
        className={cn(
          "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
          currentPath === "/shop"
            ? "bg-forest text-cream shadow-soft"
            : "bg-cream border border-border text-foreground hover:bg-muted hover:border-forest/30"
        )}
      >
        All
      </Link>

      {categories?.map((category) => {
        const isActive = currentPath === `/shop/category/${category.slug}`;
        const isBundles = category.slug === "curated-bundles";

        if (isBundles) {
          return (
            <Link
              key={category.id}
              to={`/shop/category/${category.slug}`}
              className={cn(
                "bundles-highlight inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105",
                isActive && "ring-2 ring-offset-2 ring-gold"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {category.name}
            </Link>
          );
        }

        return (
          <Link
            key={category.id}
            to={`/shop/category/${category.slug}`}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-forest text-cream shadow-soft"
                : "bg-cream border border-border text-foreground hover:bg-muted hover:border-forest/30"
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
