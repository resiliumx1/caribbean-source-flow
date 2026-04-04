import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2, MessageCircle, Leaf, Lock } from "lucide-react";
import { StoreFooter } from "@/components/store/StoreFooter";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { ProductPlaceholder } from "@/components/store/ProductPlaceholder";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/lib/store-context";

export default function Cart() {
  const { cartItems, cartCount, updateQuantity, removeFromCart, isLoading } = useCart();
  const { formatPrice, formatPriceBoth, whatsappNumber, isLocalVisitor, currency } = useStore();

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
      <div className="min-h-screen bg-background flex flex-col">
        <main className="container mx-auto px-4 py-8 pt-24 flex-1">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Shopping Bag</h1>
          <p className="text-muted-foreground">Loading your cart...</p>
        </main>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="container mx-auto px-4 pt-24 pb-16 text-center flex-1">
          <Leaf className="w-20 h-20 text-muted-foreground mx-auto mb-4" style={{ color: "#c5c0b8" }} />
          <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Your Bag is Empty
          </h1>
          <p className="text-muted-foreground mb-8">Your healing journey starts here</p>
          <Button asChild size="lg" style={{ height: 48, background: "#1b4332", color: "#fff" }}>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 pt-24 pb-8 flex-1">
        {/* Back to Shop */}
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm mb-2 transition-colors hover:opacity-80" style={{ color: "#1b4332", fontWeight: 500 }}>
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        {/* Breadcrumb */}
        <nav className="mb-6" style={{ fontSize: 13, color: "#999" }}>
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1.5">/</span>
          <Link to="/shop" className="hover:underline">Shop</Link>
          <span className="mx-1.5">/</span>
          <span style={{ color: "#555" }}>Your Bag</span>
        </nav>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-8">
          Shopping Bag ({cartCount} {cartCount === 1 ? "item" : "items"})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            {cartItems.map((item, idx) => {
              if (!item.product) return null;

              const itemPrices = formatPriceBoth(
                item.product.price_usd * item.quantity,
                item.product.price_xcd * item.quantity
              );

              const unitPrice = formatPriceBoth(item.product.price_usd, item.product.price_xcd);

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4"
                  style={{
                    borderBottom: idx < cartItems.length - 1 ? "1px solid #f0ede8" : "none",
                  }}
                >
                  {/* Image */}
                  <Link to={`/shop/${item.product.slug}`} className="shrink-0 w-24 h-24 rounded-xl overflow-hidden" style={{ aspectRatio: '1/1', background: '#fafafa' }}>
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={`${item.product.name} | Mount Kailash Rejuvenation Centre`}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <ProductPlaceholder
                        productType={item.product.product_type}
                        className="w-full h-full"
                      />
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/shop/${item.product.slug}`}
                      className="hover:text-primary transition-colors line-clamp-2"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 16, color: "var(--foreground)" }}
                    >
                      {item.product.name}
                    </Link>

                    {/* Unit price */}
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: 13 }}>
                      {unitPrice.primary} each
                    </p>

                    {item.product.size_info && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.product.size_info}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
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
                          className="h-9 w-9"
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

                    {/* Mobile price - shown below on small screens */}
                    <div className="sm:hidden mt-3">
                      <p className="font-semibold text-foreground">{itemPrices.primary}</p>
                      <p className="text-sm text-muted-foreground">{itemPrices.secondary}</p>
                    </div>
                  </div>

                  {/* Price - desktop */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="font-semibold text-foreground">{itemPrices.primary}</p>
                    <p className="text-sm text-muted-foreground">{itemPrices.secondary}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border p-6 lg:sticky lg:top-24" style={{ background: "#fafaf8" }}>
              <h2 className="font-serif font-semibold text-foreground text-lg mb-2">
                Order Summary
              </h2>
              <div className="h-px mb-4" style={{ background: "#f0ede8" }} />

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
                  size="lg"
                  className="w-full gap-2"
                  style={{ height: 52, background: "#1b4332", color: "#fff" }}
                  asChild
                >
                  <Link to="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                {/* Secure checkout note */}
                <div className="flex items-center justify-center gap-1.5" style={{ fontSize: 11, color: "#888" }}>
                  <Lock className="w-3 h-3" /> Secure Checkout
                </div>

                <Button
                  size="lg"
                  className="w-full gap-2"
                  style={{ height: 52, background: "#25D366", color: "#fff", border: "none" }}
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

                {/* Trust signals */}
                <p className="text-center text-muted-foreground" style={{ fontSize: 12 }}>
                  🌿 100% Natural · 🇱🇨 Made in St. Lucia
                </p>

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
