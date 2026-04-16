"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { IntelligencePanel } from "./IntelligencePanel";
import { Sparkles } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showIntelligence, setShowIntelligence] = useState(false);
  
  // Check if we're in the Data Explorer section (should show floating intelligence button)
  const isExploreSection = pathname.includes("/explore");
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      <DesktopSidebar />
      
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
      
      <BottomNav />
      
      {/* Floating Intelligence Button - Only in Explore section */}
      {isExploreSection && !showIntelligence && (
        <button
          onClick={() => setShowIntelligence(true)}
          className="fixed right-3 bottom-[5.5rem] md:right-5 md:bottom-5 z-30 w-10 h-10 rounded-full bg-primary/90 text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary transition-colors"
          aria-label="Ask MineralView"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      )}
      
      {/* Persistent Intelligence Panel */}
      <IntelligencePanel 
        isOpen={showIntelligence} 
        onClose={() => setShowIntelligence(false)} 
      />
    </div>
  );
}

