import { useEffect } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { Loader2, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { user, isAdmin, isLoading, signOut } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/admin/login", { replace: true });
      } else if (!isAdmin) {
        navigate("/", { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Admin Dashboard</span>
            <nav className="flex items-center gap-4 ml-8">
              <a href="/admin/products" className="text-sm hover:text-primary transition-colors">Products</a>
              <a href="/admin/retreats" className="text-sm hover:text-primary transition-colors">Retreats</a>
              <a href="/admin/reviews" className="text-sm hover:text-primary transition-colors">Reviews</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Site</span>
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-destructive hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
