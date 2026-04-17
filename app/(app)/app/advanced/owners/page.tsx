import AdvancedOwnersPage from "@/views/advanced/AdvancedOwnersPage";
import { ProfessionalRoute } from "@/components/ProfessionalRoute";

export default function Page() {
  return (
    <ProfessionalRoute>
      <AdvancedOwnersPage />
    </ProfessionalRoute>
  );
}
