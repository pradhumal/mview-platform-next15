import { useState } from "react";
import { ChevronRight, Shield, Briefcase, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationPreferencesSection } from "@/components/settings/NotificationPreferencesSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  const isOwner = profile?.role === "owner";
  const targetRole = isOwner ? "professional" : "owner";

  const handleRoleSwitch = async () => {
    if (!profile) return;
    setRoleLoading(true);
    await supabase
      .from("profiles")
      .update({ role: targetRole })
      .eq("user_id", profile.user_id);
    await refreshProfile();
    setRoleLoading(false);
    setShowRoleConfirm(false);
  };

  return (
    <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your notifications and preferences
        </p>
      </header>

      {/* Notification Preferences (persisted) */}
      <NotificationPreferencesSection />

      {/* Legal & Trust */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Trust & Privacy
        </h2>
        
        <div className="calm-card divide-y divide-border/50">
          <Link
            to="/trust"
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group"
          >
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Data sources
              </p>
              <p className="text-xs text-muted-foreground">
                Where our information comes from
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          
          <Link
            to="/trust"
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group"
          >
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                What MineralView does NOT do
              </p>
              <p className="text-xs text-muted-foreground">
                Understanding our limitations
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          
          <Link
            to="/trust"
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group"
          >
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Privacy & ethics
              </p>
              <p className="text-xs text-muted-foreground">
                How we handle your data
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </section>

      {/* Your Role */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          {isOwner ? <User className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
          Your role
        </h2>

        <div className="calm-card">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-sm font-medium text-foreground">
                {isOwner ? "Mineral Owner" : "Professional"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isOwner
                  ? "A focused experience built for clarity."
                  : "Advanced tools for multi-owner management and analytics."}
              </p>
            </div>
          </div>
          <div className="border-t border-border/50 mt-4 pt-4">
            <button
              onClick={() => setShowRoleConfirm(true)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowRight className="w-4 h-4" />
              {isOwner ? "Switch to Professional mode" : "Switch to Owner mode"}
            </button>
            <p className="text-xs text-muted-foreground mt-1">
              {isOwner
                ? "Enables advanced tools like multi-owner views and bulk workflows."
                : "Simplifies your experience by hiding advanced tools."}
            </p>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-foreground mb-4">
          Subscription
        </h2>
        
        <div className="calm-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">MineralView Pro</p>
              <p className="text-xs text-muted-foreground">$15/month</p>
            </div>
            <span className="px-2 py-1 bg-success/15 text-success text-xs font-medium rounded-full">
              Active
            </span>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Manage subscription
          </Button>
        </div>
      </section>

      {/* App info */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">
          MineralView v1.0.0
        </p>
        <p className="text-xs text-muted-foreground/70">
          Informational only. Not legal, tax, or investment advice.
        </p>
      </div>

      {/* Role switch confirmation */}
      <AlertDialog open={showRoleConfirm} onOpenChange={setShowRoleConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Switch to {isOwner ? "Professional" : "Owner"} mode?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isOwner
                ? "This will add advanced tools to your navigation, including multi-owner management and bulk workflows. You can switch back anytime."
                : "This will simplify your navigation by removing advanced tools. Your data won't change — you can switch back anytime."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleSwitch} disabled={roleLoading}>
              {roleLoading ? "Switching…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
