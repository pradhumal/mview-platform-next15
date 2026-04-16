"use client";

import { useState } from "react";
import { FileText, Filter, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { mockReports } from "@/lib/mock";

const STATUS_CONFIG = {
  new: { icon: Clock, color: "text-info", bg: "bg-info/15", label: "New" },
  reviewed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/15", label: "Reviewed" },
  requires_attention: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/15", label: "Attention" },
} as const;

type StatusFilter = "all" | "new" | "reviewed" | "requires_attention";
type TypeFilter = "all" | string;

export default function AdvancedReportsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const types = [...new Set(mockReports.map((r) => r.type))];

  const filtered = mockReports.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="px-4 py-6 md:px-8 animate-fade-in">
      <h1 className="text-xl font-medium text-foreground mb-1">Reports Workbench</h1>
      <p className="text-sm text-muted-foreground mb-4">Deep analysis of all regulatory filings and operator reports.</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="calm-card !p-3 text-center">
          <p className="text-lg font-medium text-foreground">{mockReports.length}</p>
          <p className="text-2xs text-muted-foreground">Total</p>
        </div>
        <div className="calm-card !p-3 text-center">
          <p className="text-lg font-medium text-info">{mockReports.filter((r) => r.status === "new").length}</p>
          <p className="text-2xs text-muted-foreground">New</p>
        </div>
        <div className="calm-card !p-3 text-center">
          <p className="text-lg font-medium text-warning">{mockReports.filter((r) => r.status === "requires_attention").length}</p>
          <p className="text-2xs text-muted-foreground">Attention</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {(["all", "new", "reviewed", "requires_attention"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f === "all" ? "All Status" : f === "requires_attention" ? "Attention" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button
          onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            typeFilter === "all" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All Types
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              typeFilter === t ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Report list - dense */}
      <div className="space-y-2">
        {filtered.map((report) => {
          const cfg = STATUS_CONFIG[report.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={report.id} className="calm-card !p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-medium text-foreground leading-tight">{report.title}</p>
                <span className={`status-badge text-2xs flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted-foreground">
                <span>{report.source}</span>
                <span>{report.county}</span>
                <span>{report.filedDate}</span>
                {report.operator && <span>Op: {report.operator}</span>}
              </div>
              {report.relatedMineralName && (
                <p className="text-2xs text-primary mt-1.5">{report.relatedMineralName}</p>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="calm-card text-center py-8">
            <p className="text-sm text-muted-foreground">No reports match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
