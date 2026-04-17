import type { EvidenceBlockData } from "@/lib/domain/responseSchema";
import { MiniProductionChart } from "./MiniProductionChart";
import { MiniActivityMap } from "./MiniActivityMap";
import { BarChart3, Map, ClipboardList } from "lucide-react";

interface EvidenceBlockProps {
  data: EvidenceBlockData;
}

export function EvidenceBlock({ data }: EvidenceBlockProps) {
  return (
    <div className="my-2 rounded-lg border border-border/50 bg-secondary/20 overflow-hidden">
      {data.label && (
        <div className="px-3 py-1.5 border-b border-border/30 flex items-center gap-1.5">
          {data.kind === "production-chart" && <BarChart3 className="w-3 h-3 text-muted-foreground" />}
          {data.kind === "activity-map" && <Map className="w-3 h-3 text-muted-foreground" />}
          {data.kind === "summary-card" && <ClipboardList className="w-3 h-3 text-muted-foreground" />}
          <span className="text-2xs font-medium text-muted-foreground">{data.label}</span>
        </div>
      )}
      <div className="p-2 scale-[0.92] origin-top-left">
        {data.kind === "production-chart" && <MiniProductionChart />}
        {data.kind === "activity-map" && <MiniActivityMap />}
        {data.kind === "summary-card" && (
          <div className="text-xs text-muted-foreground italic px-1">Summary data rendered from structured objects.</div>
        )}
      </div>
    </div>
  );
}
