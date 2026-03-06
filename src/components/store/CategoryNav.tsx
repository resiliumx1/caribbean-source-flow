import { Link, useLocation } from "react-router-dom";
import { useCategories } from "@/hooks/use-products";
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

  const tabBase: React.CSSProperties = {
    fontFamily: "'Jost', sans-serif",
    fontSize: "14px",
    transition: "all 200ms ease",
  };

  const activeStyle: React.CSSProperties = {
    ...tabBase,
    background: "#c9a84c",
    color: "#090909",
    fontWeight: 500,
    border: "1px solid #c9a84c",
  };

  const inactiveStyle: React.CSSProperties = {
    ...tabBase,
    background: "var(--site-bg-card)",
    color: "var(--site-text-primary)",
    fontWeight: 400,
    border: "1px solid var(--site-border)",
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 overflow-x-auto pb-1">
      <Link
        to="/shop"
        className="px-6 py-2.5 rounded-full whitespace-nowrap hover:brightness-110 transition-all"
        style={currentPath === "/shop" ? activeStyle : inactiveStyle}
      >
        All
      </Link>

      {categories?.map((category) => {
        const isActive = currentPath === `/shop/category/${category.slug}`;
        return (
          <Link
            key={category.id}
            to={`/shop/category/${category.slug}`}
            className="px-6 py-2.5 rounded-full whitespace-nowrap hover:brightness-110 transition-all"
            style={isActive ? activeStyle : inactiveStyle}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
