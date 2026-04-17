"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MViewBottomNav } from "./MViewBottomNav";
import { MViewDesktopSidebar } from "./MViewDesktopSidebar";
import { IntelligencePanel } from "./IntelligencePanel";
import { NotificationInbox } from "./NotificationInbox";
import { SettingsSheet } from "./SettingsSheet";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { touchOwnerLastSeen } from "@/lib/dataService";

export function MViewAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [showIntelligence, setShowIntelligence] = useState(false);

  // Update last_seen_at on app load
  useEffect(() => {
    if (profile?.role === "owner") {
      touchOwnerLastSeen();
    }
  }, [profile?.role]);

  // Listen for "open-intelligence" events from TravelingIntelligence panels
  useEffect(() => {
    const handler = () => setShowIntelligence(true);
    window.addEventListener("open-intelligence", handler);
    return () => window.removeEventListener("open-intelligence", handler);
  }, []);
  
  const isIntelligenceTab = pathname === "/app/intelligence" || pathname === "/app/intelligence/";
  const role = profile?.role || "owner";
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      <MViewDesktopSidebar role={role} />
      
      <main className="flex-1 pb-20 md:pb-0 pt-12">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>

      {/* Top bar: wordmark left, actions right — mobile only (md: hidden via sidebar) */}
      <div className="fixed top-0 left-0 right-0 h-12 z-20 flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm border-b border-border/40 md:hidden">
        <Link href="/app/intelligence" className="text-sm font-semibold text-foreground tracking-tight hover:text-primary transition-colors">MineralView</Link>
        <div className="flex items-center gap-2">
          <NotificationInbox />
          <SettingsSheet />
        </div>
      </div>

      {/* Notification + settings — desktop only (sidebar handles nav) */}
      <div className="fixed top-3 right-4 z-20 hidden md:flex items-center gap-2">
        <NotificationInbox />
        <SettingsSheet />
      </div>
      
      <MViewBottomNav role={role} />
      
      {/* Floating Intelligence Button — shown on non-Intelligence tabs */}
      {!isIntelligenceTab && !showIntelligence && (
        <button
          onClick={() => setShowIntelligence(true)}
          className="fixed right-3 bottom-[5.5rem] md:right-5 md:bottom-5 z-30 w-10 h-10 rounded-full bg-primary/90 text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary transition-colors"
          aria-label="Ask MineralView"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      )}
      
      <IntelligencePanel 
        isOpen={showIntelligence} 
        onClose={() => setShowIntelligence(false)} 
      />
    </div>
  );
}

