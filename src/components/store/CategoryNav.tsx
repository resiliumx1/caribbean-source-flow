import { Link, useLocation } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCategories } from "@/hooks/use-products";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Droplet, Pill, Coffee, Gift, Leaf } from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  "liquid-tinctures": Droplet,
  "capsules-powders": Pill,
  "traditional-teas": Coffee,
  "curated-bundles": Gift,
  "raw-herbs": Leaf,
};

export function CategoryNav() {
  const { data: categories, isLoading } = useCategories();
  const location = useLocation();
  const currentPath = location.pathname;

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Link
          to="/shop"
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            currentPath === "/shop"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground"
          )}
        >
          <Package className="w-4 h-4" />
          All Products
        </Link>

        {categories?.map((category) => {
          const Icon = categoryIcons[category.slug] || Package;
          const isActive = currentPath === `/shop/category/${category.slug}`;

          return (
            <Link
              key={category.id}
              to={`/shop/category/${category.slug}`}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </Link>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
