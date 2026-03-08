import { useState } from "react";
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationItem {
  id: string;
  mineralName: string;
  ownerName: string;
  status: "verified" | "claimed" | "unverified";
  county: string;
  submittedDate: string | null;
  verifiedDate: string | null;
  steps: { label: string; done: boolean }[];
}

const mockVerifications: VerificationItem[] = [
  {
    id: "v-1", mineralName: "Johnson Family Trust", ownerName: "Johnson Family Trust",
    status: "verified", county: "Midland County", submittedDate: "2024-06-15", verifiedDate: "2024-07-02",
    steps: [
      { label: "Deed recorded in county", done: true },
      { label: "Title opinion obtained", done: true },
      { label: "Division order received", done: true },
    ],
  },
  {
    id: "v-2", mineralName: "Section 15 Block A", ownerName: "Johnson Family Trust",
    status: "claimed", county: "Howard County", submittedDate: "2024-08-22", verifiedDate: null,
    steps: [
      { label: "Deed recorded in county", done: true },
      { label: "Title opinion obtained", done: false },
      { label: "Division order received", done: true },
    ],
  },
  {
    id: "v-3", mineralName: "Inherited Lease - Reeves", ownerName: "Davis Estate",
    status: "unverified", county: "Reeves County", submittedDate: null, verifiedDate: null,
    steps: [
      { label: "Deed recorded in county", done: false },
      { label: "Title opinion obtained", done: false },
      { label: "Division order received", done: false },
    ],
  },
];

const STATUS_CONFIG = {
  verified: { icon: ShieldCheck, color: "text-success", bg: "bg-success/15", label: "Verified" },
  claimed: { icon: Clock, color: "text-warning", bg: "bg-warning/15", label: "Claimed" },
  unverified: { icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-muted", label: "Unverified" },
} as const;

export default function AdvancedVerificationPage() {
  const [filter, setFilter] = useState<"all" | "verified" | "claimed" | "unverified">("all");

  const filtered = filter === "all" ? mockVerifications : mockVerifications.filter((v) => v.status === filter);

  return (
    <div className="px-4 py-6 md:px-8 animate-fade-in">
      <h1 className="text-xl font-medium text-foreground mb-1">Lease Verification</h1>
      <p className="text-sm text-muted-foreground mb-6">Track ownership verification status for all interests.</p>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(["all", "verified", "claimed", "unverified"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} ({f === "all" ? mockVerifications.length : mockVerifications.filter((v) => v.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const cfg = STATUS_CONFIG[item.status];
          const StatusIcon = cfg.icon;
          const completedSteps = item.steps.filter((s) => s.done).length;
          return (
            <div key={item.id} className="calm-card !p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.mineralName}</p>
                  <p className="text-2xs text-muted-foreground">{item.ownerName} · {item.county}</p>
                </div>
                <span className={`status-badge text-2xs flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>

              {/* Steps */}
              <div className="space-y-1.5 mb-3">
                {item.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${step.done ? "text-success" : "text-muted-foreground/30"}`} />
                    <span className={`text-xs ${step.done ? "text-foreground" : "text-muted-foreground/60"}`}>{step.label}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(completedSteps / item.steps.length) * 100}%` }}
                />
              </div>
              <p className="text-2xs text-muted-foreground mt-1.5">{completedSteps}/{item.steps.length} steps complete</p>

              {item.status !== "verified" && (
                <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                  Start Verification <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
