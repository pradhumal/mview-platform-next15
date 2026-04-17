"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Settings, 
  ChevronRight,
  Bell,
  FileText,
  Droplets,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  getMineralWithWells, 
  getRecentActivityForMineral,
  getWellSummary,
  updateMineralSettings,
  type MineralInterest, 
  type Well,
  type ActivityEvent 
} from "@/lib/dataService";
import { Events } from "@/lib/eventTracker";

const typeIcons = {
  permit: FileText,
  completion: Droplets,
  production_change: TrendingUp,
  spud: TrendingUp,
  workover: TrendingUp,
  rig_move: TrendingUp,
  frac: Droplets,
};

const typeColors = {
  permit: "bg-info/15 text-info",
  completion: "bg-success/15 text-success",
  production_change: "bg-warning/15 text-warning",
  spud: "bg-accent text-accent-foreground",
  workover: "bg-secondary text-secondary-foreground",
  rig_move: "bg-secondary text-secondary-foreground",
  frac: "bg-primary/15 text-primary",
};

function StatusBadge({ status }: { status: "producing" | "permitted" | "inactive" }) {
  const labels = {
    producing: "Producing",
    permitted: "Permitted",
    inactive: "Inactive",
  };

  return (
    <span className={`status-badge status-${status}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}

export default function MineralDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [mineral, setMineral] = useState<MineralInterest | null>(null);
  const [wells, setWells] = useState<Well[]>([]);
  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>([]);
  const [wellSummary, setWellSummary] = useState<{
    whatItIs: string;
    whatItsDoing: string;
    isThisNormal: string;
    whatHappensNext: string;
  } | null>(null);
  
  const [alertRadius, setAlertRadius] = useState([5]);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      Events.mineralView(id);

      try {
        const [mineralData, activityData] = await Promise.all([
          getMineralWithWells(id),
          getRecentActivityForMineral(id),
        ]);
        
        if (mineralData) {
          setMineral(mineralData.mineral);
          setWells(mineralData.wells);
          setAlertRadius([mineralData.mineral.alertRadius]);
          setEmailAlerts(mineralData.mineral.emailAlerts);
          setPushAlerts(mineralData.mineral.pushAlerts);
          
          // Get summary for first linked well if exists
          if (mineralData.wells.length > 0) {
            const summary = await getWellSummary(mineralData.wells[0].id);
            if (summary) {
              setWellSummary({
                whatItIs: summary.whatItIs,
                whatItsDoing: summary.whatItsDoing,
                isThisNormal: summary.isThisNormal,
                whatHappensNext: summary.whatHappensNext,
              });
            }
          }
        }
        
        setRecentEvents(activityData);
      } catch (error) {
        console.error("Failed to fetch mineral details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSettingsChange = async () => {
    if (!id) return;
    await updateMineralSettings(id, {
      alertRadius: alertRadius[0],
      emailAlerts,
      pushAlerts,
    });
  };

  useEffect(() => {
    if (!isLoading) {
      handleSettingsChange();
    }
  }, [alertRadius, emailAlerts, pushAlerts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="px-5 py-4 md:px-8">
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
          </div>
        </header>
        <div className="px-5 py-6 md:px-8 space-y-6">
          <div className="calm-card animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!mineral) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Interest not found</p>
          <Link href="/app/explore/minerals">
            <Button variant="outline">Back to Minerals</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-medium text-foreground truncate">
                {mineral.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{mineral.county}</span>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 md:px-8 space-y-6">
        {/* Summary Header */}
        <section className="calm-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <StatusBadge status={mineral.status} />
              {mineral.operator && (
                <p className="text-sm text-muted-foreground mt-3">
                  Operated by {mineral.operator}
                </p>
              )}
              {mineral.apiNumber && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  API: {mineral.apiNumber}
                </p>
              )}
              {mineral.nri && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  NRI: {(mineral.nri * 100).toFixed(4)}%
                </p>
              )}
              {mineral.acreage && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {mineral.acreage} acres
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Monitoring Settings (Collapsible) */}
        {showSettings && (
          <section className="calm-card animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Monitoring for this interest</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Email alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified via email</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>
              
              <div className="border-t border-border/50" />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Push notifications</p>
                  <p className="text-xs text-muted-foreground">Get mobile alerts</p>
                </div>
                <Switch checked={pushAlerts} onCheckedChange={setPushAlerts} />
              </div>
              
              <div className="border-t border-border/50" />
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-foreground">Alert radius</p>
                    <p className="text-xs text-muted-foreground">
                      Monitor activity within {alertRadius[0]} miles
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">{alertRadius[0]} mi</span>
                </div>
                <Slider
                  value={alertRadius}
                  onValueChange={setAlertRadius}
                  max={20}
                  min={1}
                  step={1}
                />
              </div>
            </div>
          </section>
        )}

        {/* What Changed Recently */}
        {recentEvents.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-foreground mb-3">What changed recently</h3>
            <div className="space-y-2">
              {recentEvents.slice(0, 3).map((event) => {
                const Icon = typeIcons[event.type];
                const colorClass = typeColors[event.type];
                return (
                  <div key={event.id} className="calm-card py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.relativeDate}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Well Summary */}
        {wellSummary && (
          <section className="calm-card">
            <h3 className="font-medium text-foreground mb-3">Well summary</h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground/70 mb-1">What it is</p>
                <p>{wellSummary.whatItIs}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground/70 mb-1">What it&apos;s doing</p>
                <p>{wellSummary.whatItsDoing}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground/70 mb-1">Is this normal?</p>
                <p>{wellSummary.isThisNormal}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground/70 mb-1">What usually happens next</p>
                <p>{wellSummary.whatHappensNext}</p>
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/app/explore/map" className="flex-1">
            <Button variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              View on map
            </Button>
          </Link>
          <Link href={`/app?interest=${id}`} className="flex-1">
            <Button className="w-full">
              Ask about this
            </Button>
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/70 text-center">
          MineralView does not verify legal ownership. Informational only.
        </p>
      </div>
    </div>
  );
}
