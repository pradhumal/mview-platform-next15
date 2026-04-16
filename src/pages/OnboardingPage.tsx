"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, User, Briefcase, ArrowRight } from "lucide-react";

type RoleChoice = "owner" | "professional";

export default function OnboardingPage() {
  const [role, setRole] = useState<RoleChoice | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const handleContinue = async () => {
    if (!role || !user) return;
    setLoading(true);

    // Update profile role and mark onboarding complete
    await supabase
      .from("profiles")
      .update({ role, onboarding_complete: true })
      .eq("user_id", user.id);

    await refreshProfile();
    setLoading(false);
    router.push("/app");
  };

  const roleOptions: { value: RoleChoice; icon: typeof User; title: string; desc: string }[] = [
    {
      value: "owner",
      icon: User,
      title: "Mineral Owner",
      desc: "Track your interests, understand activity, and get clarity on royalties.",
    },
    {
      value: "professional",
      icon: Briefcase,
      title: "Professional",
      desc: "Manage multiple owners, run bulk workflows, and access advanced tools.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-medium text-foreground mb-2">How will you use MineralView?</h1>
          <p className="text-sm text-muted-foreground">
            This shapes your experience. You can change this later in Settings.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRole(opt.value)}
              className={`w-full flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
                role === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-card hover:border-primary/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                role === opt.value ? "bg-primary/15" : "bg-secondary"
              }`}>
                <opt.icon className={`w-5 h-5 ${role === opt.value ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{opt.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!role || loading}
          className="w-full h-12 rounded-xl"
        >
          {loading ? "..." : "Continue"}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
