/**
 * Restricts consultation-only editors to the consultations area.
 *
 * NOTE for the AdminLayout owner: this is currently mounted per-route in
 * src/App.tsx (wrapping every /admin/* child route element except
 * "consultations"), because this codebase's ownership split forbids editing
 * AdminLayout.tsx directly. If you would prefer a single mount point, the
 * one-line change is to drop this wrapping in App.tsx and instead render
 * `<ConsultationOnlyGuard>{children/<Outlet/>}</ConsultationOnlyGuard>` once,
 * near the top of AdminLayout's render (inside the authenticated branch).
 */
import { Navigate, useLocation } from "react-router-dom";
import { useConsultationAccess } from "@/hooks/use-consultation-access";

export default function ConsultationOnlyGuard({ children }: { children: React.ReactNode }) {
  const { hasConsultationAccess, isFullAdmin, isLoading } = useConsultationAccess();
  const location = useLocation();

  if (isLoading) return <>{children}</>;

  const isConsultationOnly = hasConsultationAccess && !isFullAdmin;
  const onConsultations = location.pathname.startsWith("/admin/consultations");

  if (isConsultationOnly && !onConsultations) {
    return <Navigate to="/admin/consultations" replace />;
  }

  return <>{children}</>;
}
