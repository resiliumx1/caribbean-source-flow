import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PAYPAL_CLIENT_ID } from "@/lib/paypal";
import { StoreProvider } from "@/lib/store-context";
import { ComparisonProvider } from "@/lib/comparison-context";
import { StoreHeader } from "@/components/store/StoreHeader";
import { initTracking } from "@/lib/tracking";
import { CompareBar } from "@/components/store/CompareBar";
import CookieConsent from "@/components/CookieConsent";
import ComingSoon from "@/components/ComingSoon";
import ConsultationOnlyGuard from "@/components/admin/ConsultationOnlyGuard";

// Lazy load non-critical global components
const ChatWidget = lazy(() => import("@/components/ChatWidget"));
const AdminChat = lazy(() => import("@/components/admin/AdminChat"));

// Eagerly loaded (homepage)
import TrinityHomepage from "./pages/TrinityHomepage";

// Lazy loaded pages
const Wholesale = lazy(() => import("./pages/Wholesale"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Retreats = lazy(() => import("./pages/Retreats"));
const RetreatBooking = lazy(() => import("./pages/RetreatBooking"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminRetreats = lazy(() => import("./pages/AdminRetreats"));
const AdminRetreatDates = lazy(() => import("./pages/AdminRetreatDates"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const AdminWebinars = lazy(() => import("./pages/AdminWebinars"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const TheAnswer = lazy(() => import("./pages/TheAnswer"));
const WebinarsPage = lazy(() => import("./pages/Webinars"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const HerbalPhysicianCourse = lazy(() => import("./pages/HerbalPhysicianCourse"));
const GateEntrancePage = lazy(() => import("./pages/GateEntrancePage"));
const GoddessCard = lazy(() => import("./pages/GoddessCard"));
const Learn = lazy(() => import("./pages/Learn"));
const LearnArticle = lazy(() => import("./pages/LearnArticle"));
const CustomerAccountPage = lazy(() => import("./pages/CustomerAccountPage"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const CustomerLogin = lazy(() => import("./pages/CustomerLogin"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const MyOrderDetail = lazy(() => import("./pages/MyOrderDetail"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PaymentPlanPay = lazy(() => import("./pages/PaymentPlanPay"));
const AdminPaymentPlans = lazy(() => import("./pages/AdminPaymentPlans"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminAbandonedCarts = lazy(() => import("./pages/AdminAbandonedCarts"));
const AdminWholesaleLeads = lazy(() => import("./pages/AdminWholesaleLeads"));
const AdminPaymentAlerts = lazy(() => import("./pages/AdminPaymentAlerts"));
const AdminWCE = lazy(() => import("./pages/AdminWCE"));
const AdminConsultations = lazy(() => import("./pages/AdminConsultations"));
const ConsultationAdminAccept = lazy(() => import("./pages/ConsultationAdminAccept"));
const Consultations = lazy(() => import("./pages/Consultations"));
const ConsultationManage = lazy(() => import("./pages/ConsultationManage"));
const WceAdminLogin = lazy(() => import("./pages/WceAdminLogin"));
const WceAdminAccept = lazy(() => import("./pages/WceAdminAccept"));
const WCE2026 = lazy(() => import("./pages/WCE2026"));
const WceLive = lazy(() => import("./pages/WceLive"));
const WceRetreatCheckout = lazy(() => import("./pages/WceRetreatCheckout"));

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
const pagesWithoutHeader = ["/admin", "/wce-admin"];

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
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/wce-admin");
  const isWceRoute = location.pathname.startsWith("/wce-2026");

  // Google Tag Manager / Meta Pixel container (IDs live in src/lib/tracking.ts)
  useEffect(() => { initTracking(); }, []);

  const RedirectProductToShop = () => {
    const { slug } = useParams();
    return <Navigate to={`/shop/${slug}`} replace />;
  };

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
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/retreats" element={<Retreats />} />
          <Route path="/retreats/book/:slug" element={<RetreatBooking />} />
          <Route path="/the-answer" element={<TheAnswer />} />
          <Route path="/webinars" element={<WebinarsPage />} />
          <Route path="/consultations" element={<Consultations />} />
          <Route path="/consultations/manage/:token" element={<ConsultationManage />} />
          <Route path="/school/herbal-physician" element={<HerbalPhysicianCourse />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:slug" element={<LearnArticle />} />
          <Route path="/gate" element={<GateEntrancePage />} />
          <Route path="/goddess" element={<GoddessCard />} />
          <Route path="/wce-2026" element={<WCE2026 />} />
          {/* Gated online symposium stream — entitlement checked server-side. */}
          <Route path="/wce-2026/live" element={<WceLive />} />
          {/* Private retreat payment link. No public entry point; noindex. */}
          <Route path="/wce-2026/retreat-checkout/:token" element={<WceRetreatCheckout />} />
          <Route path="/account" element={<CustomerAccountPage />} />
          <Route path="/account/orders" element={<MyOrders />} />
          <Route path="/account/orders/:orderNumber" element={<MyOrderDetail />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
          <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="/product" element={<Navigate to="/shop" replace />} />
          <Route path="/product/:slug" element={<RedirectProductToShop />} />
          <Route path="/pay/:planId" element={<PaymentPlanPay />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/wce-admin/login" element={<WceAdminLogin />} />
          <Route path="/wce-admin/accept" element={<WceAdminAccept />} />
          <Route path="/consultation-admin/accept" element={<ConsultationAdminAccept />} />
          <Route path="/admin" element={<AdminLayout />}>
            {/* Every child route except "consultations" is wrapped in
                ConsultationOnlyGuard so a consultation_editor who is not a
                full admin is redirected to /admin/consultations. This is a
                per-route wrap (not a single mount in AdminLayout) because
                AdminLayout.tsx is owned by another agent — see the comment
                at the top of ConsultationOnlyGuard.tsx for the one-line
                alternative if that ownership changes. */}
            <Route index element={<Navigate to="/admin/orders" replace />} />
            <Route path="products" element={<ConsultationOnlyGuard><AdminProducts /></ConsultationOnlyGuard>} />
            <Route path="retreats" element={<ConsultationOnlyGuard><AdminRetreats /></ConsultationOnlyGuard>} />
            <Route path="retreat-dates" element={<ConsultationOnlyGuard><AdminRetreatDates /></ConsultationOnlyGuard>} />
            <Route path="reviews" element={<ConsultationOnlyGuard><AdminReviews /></ConsultationOnlyGuard>} />
            <Route path="webinars" element={<ConsultationOnlyGuard><AdminWebinars /></ConsultationOnlyGuard>} />
            <Route path="analytics" element={<ConsultationOnlyGuard><AdminAnalytics /></ConsultationOnlyGuard>} />
            <Route path="orders" element={<ConsultationOnlyGuard><AdminOrders /></ConsultationOnlyGuard>} />
            <Route path="notifications" element={<ConsultationOnlyGuard><AdminNotifications /></ConsultationOnlyGuard>} />
            <Route path="payment-plans" element={<ConsultationOnlyGuard><AdminPaymentPlans /></ConsultationOnlyGuard>} />
            <Route path="wholesale-leads" element={<ConsultationOnlyGuard><AdminWholesaleLeads /></ConsultationOnlyGuard>} />
            <Route path="payment-alerts" element={<ConsultationOnlyGuard><AdminPaymentAlerts /></ConsultationOnlyGuard>} />
            <Route path="coupons" element={<ConsultationOnlyGuard><AdminCoupons /></ConsultationOnlyGuard>} />
            <Route path="abandoned-carts" element={<ConsultationOnlyGuard><AdminAbandonedCarts /></ConsultationOnlyGuard>} />
            <Route path="consultations" element={<AdminConsultations />} />
            <Route path="wce" element={<ConsultationOnlyGuard><AdminWCE /></ConsultationOnlyGuard>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CompareBar />
      {!isAdminRoute && !isWceRoute && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
      {isAdminRoute && (
        <Suspense fallback={null}>
          <AdminChat />
        </Suspense>
      )}
      <CookieConsent />
    </>
  );
}

const App = () => {
  if (COMING_SOON) {
    return <ComingSoon />;
  }

  const paypalOptions = {
    clientId: PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
    components: "buttons",
    enableFunding: "venmo,paylater,card",
    disableFunding: "",
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
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
    </PayPalScriptProvider>
  );
};

export default App;
