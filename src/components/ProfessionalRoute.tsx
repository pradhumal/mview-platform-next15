"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wraps routes that are only accessible to professionals.
 * Owners are silently redirected to the Intelligence home.
 */
export function ProfessionalRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (profile && profile.role !== "professional") {
      router.replace("/app");
    }
  }, [profile, router]);

  if (profile?.role !== "professional") return null;

  return <>{children}</>;
}

