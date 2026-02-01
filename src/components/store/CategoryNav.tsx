import { Link, useLocation } from "react-router-dom";
import { useCategories } from "@/hooks/use-products";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
