import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Product } from "./use-products";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

interface LocalCartItem {
  productId: string;
  quantity: number;
}

export function useCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });

    // Load local cart
    const saved = localStorage.getItem("cart");
    if (saved) {
      setLocalCart(JSON.parse(saved));
    }

    return () => subscription.unsubscribe();
  }, []);

  // Fetch cart from database if logged in
  const { data: dbCart = [], isLoading } = useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(*, product_categories!category_id(*))")
        .eq("user_id", userId);

      if (error) throw error;
      return data.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.products as Product,
      })) as CartItem[];
    },
    enabled: !!userId,
  });

  // For logged out users, fetch products for local cart
  const { data: localProducts = [] } = useQuery({
    queryKey: ["cart-products", localCart.map((i) => i.productId)],
    queryFn: async () => {
      if (localCart.length === 0) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories!category_id(*)")
        .in("id", localCart.map((i) => i.productId));

      if (error) throw error;
      return data as Product[];
    },
    enabled: !userId && localCart.length > 0,
  });

  // Combine cart data
  const cartItems: CartItem[] = userId
    ? dbCart
    : localCart.map((item) => ({
        id: item.productId,
        product_id: item.productId,
        quantity: item.quantity,
        product: localProducts.find((p) => p.id === item.productId),
      }));

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.price_usd * item.quantity;
  }, 0);

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!userId) {
        // Local cart
        const existing = localCart.find((i) => i.productId === productId);
        let newCart: LocalCartItem[];
        
        if (existing) {
          newCart = localCart.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          newCart = [...localCart, { productId, quantity }];
        }
        
        setLocalCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
        return;
      }

      // Database cart
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({ user_id: userId, product_id: productId, quantity });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!userId) {
        if (quantity <= 0) {
          const newCart = localCart.filter((i) => i.productId !== productId);
          setLocalCart(newCart);
          localStorage.setItem("cart", JSON.stringify(newCart));
        } else {
          const newCart = localCart.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          );
          setLocalCart(newCart);
          localStorage.setItem("cart", JSON.stringify(newCart));
        }
        return;
      }

      if (quantity <= 0) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
      } else {
        await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("user_id", userId)
          .eq("product_id", productId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userId) {
        const newCart = localCart.filter((i) => i.productId !== productId);
        setLocalCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
        return;
      }

      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Removed from cart",
        description: "Product has been removed from your cart.",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        setLocalCart([]);
        localStorage.removeItem("cart");
        return;
      }

      await supabase.from("cart_items").delete().eq("user_id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
  };
}
