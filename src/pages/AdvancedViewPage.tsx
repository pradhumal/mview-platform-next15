import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users, TrendingDown, FileText, Activity, Briefcase, ShieldCheck,
  ChevronRight, ArrowRight
} from "lucide-react";
import { mockMinerals } from "@/lib/mock";

const sections = [
  { icon: Users, label: "Manage Owners", to: "/app/advanced/owners", desc: "Switch active owner, view portfolio" },
  { icon: Briefcase, label: "Portfolio", to: "/app/advanced/portfolio", desc: "All interests with identity labels" },
  { icon: ShieldCheck, label: "Verification", to: "/app/advanced/verification", desc: "Claimed vs verified workflow" },
  { icon: TrendingDown, label: "Decline Workbench", to: "/app/advanced/decline", desc: "Overlay, projection, assumptions" },
  { icon: FileText, label: "Reports Workbench", to: "/app/advanced/reports", desc: "Deep report analysis" },
  { icon: Activity, label: "Activity Filters", to: "/app/advanced/activity", desc: "Advanced filtering & search" },
];

export default function AdvancedViewPage() {
  const counties = [...new Set(mockMinerals.map((m) => m.county))];

  return (
    <div className="px-4 py-6 md:px-8 animate-fade-in">
      <h1 className="text-xl font-medium text-foreground mb-1">Advanced View</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Professional tools for portfolio management and analysis.
      </p>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="calm-card !p-3 text-center">
          <p className="text-lg font-medium text-foreground">3</p>
          <p className="text-2xs text-muted-foreground">Owners</p>
        </div>
        <div className="calm-card !p-3 text-center">
          <p className="text-lg font-medium text-foreground">{mockMinerals.length}</p>
          <p className="text-2xs text-muted-foreground">Interests</p>
        </div>
        <div className="calm-card !p-3 text-center">
          <p className="text-lg font-medium text-foreground">{counties.length}</p>
          <p className="text-2xs text-muted-foreground">Counties</p>
        </div>
      </div>

      {/* Section grid */}
      <div className="space-y-2">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="flex items-center gap-3 calm-card !p-4 hover:bg-secondary/40 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <s.icon className="w-4.5 h-4.5 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-2xs text-muted-foreground">{s.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
