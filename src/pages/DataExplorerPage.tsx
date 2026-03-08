import { Link } from "react-router-dom";
import { Layers, Activity, Map, FileText, ChevronRight, Sparkles, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { getMyMinerals, getActivityFeed, getReportsIndex } from "@/lib/dataService";

interface ExplorerSection {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  count?: number;
  badge?: string;
}

export default function DataExplorerPage() {
  const [sections, setSections] = useState<ExplorerSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [minerals, activity, reports] = await Promise.all([
          getMyMinerals(),
          getActivityFeed({ significance: ["high", "medium"] }),
          getReportsIndex(),
        ]);

        const newReports = reports.filter((r) => r.status === "new" || r.status === "requires_attention").length;
        const recentActivity = activity.filter((a) => a.significance === "high").length;

        setSections([
          {
            title: "Your Minerals",
            description: "Your mineral interests — ask Intelligence to explain what's changed",
            icon: Layers,
            to: "/app/explore/minerals",
            count: minerals.length,
          },
          {
            title: "Activity",
            description: "Permits, completions, and production changes near your interests — ask why this changed or if it matters",
            icon: Activity,
            to: "/app/explore/activity",
            count: activity.length,
            badge: recentActivity > 0 ? `${recentActivity} new` : undefined,
          },
          {
            title: "Production",
            description: "Monthly production history and trends — decline is normal. Ask if this is within normal range",
            icon: TrendingDown,
            to: "/app/explore/production",
          },
          {
            title: "Map",
            description: "Wells and activity near your interests — Intelligence adds context when helpful",
            icon: Map,
            to: "/app/explore/map",
          },
          {
            title: "Reports & Filings",
            description: "Public reports related to your interests — Intelligence can summarize these for you",
            icon: FileText,
            to: "/app/explore/reports",
            count: reports.length,
            badge: newReports > 0 ? `${newReports} new` : undefined,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch explorer data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl text-foreground mb-1">Explore</h1>
        <p className="text-sm text-muted-foreground">
          Reference data for your mineral interests. Intelligence can help interpret anything you see here.
        </p>
      </header>

      {/* Quick Ask Card */}
      <div className="calm-card mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Need help interpreting something?</p>
          <p className="text-xs text-muted-foreground">Intelligence can explain what changed and whether it matters</p>
        </div>
        <Link
          to="/app"
          className="flex items-center gap-1 text-sm text-primary font-medium hover:underline flex-shrink-0"
        >
          Ask
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Explorer Sections */}
      <div className="space-y-3">
        {isLoading ? (
          // Loading skeletons
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="calm-card flex items-center gap-4 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-muted" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))
        ) : (
          sections.map((section) => (
            <Link
              key={section.title}
              to={section.to}
              className="calm-card flex items-center gap-4 hover:border-primary/20 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <section.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{section.title}</p>
                  {section.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-2xs font-medium">
                      {section.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {section.count !== undefined && (
                  <span className="text-sm text-muted-foreground">{section.count}</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        Data sourced from public filings. MineralView does not verify legal ownership.
      </p>
    </div>
  );
}
