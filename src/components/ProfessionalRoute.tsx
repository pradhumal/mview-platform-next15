import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wraps routes that are only accessible to professionals.
 * Owners are silently redirected to the Intelligence home.
 */
export function ProfessionalRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();

  if (profile?.role !== "professional") {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
