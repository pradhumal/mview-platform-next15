import { Suspense } from "react";
import OwnerIntelligencePage from "@/pages/OwnerIntelligencePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OwnerIntelligencePage />
    </Suspense>
  );
}
