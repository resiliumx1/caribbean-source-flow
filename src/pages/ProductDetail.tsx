import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Minus, Plus, Truck, Leaf, FlaskConical, AlertCircle, Tag, Sparkles, MessageCircle, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { StoreFooter } from "@/components/store/StoreFooter";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { ProductGallery } from "@/components/store/ProductGallery";
import { VariantSelector } from "@/components/store/VariantSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useBundleItems } from "@/hooks/use-products";
import { useProductVariants, type ProductVariant } from "@/hooks/use-product-variants";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: bundleItems } = useBundleItems(product?.product_type === "bundle" ? product.id : "");
  const { data: variants = [] } = useProductVariants(product?.id);
  const { addToCart, isAddingToCart } = useCart();
  const { formatPrice, formatPriceBoth, whatsappNumber, isLocalVisitor } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Set default variant when variants load
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      const defaultVariant = variants.find((v) => v.is_default) || variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [variants, selectedVariant]);

  // Check if product is a raw herb
  const isRawHerb = product?.product_type === "raw_herb";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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

  // Use variant price if selected, otherwise product price
  const currentPriceUsd = selectedVariant ? selectedVariant.price_usd : product.price_usd;
  const currentPriceXcd = selectedVariant ? selectedVariant.price_xcd : product.price_xcd;
  const originalPriceUsd = (product as any).original_price_usd;
  const originalPriceXcd = (product as any).original_price_xcd;
  const promotionText = (product as any).promotion_text;
  const promotionBadge = (product as any).promotion_badge;

  const prices = formatPriceBoth(currentPriceUsd * quantity, currentPriceXcd * quantity);
  const hasPromotion = promotionText || originalPriceUsd;

  const handleAddToCart = () => {
    addToCart({ 
      productId: product.id, 
      quantity,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        {/* Main grid - 60/40 split for larger images */}
        <div className="grid lg:grid-cols-[1fr_450px] gap-8 lg:gap-12">
          {/* Image Gallery - full width on left with proper fit */}
          <div className="relative">
            <div className="sticky top-24">
              <ProductGallery
                primaryImage={product.image_url}
                additionalImages={(product as any).additional_images ?? []}
                productType={product.product_type}
                productName={product.name}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                {/* Promotion badge */}
                {promotionBadge && (
                  <Badge className="bg-accent text-accent-foreground gap-1">
                    <Sparkles className="w-3 h-3" />
                    {promotionBadge === "savings" ? "Hot Deal" : 
                     promotionBadge === "popular" ? "Popular" : 
                     promotionBadge === "limited" ? "Limited" : promotionBadge}
                  </Badge>
                )}
                {product.badge && !promotionBadge && (
                  <Badge variant="default" className={product.badge === "best_seller" ? "bg-orange-500 text-white" : ""}>
                    {product.badge === "best_seller" ? "Best Seller" :
                     product.badge === "fermented" ? "Fermented" :
                     product.badge === "wildcrafted" ? "100% Natural" :
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
          </div>

          {/* Details - Right side */}
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

            {/* Name - BLACK, bold */}
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0B0B0B] mt-2 mb-4">
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
              <div className="inline-flex items-center gap-1 text-sm text-primary">
                <Leaf className="w-4 h-4" />
                100% Natural • Made in Saint Lucia • Non-GMO • Vegan
              </div>
              {isLocalVisitor && (
                <div className="inline-flex items-center gap-1 text-sm text-success">
                  <Truck className="w-4 h-4" />
                  Local Delivery Available
                </div>
              )}
            </div>

            {/* Promotion callout */}
            {hasPromotion && (
              <div className="p-4 bg-accent/10 rounded-xl border border-accent/20 mb-6">
                <div className="flex items-center gap-2 text-accent-foreground">
                  <Tag className="w-5 h-5" />
                  <span className="font-semibold">{promotionText || "Special Offer!"}</span>
                </div>
                {originalPriceUsd && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Save {formatPrice(originalPriceUsd - currentPriceUsd, (originalPriceXcd || 0) - currentPriceXcd)} on this item
                  </p>
                )}
              </div>
            )}

            {/* Price - BLACK, bold */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#0B0B0B]">
                  {prices.primary}
                </span>
                {originalPriceUsd && (
                  <span className="text-xl text-[#3A3A3A] line-through">
                    {formatPrice(originalPriceUsd * quantity, (originalPriceXcd || 0) * quantity)}
                  </span>
                )}
                <span className="text-lg text-[#3A3A3A]">
                  {prices.secondary}
                </span>
              </div>
              {product.size_info && (
                <p className="text-sm text-[#3A3A3A] mt-1">
                  {product.size_info}
                </p>
              )}
            </div>

            {/* ========== KEY BENEFITS (EXACT SPEC) ========== */}
            {product.traditional_use && (
              <div className="mb-0">
                {/* Heading: 18-20px, weight 600-700, color #0B0B0B */}
                <h3 className="text-[18px] font-semibold text-[#0B0B0B] mb-4">
                  Key Benefits
                </h3>
                {/* Vertical list with 12px gap */}
                <div className="flex flex-col gap-3">
                  {product.traditional_use.split(",").slice(0, 5).map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {/* Icon: 22px diameter circle, bg #1F3A2E */}
                      <div 
                        className="flex-shrink-0 flex items-center justify-center rounded-full"
                        style={{ width: '22px', height: '22px', backgroundColor: '#1F3A2E' }}
                      >
                        {/* White checkmark, 12-14px */}
                        <Check className="text-white" style={{ width: '13px', height: '13px' }} />
                      </div>
                      {/* Text: 15-16px, color #0B0B0B, weight 400-500 */}
                      <span 
                        className="font-normal"
                        style={{ fontSize: '15px', color: '#0B0B0B' }}
                      >
                        {benefit.trim()}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Divider: 1px, rgba(11,11,11,0.12), 24px spacing above/below */}
                <div 
                  className="my-6"
                  style={{ height: '1px', backgroundColor: 'rgba(11,11,11,0.12)' }}
                />
              </div>
            )}

            {/* ========== DOSAGE (EXACT SPEC) ========== */}
            {product.dosage_instructions && (
              <div className="mb-0">
                {/* Heading: same as Key Benefits */}
                <h3 className="text-[18px] font-semibold text-[#0B0B0B] mb-3">
                  Dosage
                </h3>
                {/* Text: 15-16px, line-height 1.6, color #0B0B0B */}
                <p 
                  className="whitespace-pre-line"
                  style={{ fontSize: '15px', lineHeight: '1.6', color: '#0B0B0B' }}
                >
                  {product.dosage_instructions}
                </p>
                {product.contraindications && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-[#0B0B0B] text-sm">Contraindications</p>
                        <p className="text-sm text-[#0B0B0B]">{product.contraindications}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Divider: 1px, rgba(11,11,11,0.12), 24px spacing above/below */}
                <div 
                  className="my-6"
                  style={{ height: '1px', backgroundColor: 'rgba(11,11,11,0.12)' }}
                />
              </div>
            )}

            {/* ========== PRODUCT DESCRIPTION (EXACT SPEC) ========== */}
            {product.description && (
              <div className="mb-6">
                {/* Heading: same typography */}
                <h3 className="text-[18px] font-semibold text-[#0B0B0B] mb-3">
                  About This Formulation
                </h3>
                {/* Body text: 15-16px, line-height 1.6, color #0B0B0B */}
                <p 
                  className="whitespace-pre-line"
                  style={{ fontSize: '15px', lineHeight: '1.6', color: '#0B0B0B' }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Variant selector for herbs */}
            {variants.length > 0 && (
              <div className="mb-6">
                <VariantSelector
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onSelect={setSelectedVariant}
                />
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-[#0B0B0B]">Quantity</span>
              <div className="flex items-center border border-[rgba(11,11,11,0.12)] rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium text-[#0B0B0B]">{quantity}</span>
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
            <div className="mb-8">
              <Button
                variant="hero"
                size="xl"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock_status === "out_of_stock"}
                className="w-full gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock_status === "out_of_stock" ? "Out of Stock" : "Add to Bag"}
              </Button>
            </div>

            {/* Bulk Order Notice for Raw Herbs */}
            {isRawHerb && (
              <div className="p-4 bg-[#1F3A2E]/5 rounded-xl border border-[#1F3A2E]/20 mb-6">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#1F3A2E] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#0B0B0B] text-sm">Bulk Orders Available</p>
                    <p className="text-sm text-[#3A3A3A] mt-1">
                      Each order is 1 lb. Contact us for discounted pricing on quantities of 4-10 lbs.
                    </p>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent(`Hi, I'd like to inquire about bulk pricing for ${product.name} (4-10 lbs).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#1F3A2E] hover:text-[#1F3A2E]/80 mt-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp for Bulk Pricing
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info Accordions */}
            <Accordion type="multiple" className="w-full" defaultValue={[]}>
              {product.pharmaceutical_info && (
                <AccordionItem value="science">
                  <AccordionTrigger className="font-serif text-[#0B0B0B]">
                    The Science
                  </AccordionTrigger>
                  <AccordionContent className="text-[#3A3A3A] whitespace-pre-line">
                    {product.pharmaceutical_info}
                  </AccordionContent>
                </AccordionItem>
              )}

              {product.ingredients && (
                <AccordionItem value="ingredients">
                  <AccordionTrigger className="font-serif text-[#0B0B0B]">
                    Ingredients
                  </AccordionTrigger>
                  <AccordionContent className="text-[#3A3A3A] whitespace-pre-line">
                    {product.ingredients}
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="sourcing">
                <AccordionTrigger className="font-serif text-[#0B0B0B]">
                  Sourcing & Integrity
                </AccordionTrigger>
                <AccordionContent className="text-[#3A3A3A]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#1F3A2E]" />
                      <span>100% Natural</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#1F3A2E]" />
                      <span>Vegan & Non-GMO</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#1F3A2E]" />
                      <span>Made in Saint Lucia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#1F3A2E]" />
                      <span>No synthetic fillers or artificial coloring</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="font-serif text-[#0B0B0B]">
                  Shipping & Delivery
                </AccordionTrigger>
                <AccordionContent className="text-[#3A3A3A]">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-[#0B0B0B]">St. Lucia (Local Delivery)</p>
                      <p>Same-day delivery available for orders placed before 2 PM (North region).</p>
                      <p>Delivery fees: EC$15-25 depending on zone.</p>
                    </div>
                    <div>
                      <p className="font-medium text-[#0B0B0B]">International Shipping</p>
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

          </div>
        </div>
      </main>

      <StoreFooter />
      <WhatsAppFloat />
    </div>
  );
}
