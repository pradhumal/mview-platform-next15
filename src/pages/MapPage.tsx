import { useState, useEffect, useCallback } from "react";
import { Filter, Layers, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { FollowUpPrompts, mapPrompts, emptyStatePrompts } from "@/components/FollowUpPrompts";
import { getMapFeatures, getMyMinerals, type MapFeature, type MineralInterest } from "@/lib/dataService";
import { TravelingIntelligence } from "@/components/TravelingIntelligence";

type TimeFilter = "30" | "90" | "180";

export default function MapPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30");
  const [showOnlyNearby, setShowOnlyNearby] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [minerals, setMinerals] = useState<MineralInterest[]>([]);
  const [features, setFeatures] = useState<MapFeature[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [mineralsData, featuresData] = await Promise.all([
          getMyMinerals(),
          getMapFeatures(),
        ]);
        setMinerals(mineralsData);
        setFeatures(featuresData);
      } catch (error) {
        console.error("Failed to fetch map data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const hasInterests = minerals.length > 0;
  const openIntelligence = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-intelligence"));
  }, []);
  if (!isLoading && !hasInterests) {
    return (
      <div className="h-[calc(100vh-5rem)] md:h-screen flex flex-col">
        <header className="px-5 py-4 md:px-8 md:py-6 border-b border-border/50">
          <h1 className="text-lg font-medium text-foreground">Map</h1>
          <p className="text-sm text-muted-foreground">Wells and activity near your interests — Intelligence adds context when helpful</p>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={MapPin}
            title="Add an interest to view the map"
            description="The map shows your mineral interests and nearby well activity."
            action={{ label: "Add mineral interest", to: "/app/explore/minerals/add" }}
          />
        </div>
      </div>
    );
  }

  // Count features by type
  const wellCount = features.filter((f) => f.type === "well").length;
  const permitCount = features.filter((f) => f.type === "permit").length;
  const interestCount = features.filter((f) => f.type === "interest").length;

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 md:px-8 md:py-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-foreground">Map</h1>
            <p className="text-sm text-muted-foreground">
              {interestCount} interests • {wellCount} wells • {permitCount} permits
            </p>
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Intelligence Summary */}
      <div className="px-5 pt-3 md:px-8">
        <TravelingIntelligence subPage="map" onOpenIntelligence={openIntelligence} />
      </div>

      {/* Filters */}
      <div className="px-5 py-3 md:px-8 border-b border-border/30 bg-muted/30">
        <div className="flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Time:</span>
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
          </div>
          
          <button
            onClick={() => setShowOnlyNearby(!showOnlyNearby)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              showOnlyNearby
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Nearby only
          </button>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="flex-1 relative bg-muted/20 overflow-hidden">
        {/* Placeholder content — no absolute overlay to avoid blocking panels */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 max-w-sm">
            <p className="text-sm text-muted-foreground mb-4">
              {features.length} features ready to display. Connect a mapping service to enable interactive visualization.
            </p>
            <Link to="/app/explore/activity">
              <Button variant="outline" size="sm">
                View related activity
              </Button>
            </Link>
            
            {/* Follow-up prompts */}
            <FollowUpPrompts 
              prompts={mapPrompts} 
              context="map-view"
              className="mt-6"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-56">
          <div className="calm-card p-4">
            <p className="text-xs font-medium text-foreground mb-3">Legend</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Producing ({features.filter(f => f.properties.status === "producing").length})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-info" />
                <span className="text-xs text-muted-foreground">Permitted ({permitCount})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-xs text-muted-foreground">Recently completed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-sm bg-primary border-2 border-primary" />
                <span className="text-xs text-muted-foreground">Your interests ({interestCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
