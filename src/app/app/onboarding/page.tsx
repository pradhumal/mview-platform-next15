import OnboardingPage from "@/views/OnboardingPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <OnboardingPage />
    </ProtectedRoute>
  );
}
