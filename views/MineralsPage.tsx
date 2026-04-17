"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronRight, Plus, AlertCircle, Layers, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { MineralCardSkeleton } from "@/components/LoadingSkeleton";
import { getMyMinerals, type MineralInterest } from "@/lib/dataService";
import { featureFlags } from "@/lib/featureFlags";

function StatusBadge({ status }: { status: MineralInterest["status"] }) {
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

export default function MineralsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [minerals, setMinerals] = useState<MineralInterest[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMyMinerals();
        setMinerals(data);
      } catch (error) {
        console.error("Failed to fetch minerals:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
        <header className="mb-6 md:mb-8">
          <h1 className="text-foreground mb-2">My Minerals</h1>
          <p className="text-muted-foreground text-sm">Your mineral interests in Texas</p>
        </header>
        <div className="space-y-3">
          <MineralCardSkeleton />
          <MineralCardSkeleton />
          <MineralCardSkeleton />
        </div>
      </div>
    );
  }

  if (minerals.length === 0) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-12">
        <header className="mb-6 md:mb-8">
          <h1 className="text-foreground mb-2">My Minerals</h1>
          <p className="text-muted-foreground text-sm">Your mineral interests in Texas</p>
        </header>
        <EmptyState
          icon={Layers}
          title="Add your first interest"
          description="Add mineral interests to understand what's happening nearby — we'll explain what matters."
          action={{ label: "Add mineral interest", to: "/app/explore/minerals/add" }}
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <h1 className="text-foreground mb-2">My Minerals</h1>
        <p className="text-muted-foreground text-sm">
          {minerals.length} mineral interest{minerals.length !== 1 ? 's' : ''} in Texas
        </p>
      </header>

      {/* Add button */}
      {featureFlags.addMineral && (
        <Link href="/app/explore/minerals/add">
          <Button variant="outline" className="w-full mb-6 h-12 gap-2">
            <Plus className="w-4 h-4" />
            Add mineral interest
          </Button>
        </Link>
      )}

      {/* Mineral list */}
      <div className="space-y-3">
        {minerals.map((mineral) => (
          <Link
            key={mineral.id}
            href={`/app/explore/minerals/${mineral.id}`}
            className="block calm-card hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-medium text-foreground truncate">
                    {mineral.name}
                  </h3>
                  <StatusBadge status={mineral.status} />
                </div>
                
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {mineral.county}
                </div>
                
                {mineral.operator && (
                  <p className="text-sm text-muted-foreground">
                    Operated by {mineral.operator}
                  </p>
                )}
                
                {mineral.apiNumber && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    API: {mineral.apiNumber}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Link 
                  href={`/app/explore/minerals/${mineral.id}?settings=true`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-muted/50 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            MineralView does not verify legal ownership. This tool is informational only and should not be used for legal or financial decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
