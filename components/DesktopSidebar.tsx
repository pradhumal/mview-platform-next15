"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, Settings, Layers, Activity, Map } from "lucide-react";

const mainNavItems = [
  { icon: Sparkles, label: "Intelligence", to: "/app", description: "Ask questions" },
  { icon: Compass, label: "Explore", to: "/app/explore", description: "Browse your data" },
];

const exploreSubItems = [
  { icon: Layers, label: "Minerals", to: "/app/explore/minerals" },
  { icon: Activity, label: "Activity", to: "/app/explore/activity" },
  { icon: Map, label: "Map", to: "/app/explore/map" },
];

const settingsItem = { icon: Settings, label: "Settings", to: "/app/settings" };

export function DesktopSidebar() {
  const pathname = usePathname();
  const isExploreSection = pathname.includes("/explore");

  return (
    <aside className="hidden md:flex flex-col w-56 h-screen sticky top-0 border-r border-border/50 bg-sidebar p-4">
      {/* Logo */}
      <Link href="/app" className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <span className="font-medium text-foreground">MineralView</span>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = item.to === "/app"
            ? pathname === "/app" || pathname === "/app/"
            : pathname.startsWith(item.to);

          return (
            <div key={item.label}>
              <Link
                href={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
              
              {/* Explore sub-items */}
              {item.label === "Explore" && isExploreSection && (
                <div className="ml-8 mt-1 space-y-0.5">
                  {exploreSubItems.map((subItem) => {
                    const isSubActive = pathname.startsWith(subItem.to);
                    return (
                      <Link
                        key={subItem.label}
                        href={subItem.to}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          isSubActive
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <subItem.icon className="w-4 h-4" />
                        {subItem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <Link
        href={settingsItem.to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          pathname.startsWith(settingsItem.to)
            ? "bg-primary/10 text-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}
      >
        <settingsItem.icon className="w-5 h-5" />
        <span className="text-sm font-medium">{settingsItem.label}</span>
      </Link>
    </aside>
  );
}
