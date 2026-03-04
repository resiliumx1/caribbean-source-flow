import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { StoreProvider } from "@/lib/store-context";
import { ComparisonProvider } from "@/lib/comparison-context";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CompareBar } from "@/components/store/CompareBar";
import ComingSoon from "@/components/ComingSoon";
import TrinityHomepage from "./pages/TrinityHomepage";
import Wholesale from "./pages/Wholesale";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Retreats from "./pages/Retreats";
import School from "./pages/School";
import HerbalPhysicianCourse from "./pages/HerbalPhysicianCourse";
import NotFound from "./pages/NotFound";
import GoddessCard from "./pages/GoddessCard";
import AdminLogin from "./pages/AdminLogin";
import AdminProducts from "./pages/AdminProducts";
import AdminRetreats from "./pages/AdminRetreats";
import AdminRetreatDates from "./pages/AdminRetreatDates";
import AdminReviews from "./pages/AdminReviews";
import AdminWebinars from "./pages/AdminWebinars";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminLayout from "./components/admin/AdminLayout";
import TheAnswer from "./pages/TheAnswer";
import WebinarsPage from "./pages/Webinars";
import ComparePage from "./pages/ComparePage";

const queryClient = new QueryClient();

// Prefetch products immediately on app load for instant shop navigation
queryClient.prefetchQuery({
  queryKey: ["products", undefined],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories!category_id(*)")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("image_url", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return data;
  },
  staleTime: 1000 * 60 * 5,
});

queryClient.prefetchQuery({
  queryKey: ["product_categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data;
  },
  staleTime: 1000 * 60 * 10,
});

// Toggle this to false when ready to launch
const COMING_SOON = false;

// Pages that should NOT show the header
const pagesWithoutHeader = ["/admin", "/goddess"];

function AppContent() {
  const location = useLocation();
  const showHeader = !pagesWithoutHeader.some(
    (path) => location.pathname.startsWith(path)
  );

  return (
    <>
      {showHeader && <StoreHeader />}
      <Routes>
        <Route path="/" element={<TrinityHomepage />} />
        <Route path="/wholesale" element={<Wholesale />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/category/:categorySlug" element={<Shop />} />
        <Route path="/shop/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/retreats" element={<Retreats />} />
        <Route path="/school" element={<School />} />
        <Route path="/school/herbal-physician-course" element={<HerbalPhysicianCourse />} />
        {/* MKRC Marketing Pages */}
        <Route path="/the-answer" element={<TheAnswer />} />
        <Route path="/webinars" element={<WebinarsPage />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<AdminProducts />} />
          <Route path="retreats" element={<AdminRetreats />} />
          <Route path="retreat-dates" element={<AdminRetreatDates />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="webinars" element={<AdminWebinars />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
        {/* Hidden direct-link-only pages */}
        <Route path="/goddess" element={<GoddessCard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CompareBar />
    </>
  );
}

const App = () => {
  // Show Coming Soon page when enabled
  if (COMING_SOON) {
    return <ComingSoon />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="theme"
        disableTransitionOnChange
      >
        <StoreProvider>
          <ComparisonProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </ComparisonProvider>
        </StoreProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
