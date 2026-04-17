"use client";

import { Briefcase, MapPin, ShieldCheck, AlertTriangle } from "lucide-react";
import { mockMinerals } from "@/lib/mock";

const CLARITY_STYLES = {
  clear: { icon: ShieldCheck, class: "text-success", label: "Clear" },
  partial: { icon: AlertTriangle, class: "text-warning", label: "Partial" },
  unclear: { icon: AlertTriangle, class: "text-destructive", label: "Unclear" },
} as const;

// Map mock minerals to portfolio items with identity labels
const portfolioItems = mockMinerals.map((m) => ({
  ...m,
  ownerName: m.id === "min-1" || m.id === "min-2" ? "Johnson Family Trust" : m.id === "min-3" ? "Davis Estate" : "Unknown",
  ownerIdentity: (m.id === "min-1" ? "verified" : m.id === "min-2" ? "claimed" : "unverified") as "verified" | "claimed" | "unverified",
  ownershipClarity: (m.status === "producing" ? "clear" : "partial") as "clear" | "partial" | "unclear",
  nriDisplay: m.nri ? `${(m.nri * 100).toFixed(4)}%` : "ΓÇö",
}));

export default function AdvancedPortfolioPage() {
  const verified = portfolioItems.filter((p) => p.ownerIdentity === "verified").length;
  const claimed = portfolioItems.filter((p) => p.ownerIdentity === "claimed").length;

  return (
    <div className="px-4 py-6 md:px-8 animate-fade-in">
      <h1 className="text-xl font-medium text-foreground mb-1">Portfolio Overview</h1>
      <p className="text-sm text-muted-foreground mb-6">All interests with identity and ownership clarity labels.</p>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="calm-card !p-3 text-center">
          <p className="text-lg font-medium text-foreground">{portfolioItems.length}</p>
          <p className="text-2xs text-muted-foreground">Total</p>
        </div>
        <div className="calm-card !p-3 text-center">
          <p className="text-lg font-medium text-success">{verified}</p>
          <p className="text-2xs text-muted-foreground">Verified</p>
        </div>
        <div className="calm-card !p-3 text-center">
          <p className="text-lg font-medium text-warning">{claimed}</p>
          <p className="text-2xs text-muted-foreground">Claimed</p>
        </div>
      </div>

      {/* Dense list */}
      <div className="space-y-2">
        {portfolioItems.map((item) => {
          const clarity = CLARITY_STYLES[item.ownershipClarity];
          const ClarityIcon = clarity.icon;
          return (
            <div key={item.id} className="calm-card !p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-2xs text-muted-foreground">{item.ownerName}</p>
                </div>
                <span className={`status-badge text-2xs flex-shrink-0 ${
                  item.ownerIdentity === "verified" ? "bg-success/15 text-success" :
                  item.ownerIdentity === "claimed" ? "bg-warning/15 text-warning" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {item.ownerIdentity}
                </span>
              </div>
              <div className="flex items-center gap-3 text-2xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {item.county}
                </span>
                <span>NRI: {item.nriDisplay}</span>
                <span className={`flex items-center gap-1 ${clarity.class}`}>
                  <ClarityIcon className="w-3 h-3" /> {clarity.label}
                </span>
              </div>
              {item.operator && (
                <p className="text-2xs text-muted-foreground mt-1">Op: {item.operator}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
