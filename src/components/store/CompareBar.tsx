import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/lib/comparison-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function CompareBar() {
  const { items, removeFromCompare, clearAll, isDismissed, dismiss } = useComparison();

  const { data: products = [] } = useQuery({
    queryKey: ["compare-products", items],
    queryFn: async () => {
      if (items.length === 0) return [];
      const { data } = await supabase
        .from("products")
        .select("id, name, image_url")
        .in("id", items);
      return data ?? [];
    },
    enabled: items.length > 0,
  });

  if (items.length === 0 || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-elevated p-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          {products.map((p) => (
            <div key={p.id} className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-muted">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>
              <button
                onClick={() => removeFromCompare(p.id)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                aria-label={`Remove ${p.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <span className="text-sm text-muted-foreground whitespace-nowrap">{items.length}/3 selected</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button asChild size="sm">
            <Link to="/compare">Compare Now</Link>
          </Button>
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground ml-1"
            aria-label="Dismiss compare bar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
