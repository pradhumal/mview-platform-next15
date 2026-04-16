"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/app/auth");
      return;
    }
    if (profile && !profile.onboarding_complete && pathname !== "/app/onboarding") {
      router.replace("/app/onboarding");
    }
  }, [loading, user, profile, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (profile && !profile.onboarding_complete && pathname !== "/app/onboarding") {
    return null;
  }

  return <>{children}</>;
}

