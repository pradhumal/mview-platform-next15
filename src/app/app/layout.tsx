"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MViewAppLayout } from "@/components/MViewAppLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MViewAppLayout>{children}</MViewAppLayout>
    </ProtectedRoute>
  );
}
