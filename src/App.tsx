import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/lib/store-context";
import TrinityHomepage from "./pages/TrinityHomepage";
import Wholesale from "./pages/Wholesale";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Retreats from "./pages/Retreats";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminProducts from "./pages/AdminProducts";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StoreProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </StoreProvider>
  </QueryClientProvider>
);

export default App;
