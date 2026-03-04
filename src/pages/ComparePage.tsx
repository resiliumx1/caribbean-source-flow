import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useComparison } from "@/lib/comparison-context";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Scale, ShoppingBag } from "lucide-react";
import { ProductPlaceholder } from "@/components/store/ProductPlaceholder";
import { StoreFooter } from "@/components/store/StoreFooter";
import type { Product } from "@/hooks/use-products";

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const { items, removeFromCompare, clearAll, addToCompare } = useComparison();
  const { formatPriceBoth } = useStore();

  // Deep link support
  useEffect(() => {
    const compareParam = searchParams.get("compare");
    if (compareParam) {
      const ids = compareParam.split(",").filter(Boolean);
      clearAll();
      ids.slice(0, 3).forEach((id) => addToCompare(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["compare-full", items],
    queryFn: async () => {
      if (items.length === 0) return [];
      const { data } = await supabase
        .from("products")
        .select("*, product_categories!category_id(*)")
        .in("id", items);
      return (data ?? []) as Product[];
    },
    enabled: items.length > 0,
  });

  // Order products to match items order
  const ordered = items.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];

  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (p) => {
        const prices = formatPriceBoth(p.price_usd, p.price_xcd);
        return (
          <div>
            <div className="font-bold">{prices.primary}</div>
            <div className="text-xs text-muted-foreground">{prices.secondary}</div>
          </div>
        );
      },
    },
    {
      label: "Category",
      render: (p) => p.product_categories?.name || "—",
    },
    {
      label: "Type",
      render: (p) => p.product_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    },
    {
      label: "Size",
      render: (p) => p.size_info || "—",
    },
    {
      label: "Key Benefits",
      render: (p) =>
        p.traditional_use
          ? p.traditional_use.split(",").slice(0, 3).map((b, i) => (
              <div key={i} className="text-sm">{b.trim()}</div>
            ))
          : "—",
    },
    {
      label: "Stock",
      render: (p) => (
        <Badge
          variant={p.stock_status === "in_stock" ? "default" : "destructive"}
          className="text-xs"
        >
          {p.stock_status === "in_stock"
            ? "In Stock"
            : p.stock_status === "low_stock"
            ? "Low Stock"
            : "Out of Stock"}
        </Badge>
      ),
    },
  ];

  if (items.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16 text-center">
          <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">No Products to Compare</h1>
          <p className="text-muted-foreground mb-6">Select up to 3 products from the shop to compare side by side.</p>
          <Button asChild>
            <Link to="/shop">Browse Products</Link>
          </Button>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold text-foreground">Product Comparison</h1>
          <div className="flex gap-2 print:hidden">
            <Button variant="ghost" size="sm" onClick={clearAll}>Clear All</Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            {/* Header - product images & names */}
            <thead>
              <tr>
                <th className="sticky left-0 bg-background z-10 p-3 text-left text-sm font-medium text-muted-foreground w-32">
                  Product
                </th>
                {ordered.map((p) => (
                  <th key={p.id} className="p-3 text-center min-w-[200px]">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 mx-auto mb-3 rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <ProductPlaceholder productType={p.product_type} className="w-16 h-20" />
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center print:hidden"
                        aria-label={`Remove ${p.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Link
                      to={`/shop/${p.slug}`}
                      className="font-serif font-semibold text-foreground hover:text-primary transition-colors text-sm"
                    >
                      {p.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                  <td className="sticky left-0 bg-inherit p-3 text-sm font-medium text-muted-foreground">
                    {row.label}
                  </td>
                  {ordered.map((p) => (
                    <td key={p.id} className="p-3 text-center text-sm text-foreground">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Action row */}
              <tr className="print:hidden">
                <td className="sticky left-0 bg-background p-3" />
                {ordered.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    <Button asChild size="sm" className="gap-1.5">
                      <Link to={`/shop/${p.slug}`}>
                        <ShoppingBag className="w-4 h-4" />
                        View Product
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
