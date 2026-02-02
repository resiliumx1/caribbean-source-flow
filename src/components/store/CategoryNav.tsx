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
          "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border-2",
          currentPath === "/shop"
            ? "bg-foreground text-background border-foreground"
            : "bg-background border-foreground/80 text-foreground hover:bg-muted"
        )}
      >
        All
      </Link>

      {categories?.map((category) => {
        const isActive = currentPath === `/shop/category/${category.slug}`;
        const isBundles = category.slug === "curated-bundles";

        // Skip bundles category
        if (isBundles) return null;

        return (
          <Link
            key={category.id}
            to={`/shop/category/${category.slug}`}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border-2",
              isActive
                ? "bg-foreground text-background border-foreground"
                : "bg-background border-foreground/80 text-foreground hover:bg-muted"
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
