import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { StoreProvider } from "@/lib/store-context";
import { ComparisonProvider } from "@/lib/comparison-context";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CompareBar } from "@/components/store/CompareBar";
import ComingSoon from "@/components/ComingSoon";

// Lazy load non-critical global components
const ChatWidget = lazy(() => import("@/components/ChatWidget"));

// Eagerly loaded (homepage)
import TrinityHomepage from "./pages/TrinityHomepage";

// Lazy loaded pages
const Wholesale = lazy(() => import("./pages/Wholesale"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Retreats = lazy(() => import("./pages/Retreats"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminRetreats = lazy(() => import("./pages/AdminRetreats"));
const AdminRetreatDates = lazy(() => import("./pages/AdminRetreatDates"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const AdminWebinars = lazy(() => import("./pages/AdminWebinars"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const TheAnswer = lazy(() => import("./pages/TheAnswer"));
const WebinarsPage = lazy(() => import("./pages/Webinars"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const HerbalPhysicianCourse = lazy(() => import("./pages/HerbalPhysicianCourse"));
const GateEntrancePage = lazy(() => import("./pages/GateEntrancePage"));
const GoddessCard = lazy(() => import("./pages/GoddessCard"));
const CustomerAccountPage = lazy(() => import("./pages/CustomerAccountPage"));

const queryClient = new QueryClient();

// Prefetch products immediately on app load for instant shop navigation
queryClient.prefetchQuery({
  queryKey: ["products", undefined],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories!category_id(*)")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
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
const pagesWithoutHeader = ["/admin"];

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <img
        src="/favicon.ico"
        alt="Loading"
        width={48}
        height={48}
        style={{ opacity: 0.6, animation: 'pulse 2s ease-in-out infinite' }}
      />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const showHeader = !pagesWithoutHeader.some(
    (path) => location.pathname.startsWith(path)
  );

  return (
    <>
      <ScrollToTop />
      {showHeader && <StoreHeader />}
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          <Route path="/" element={<TrinityHomepage />} />
          <Route path="/wholesale" element={<Wholesale />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/retreats" element={<Retreats />} />
          <Route path="/the-answer" element={<TheAnswer />} />
          <Route path="/webinars" element={<WebinarsPage />} />
          <Route path="/school/herbal-physician" element={<HerbalPhysicianCourse />} />
          <Route path="/gate" element={<GateEntrancePage />} />
          <Route path="/goddess" element={<GoddessCard />} />
          <Route path="/account" element={<CustomerAccountPage />} />
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/products" replace />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="retreats" element={<AdminRetreats />} />
            <Route path="retreat-dates" element={<AdminRetreatDates />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="webinars" element={<AdminWebinars />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CompareBar />
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </>
  );
}

const App = () => {
  if (COMING_SOON) {
    return <ComingSoon />;
  }

  return (
    <HelmetProvider>
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
    </HelmetProvider>
  );
};

export default App;
