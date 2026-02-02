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
          "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border-[3px]",
          currentPath === "/shop"
            ? "bg-[#1F3A2E] text-white border-[#1F3A2E]"
            : "bg-background border-[#0B0B0B] text-[#0B0B0B] hover:bg-muted"
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
              "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border-[3px]",
              isActive
                ? "bg-[#1F3A2E] text-white border-[#1F3A2E]"
                : "bg-background border-[#0B0B0B] text-[#0B0B0B] hover:bg-muted"
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
