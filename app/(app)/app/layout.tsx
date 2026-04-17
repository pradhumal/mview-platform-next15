"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MViewAppLayout } from "@/components/MViewAppLayout";
import { SessionBootstrap } from "@/components/SessionBootstrap";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MViewAppLayout>
        <SessionBootstrap />
        {children}
      </MViewAppLayout>
    </ProtectedRoute>
  );
}
