import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/hooks/use-product-variants";
import { useStore } from "@/lib/store-context";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
}: VariantSelectorProps) {
  const { formatPrice } = useStore();

  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Select Size</label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock_status === "out_of_stock";

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-w-[90px]",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 bg-background",
                isOutOfStock && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Discount badge */}
              {variant.discount_percent > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 text-xs bg-accent text-accent-foreground"
                >
                  -{variant.discount_percent}%
                </Badge>
              )}

              {/* Size label */}
              <span className="font-semibold text-foreground">
                {variant.size_label}
              </span>

              {/* Price */}
              <span className="text-sm text-muted-foreground mt-1">
                {formatPrice(variant.price_usd, variant.price_xcd)}
              </span>

              {/* Out of stock */}
              {isOutOfStock && (
                <span className="text-xs text-destructive mt-1">Out of Stock</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Savings message */}
      {selectedVariant && selectedVariant.discount_percent > 0 && (
        <p className="text-sm text-success font-medium">
          You save {selectedVariant.discount_percent}% with this size!
        </p>
      )}
    </div>
  );
}
