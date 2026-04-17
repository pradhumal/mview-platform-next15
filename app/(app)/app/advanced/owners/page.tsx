import { ProfessionalRoute } from "@/components/ProfessionalRoute";
import AdvancedOwnersPage from "@/views/advanced/AdvancedOwnersPage";

export default function Page() {
  return (
    <ProfessionalRoute>
      <AdvancedOwnersPage />
    </ProfessionalRoute>
  );
}
