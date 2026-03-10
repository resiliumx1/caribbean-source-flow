import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { StoreProvider } from "@/lib/store-context";
import { ComparisonProvider } from "@/lib/comparison-context";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CompareBar } from "@/components/store/CompareBar";
import ChatWidget from "@/components/ChatWidget";
import ComingSoon from "@/components/ComingSoon";
import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";

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
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const TheAnswer = lazy(() => import("./pages/TheAnswer"));
const WebinarsPage = lazy(() => import("./pages/Webinars"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const HerbalPhysicianCourse = lazy(() => import("./pages/HerbalPhysicianCourse"));

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
      {showHeader && <StoreHeader />}
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />} key={location.pathname}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><TrinityHomepage /></PageTransition>} />
            <Route path="/wholesale" element={<PageTransition><Wholesale /></PageTransition>} />
            <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/shop/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
            <Route path="/compare" element={<PageTransition><ComparePage /></PageTransition>} />
            
            <Route path="/retreats" element={<PageTransition><Retreats /></PageTransition>} />
            <Route path="/the-answer" element={<PageTransition><TheAnswer /></PageTransition>} />
            <Route path="/webinars" element={<PageTransition><WebinarsPage /></PageTransition>} />
            <Route path="/school/herbal-physician" element={<PageTransition><HerbalPhysicianCourse /></PageTransition>} />
            <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="products" element={<AdminProducts />} />
              <Route path="retreats" element={<AdminRetreats />} />
              <Route path="retreat-dates" element={<AdminRetreatDates />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="webinars" element={<AdminWebinars />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <CompareBar />
      <ChatWidget />
    </>
  );
}

const App = () => {
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
