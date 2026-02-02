import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { StoreProvider } from "@/lib/store-context";
import { StoreHeader } from "@/components/store/StoreHeader";
import TrinityHomepage from "./pages/TrinityHomepage";
import Wholesale from "./pages/Wholesale";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Retreats from "./pages/Retreats";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminProducts from "./pages/AdminProducts";
import AdminRetreats from "./pages/AdminRetreats";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

// Pages that should NOT show the header (admin only)
const pagesWithoutHeader = ["/admin"];

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
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<AdminProducts />} />
          <Route path="retreats" element={<AdminRetreats />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StoreProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </StoreProvider>
  </QueryClientProvider>
);

export default App;
