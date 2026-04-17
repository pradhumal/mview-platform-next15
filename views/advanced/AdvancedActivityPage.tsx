"use client";

import { useState, useMemo } from "react";
import { Activity, MapPin, Calendar, Building2, X } from "lucide-react";
import { mockActivityFeed, type ActivityEventType } from "@/lib/mock";

const EVENT_TYPES: { value: ActivityEventType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "permit", label: "Permit" },
  { value: "completion", label: "Completion" },
  { value: "spud", label: "Spud" },
  { value: "frac", label: "Frac" },
  { value: "workover", label: "Workover" },
  { value: "production_change", label: "Production" },
  { value: "rig_move", label: "Rig Move" },
];

const SIGNIFICANCE_OPTIONS = ["all", "high", "medium", "low"] as const;

const SIG_STYLES = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-warning/15 text-warning",
  low: "bg-muted text-muted-foreground",
} as const;

export default function AdvancedActivityPage() {
  const [typeFilter, setTypeFilter] = useState<ActivityEventType | "all">("all");
  const [sigFilter, setSigFilter] = useState<typeof SIGNIFICANCE_OPTIONS[number]>("all");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");

  const counties = useMemo(() => [...new Set(mockActivityFeed.map((e) => e.county))], []);
  const operators = useMemo(() => [...new Set(mockActivityFeed.map((e) => e.operator))], []);

  const filtered = useMemo(() => {
    return mockActivityFeed.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (sigFilter !== "all" && e.significance !== sigFilter) return false;
      if (countyFilter !== "all" && e.county !== countyFilter) return false;
      if (operatorFilter !== "all" && e.operator !== operatorFilter) return false;
      return true;
    });
  }, [typeFilter, sigFilter, countyFilter, operatorFilter]);

  const activeFilters = [typeFilter, sigFilter, countyFilter, operatorFilter].filter((f) => f !== "all").length;

  const clearAll = () => { setTypeFilter("all"); setSigFilter("all"); setCountyFilter("all"); setOperatorFilter("all"); };

  return (
    <div className="px-4 py-6 md:px-8 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-medium text-foreground">Activity Filters</h1>
        {activeFilters > 0 && (
          <button onClick={clearAll} className="text-xs text-primary flex items-center gap-1">
            <X className="w-3 h-3" /> Clear ({activeFilters})
          </button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-5">Advanced multi-field filtering for nearby activity events.</p>

      {/* Filter sections */}
      <div className="space-y-3 mb-6">
        {/* Type */}
        <div>
          <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Event Type</p>
          <div className="flex gap-1.5 flex-wrap">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-2.5 py-1 rounded-full text-2xs font-medium transition-colors ${
                  typeFilter === t.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Significance */}
        <div>
          <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Significance</p>
          <div className="flex gap-1.5">
            {SIGNIFICANCE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSigFilter(s)}
                className={`px-2.5 py-1 rounded-full text-2xs font-medium transition-colors ${
                  sigFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* County */}
        <div>
          <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">County</p>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCountyFilter("all")}
              className={`px-2.5 py-1 rounded-full text-2xs font-medium transition-colors ${
                countyFilter === "all" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {counties.map((c) => (
              <button
                key={c}
                onClick={() => setCountyFilter(c)}
                className={`px-2.5 py-1 rounded-full text-2xs font-medium transition-colors ${
                  countyFilter === c ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Operator */}
        <div>
          <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Operator</p>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setOperatorFilter("all")}
              className={`px-2.5 py-1 rounded-full text-2xs font-medium transition-colors ${
                operatorFilter === "all" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {operators.map((o) => (
              <button
                key={o}
                onClick={() => setOperatorFilter(o)}
                className={`px-2.5 py-1 rounded-full text-2xs font-medium transition-colors ${
                  operatorFilter === o ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <p className="text-xs text-muted-foreground mb-3">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</p>
      <div className="space-y-2">
        {filtered.map((event) => (
          <div key={event.id} className="calm-card !p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-foreground leading-tight">{event.title}</p>
              <span className={`status-badge text-2xs flex-shrink-0 ${SIG_STYLES[event.significance]}`}>
                {event.significance}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.relativeDate}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.distanceLabel}</span>
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{event.operator}</span>
            </div>
            <p className="text-2xs text-primary mt-1">{event.relatedMineralName}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="calm-card text-center py-8">
            <p className="text-sm text-muted-foreground">No events match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
