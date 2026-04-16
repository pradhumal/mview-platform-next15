import { Suspense } from "react";
import OwnerIntelligencePage from "@/views/OwnerIntelligencePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OwnerIntelligencePage />
    </Suspense>
  );
}
