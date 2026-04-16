"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Droplets, TrendingUp, MapPin, ChevronRight, Activity, Hammer, Truck } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { ActivityCardSkeleton } from "@/components/LoadingSkeleton";
import { FollowUpPrompts, activityPrompts, emptyStatePrompts } from "@/components/FollowUpPrompts";
import { getActivityFeed, type ActivityEvent, type ActivityFilters } from "@/lib/dataService";
import { TravelingIntelligence } from "@/components/TravelingIntelligence";

type TimeFilter = "30" | "90" | "180";

const typeIcons: Record<ActivityEvent["type"], React.ComponentType<{ className?: string }>> = {
  permit: FileText,
  completion: Droplets,
  production_change: TrendingUp,
  spud: Hammer,
  workover: Truck,
  rig_move: Truck,
  frac: Droplets,
};

const typeColors: Record<ActivityEvent["type"], string> = {
  permit: "bg-info/15 text-info",
  completion: "bg-success/15 text-success",
  production_change: "bg-warning/15 text-warning",
  spud: "bg-accent text-accent-foreground",
  workover: "bg-secondary text-secondary-foreground",
  rig_move: "bg-secondary text-secondary-foreground",
  frac: "bg-primary/15 text-primary",
};

const typeLabels: Record<ActivityEvent["type"], string> = {
  permit: "Permit",
  completion: "Completion",
  production_change: "Production",
  spud: "Spud",
  workover: "Workover",
  rig_move: "Rig Move",
  frac: "Frac",
};

export default function ActivityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30");
  const [typeFilter, setTypeFilter] = useState<ActivityEvent["type"] | "all">("all");
  const openIntelligence = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-intelligence"));
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const filters: ActivityFilters = {
          timeRangeDays: parseInt(timeFilter) as 30 | 90 | 180,
        };
        if (typeFilter !== "all") {
          filters.eventTypes = [typeFilter];
        }
        const data = await getActivityFeed(filters);
        setActivity(data);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [timeFilter, typeFilter]);

  const filteredActivity = activity.filter(item => 
    typeFilter === "all" || item.type === typeFilter
  );

  if (isLoading) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
        <header className="mb-6 md:mb-8">
          <h1 className="text-foreground mb-2">Activity</h1>
          <p className="text-muted-foreground text-sm">Permits, completions, and production changes near your interests — Intelligence can help explain whether they matter</p>
        </header>
        <div className="space-y-0">
          <ActivityCardSkeleton />
          <ActivityCardSkeleton />
        </div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-12">
        <header className="mb-6 md:mb-8">
          <h1 className="text-foreground mb-2">Activity</h1>
          <p className="text-muted-foreground text-sm">Permits, completions, and production changes near your interests — Intelligence can help explain whether they matter</p>
        </header>
        <EmptyState
          icon={Activity}
          title="Nothing new"
          description="No recent activity detected near your minerals. You'll be notified when something changes."
        />
        <FollowUpPrompts 
          prompts={emptyStatePrompts} 
          context="activity-empty"
          className="max-w-md mx-auto mt-6"
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
      {/* Header */}
      <header className="mb-4 md:mb-6">
        <h1 className="text-foreground mb-2">Activity</h1>
        <p className="text-muted-foreground text-sm">
          Permits, completions, and production changes near your interests — Intelligence can help explain whether they matter
        </p>
      </header>

      {/* Intelligence Summary */}
      <TravelingIntelligence subPage="activity" onOpenIntelligence={openIntelligence} className="mb-4" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Time filter */}
        <div className="flex bg-secondary rounded-lg p-0.5">
          {(["30", "90", "180"] as TimeFilter[]).map((days) => (
            <button
              key={days}
              onClick={() => setTimeFilter(days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeFilter === days
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              typeFilter === "all"
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {(["permit", "completion", "production_change", "spud"] as ActivityEvent["type"][]).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                typeFilter === type
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {filteredActivity.map((item) => {
          const Icon = typeIcons[item.type];
          
          return (
            <div key={item.id} className="timeline-item">
              {/* Dot */}
              <div className={`timeline-dot ${typeColors[item.type]}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              
              {/* Content */}
              <div className="calm-card">
                {/* Type tag */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${typeColors[item.type]}`}>
                  {typeLabels[item.type]}
                </span>

                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-foreground leading-tight">
                    {item.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.relativeDate}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {item.description}
                </p>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-4">
                  <MapPin className="w-3 h-3" />
                  {item.distanceLabel} from {item.relatedMineralName}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                  <Link 
                    href={`/app/explore/minerals/${item.relatedMineralId}`}
                    className="action-link"
                  >
                    View interest
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link 
                    href="/app/explore/map"
                    className="action-link"
                  >
                    View on map
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                
                {/* Follow-up prompts */}
                <FollowUpPrompts 
                  prompts={activityPrompts} 
                  context={`activity-${item.type}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {filteredActivity.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No {typeFilter !== "all" ? typeLabels[typeFilter].toLowerCase() : ""} activity in the last {timeFilter} days
          </p>
        </div>
      )}
    </div>
  );
}
