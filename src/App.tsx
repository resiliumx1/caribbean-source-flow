import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { StoreProvider } from "@/lib/store-context";
import { StoreHeader } from "@/components/store/StoreHeader";
import ComingSoon from "@/components/ComingSoon";
import TrinityHomepage from "./pages/TrinityHomepage";
import Wholesale from "./pages/Wholesale";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Retreats from "./pages/Retreats";
import School from "./pages/School";
import HerbalPhysicianCourse from "./pages/HerbalPhysicianCourse";
import NotFound from "./pages/NotFound";
import GoddessCard from "./pages/GoddessCard";
import AdminLogin from "./pages/AdminLogin";
import AdminProducts from "./pages/AdminProducts";
import AdminRetreats from "./pages/AdminRetreats";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

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
        <Route path="/retreats" element={<Retreats />} />
        <Route path="/school" element={<School />} />
        <Route path="/school/herbal-physician-course" element={<HerbalPhysicianCourse />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<AdminProducts />} />
          <Route path="retreats" element={<AdminRetreats />} />
        </Route>
        {/* Hidden direct-link-only pages */}
        <Route path="/goddess" element={<GoddessCard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </StoreProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
