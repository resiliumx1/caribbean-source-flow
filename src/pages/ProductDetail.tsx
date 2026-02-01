import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, MessageCircle, Minus, Plus, Truck, Leaf, FlaskConical, AlertCircle } from "lucide-react";
import { useState } from "react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { ProductGallery } from "@/components/store/ProductGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useBundleItems } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: bundleItems } = useBundleItems(product?.product_type === "bundle" ? product.id : "");
  const { addToCart, isAddingToCart } = useCart();
  const { formatPrice, formatPriceBoth, whatsappNumber, isLocalVisitor } = useStore();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </main>
      </div>
    );
  }

  const prices = formatPriceBoth(product.price_usd * quantity, product.price_xcd * quantity);

  const whatsappMessage = encodeURIComponent(
    `Hi, I have questions about ${product.name} before ordering.`
  );

  const handleAddToCart = () => {
    addToCart({ productId: product.id, quantity });
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="relative">
            <ProductGallery
              primaryImage={product.image_url}
              additionalImages={(product as any).additional_images ?? []}
              productType={product.product_type}
              productName={product.name}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              {product.badge && (
                <Badge variant="default">
                  {product.badge === "best_seller" ? "Best Seller" :
                   product.badge === "fermented" ? "Fermented" :
                   product.badge === "wildcrafted" ? "Wildcrafted" :
                   product.badge === "new" ? "New" : product.badge}
                </Badge>
              )}
              {product.stock_status !== "in_stock" && (
                <Badge variant="destructive">
                  {product.stock_status === "out_of_stock" ? "Out of Stock" :
                   product.stock_status === "low_stock" ? "Low Stock" : "Pre-order"}
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            {/* Category */}
            {product.product_categories && (
              <Link
                to={`/shop/category/${product.product_categories.slug}`}
                className="text-sm text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors"
              >
                {product.product_categories.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2 mb-4">
              {product.name}
            </h1>

            {/* Short description */}
            {product.short_description && (
              <p className="text-lg text-muted-foreground mb-6">
                {product.short_description}
              </p>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              {product.badge === "fermented" && (
                <div className="inline-flex items-center gap-1 text-sm text-primary">
                  <FlaskConical className="w-4 h-4" />
                  Fermented Formulation
                </div>
              )}
              {product.badge === "wildcrafted" && (
                <div className="inline-flex items-center gap-1 text-sm text-primary">
                  <Leaf className="w-4 h-4" />
                  Wildcrafted
                </div>
              )}
              {isLocalVisitor && (
                <div className="inline-flex items-center gap-1 text-sm text-success">
                  <Truck className="w-4 h-4" />
                  Local Delivery Available
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {prices.primary}
                </span>
                <span className="text-lg text-muted-foreground">
                  {prices.secondary}
                </span>
              </div>
              {product.size_info && (
                <p className="text-sm text-muted-foreground mt-1">
                  {product.size_info}
                </p>
              )}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-foreground">Quantity</span>
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                variant="hero"
                size="xl"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock_status === "out_of_stock"}
                className="flex-1 gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock_status === "out_of_stock" ? "Out of Stock" : "Add to Bag"}
              </Button>
              <Button variant="outline" size="xl" asChild>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Request Dosing Guidance
                </a>
              </Button>
            </div>

            {/* Educational Accordions */}
            <Accordion type="multiple" className="w-full">
              {product.traditional_use && (
                <AccordionItem value="traditional-use">
                  <AccordionTrigger className="font-serif">
                    Traditional Use
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {product.traditional_use}
                  </AccordionContent>
                </AccordionItem>
              )}

              {product.pharmaceutical_info && (
                <AccordionItem value="science">
                  <AccordionTrigger className="font-serif">
                    The Science
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {product.pharmaceutical_info}
                  </AccordionContent>
                </AccordionItem>
              )}

              {product.dosage_instructions && (
                <AccordionItem value="how-to-use">
                  <AccordionTrigger className="font-serif">
                    How to Use
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {product.dosage_instructions}
                    {product.contraindications && (
                      <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                          <div>
                            <p className="font-medium text-warning-foreground text-sm">Contraindications</p>
                            <p className="text-sm">{product.contraindications}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}

              {product.ingredients && (
                <AccordionItem value="ingredients">
                  <AccordionTrigger className="font-serif">
                    Ingredients
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {product.ingredients}
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="shipping">
                <AccordionTrigger className="font-serif">
                  Shipping & Delivery
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-foreground">St. Lucia (Local Delivery)</p>
                      <p>Same-day delivery available for orders placed before 2 PM (North region).</p>
                      <p>Delivery fees: EC$15-25 depending on zone.</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">International Shipping</p>
                      <p>Ships worldwide from St. Lucia within 3-5 business days via courier.</p>
                      <p>Tracking provided for all orders.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Bundle items */}
            {product.product_type === "bundle" && bundleItems && bundleItems.length > 0 && (
              <div className="mt-8 p-6 bg-muted/50 rounded-xl">
                <h3 className="font-serif font-semibold text-foreground mb-4">
                  What's Inside This Bundle
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {bundleItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                        {item.quantity}
                      </span>
                      <span className="text-foreground">{(item.products as any)?.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FDA Disclaimer */}
            <div className="mt-8 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
              <p>
                These statements have not been evaluated by the FDA. This product is not 
                intended to diagnose, treat, cure, or prevent any disease. Traditional use 
                based on St. Lucian bush medicine practices under the guidance of Right 
                Honourable Priest Kailash Kay Leonce.
              </p>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
      <WhatsAppFloat />
    </div>
  );
}
