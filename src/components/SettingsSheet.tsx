import { useState } from "react";
import { User, ArrowRight, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotificationPreferencesSection } from "@/components/settings/NotificationPreferencesSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

export function SettingsSheet() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [depthPref, setDepthPref] = useState<string>("balanced");

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
    <>
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="Open settings"
          >
            <User className="w-4 h-4 text-muted-foreground" />
          </button>
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>

          {/* Role display */}
          <section className="mb-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Your Role</h3>
            <div className="calm-card !p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isOwner ? "Mineral Owner" : "Professional"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isOwner
                      ? "A focused experience built for clarity."
                      : "Advanced tools for multi-owner management."}
                  </p>
                </div>
                <span className={`status-badge text-2xs ${isOwner ? "bg-primary/15 text-primary" : "bg-accent text-accent-foreground"}`}>
                  {isOwner ? "Owner" : "Pro"}
                </span>
              </div>
              <div className="border-t border-border/50 mt-3 pt-3">
                <button
                  onClick={() => setShowRoleConfirm(true)}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ArrowRight className="w-4 h-4" />
                  {isOwner ? "Request Professional mode" : "Switch to Owner mode"}
                </button>
                <p className="text-xs text-muted-foreground mt-1">
                  {isOwner
                    ? "Unlocks Advanced View with multi-owner tools."
                    : "Simplifies navigation by hiding advanced tools."}
                </p>
              </div>
            </div>
          </section>

          {/* Explanation depth */}
          <section className="mb-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Explanation Depth</h3>
            <div className="calm-card !p-4">
              <p className="text-xs text-muted-foreground mb-2">
                How detailed should Intelligence responses be?
              </p>
              <Select value={depthPref} onValueChange={setDepthPref}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief — Just the answer</SelectItem>
                  <SelectItem value="balanced">Balanced — Answer + context</SelectItem>
                  <SelectItem value="detailed">Detailed — Full explanation + sources</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Notifications */}
          <NotificationPreferencesSection />

          {/* Account info */}
          <section className="mb-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Account</h3>
            <div className="calm-card !p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{user?.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Display name</p>
                <p className="text-sm text-foreground">{profile?.display_name ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subscription</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground">MineralView Pro</p>
                  <span className="px-2 py-0.5 bg-success/15 text-success text-2xs font-medium rounded-full">Active</span>
                </div>
              </div>
            </div>
          </section>

          {/* Sign out (mobile) */}
          <div className="md:hidden">
            <Button
              variant="outline"
              className="w-full"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>

          {/* App info */}
          <div className="text-center mt-6 pb-4">
            <p className="text-xs text-muted-foreground mb-1">MineralView v1.0.0</p>
            <p className="text-xs text-muted-foreground/70">
              Informational only. Not legal, tax, or investment advice.
            </p>
          </div>
        </SheetContent>
      </Sheet>

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
    </>
  );
}
