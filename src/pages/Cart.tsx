import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { ProductPlaceholder } from "@/components/store/ProductPlaceholder";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";

export default function Cart() {
  const { cartItems, cartCount, updateQuantity, removeFromCart, isLoading } = useCart();
  const { formatPrice, formatPriceBoth, whatsappNumber, isLocalVisitor, currency } = useStore();

  // Calculate totals
  const subtotalUsd = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.price_usd * item.quantity;
  }, 0);

  const subtotalXcd = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.price_xcd * item.quantity;
  }, 0);

  const prices = formatPriceBoth(subtotalUsd, subtotalXcd);

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm ready to checkout but have a question about my order.`
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-8">
            Shopping Bag
          </h1>
          <p className="text-muted-foreground">Loading your cart...</p>
        </main>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            Your Bag is Empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Explore our collection of natural St. Lucian botanicals.
          </p>
          <Button asChild size="lg">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-8">
          Shopping Bag ({cartCount} {cartCount === 1 ? "item" : "items"})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              if (!item.product) return null;

              const itemPrices = formatPriceBoth(
                item.product.price_usd * item.quantity,
                item.product.price_xcd * item.quantity
              );

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  {/* Image */}
                  <Link to={`/shop/${item.product.slug}`} className="shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <ProductPlaceholder
                        productType={item.product.product_type}
                        className="w-24 h-24 rounded-lg"
                      />
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/shop/${item.product.slug}`}
                      className="font-serif font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>

                    {item.product.size_info && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.product.size_info}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity({
                              productId: item.product_id,
                              quantity: item.quantity - 1,
                            })
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity({
                              productId: item.product_id,
                              quantity: item.quantity + 1,
                            })
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-foreground">
                      {itemPrices.primary}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {itemPrices.secondary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="font-serif font-semibold text-foreground text-lg mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{prices.primary}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">Calculated at checkout</span>
                </div>
                {isLocalVisitor && (
                  <div className="text-xs text-success">
                    Local delivery available from EC$15
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{prices.primary}</p>
                    <p className="text-sm text-muted-foreground">{prices.secondary}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  asChild
                >
                  <Link to="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  asChild
                >
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Order via WhatsApp
                  </a>
                </Button>

                <Link
                  to="/shop"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
      <WhatsAppFloat />
    </div>
  );
}
