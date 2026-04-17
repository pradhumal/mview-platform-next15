"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, Wrench, Map, Activity, Layers, FileText, LogOut, TrendingDown, Users, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  role: "owner" | "professional";
}

export function MViewDesktopSidebar({ role: _role }: Props) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const isExploreSection = pathname.includes("/explore");
  const isAdvancedSection = pathname.includes("/advanced");

  const mainNav = [
    { icon: Sparkles, label: "Intelligence", to: "/app/intelligence" },
    { icon: Compass, label: "Explore", to: "/app/explore" },
    { icon: Wrench, label: "Advanced", to: "/app/advanced" },
  ];

  const exploreSubItems = [
    { icon: Map, label: "Map", to: "/app/explore/map" },
    { icon: Activity, label: "Production", to: "/app/explore/production" },
    { icon: FileText, label: "Reports", to: "/app/explore/reports" },
    { icon: Layers, label: "Activity", to: "/app/explore/activity" },
  ];

  const advancedSubItems = [
    { icon: TrendingDown, label: "Decline", to: "/app/advanced/decline" },
    { icon: Briefcase, label: "Portfolio", to: "/app/advanced/portfolio" },
    { icon: Users, label: "Owners", to: "/app/advanced/owners" },
    { icon: FileText, label: "Reports", to: "/app/advanced/reports" },
    { icon: Activity, label: "Activity", to: "/app/advanced/activity" },
  ];

  const isActive = (to: string) =>
    to === "/app/intelligence"
      ? pathname === "/app/intelligence" || pathname === "/app/intelligence/"
      : pathname.startsWith(to);

  return (
    <aside className="hidden md:flex flex-col w-56 h-screen sticky top-0 border-r border-border/50 bg-sidebar p-4">
      <Link href="/app/intelligence" className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <span className="font-medium text-foreground">MineralView</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {mainNav.map((item) => (
          <div key={item.label}>
            <Link
              href={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.to)
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>

            {item.label === "Explore" && isExploreSection && (
              <div className="ml-8 mt-1 space-y-0.5">
                {exploreSubItems.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.to}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      pathname.startsWith(sub.to)
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <sub.icon className="w-4 h-4" />
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}

            {item.label === "Advanced" && isAdvancedSection && (
              <div className="ml-8 mt-1 space-y-0.5">
                {advancedSubItems.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.to}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      pathname.startsWith(sub.to)
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <sub.icon className="w-4 h-4" />
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="space-y-1 pt-4 border-t border-border/50">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent w-full text-left transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
