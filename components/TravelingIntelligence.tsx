"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles, ChevronRight, AlertCircle } from "lucide-react";
import { getSnapshot, composeExplainPage } from "@/lib/domain";
import type { IntelligenceResponse } from "@/lib/domain/responseSchema";
import type { PageContext } from "@/hooks/useIntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";

interface TravelingIntelligenceProps {
  /** Which Explore sub-page is this rendered on */
  subPage: "explore" | "map" | "production" | "reports" | "activity";
  /** Callback to open the full Intelligence sheet */
  onOpenIntelligence?: () => void;
  className?: string;
}

const confidenceColors: Record<string, string> = {
  high: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  low: "bg-muted text-muted-foreground",
};

export function TravelingIntelligence({ subPage, onOpenIntelligence, className = "" }: TravelingIntelligenceProps) {
  const { user, profile } = useAuth();
  const [response, setResponse] = useState<IntelligenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pageContext = useMemo<PageContext>(() => ({
    label: subPage.charAt(0).toUpperCase() + subPage.slice(1),
    path: subPage === "explore" ? "/app/explore" : `/app/explore/${subPage}`,
    section: "explore" as const,
    subPage: subPage === "explore" ? undefined : subPage,
    timestamp: Date.now(),
  }), [subPage]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const snap = await getSnapshot(user?.id ?? "anon", (profile?.role as "owner" | "professional") ?? "owner");
        const result = composeExplainPage(pageContext, snap);
        if (!cancelled) setResponse(result);
      } catch (err) {
        console.error("TravelingIntelligence error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [pageContext]);

  if (isLoading) {
    return (
      <div className={`calm-card animate-pulse flex items-center gap-3 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!response) return null;

  const confStyle = confidenceColors[response.confidence.level] ?? confidenceColors.low;

  return (
    <div className={`calm-card ${className}`}>
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-xs font-medium text-primary">Intelligence Summary</span>
        <span className={`ml-auto status-badge text-2xs ${confStyle}`}>
          {response.confidence.level} confidence
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground leading-relaxed mb-1.5">
        {response.summary}
      </p>

      {/* What changed */}
      {response.whatChanged && (
        <div className="flex items-start gap-1.5 mb-2">
          <AlertCircle className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-warning leading-relaxed">{response.whatChanged}</p>
        </div>
      )}

      {/* Open full Intelligence */}
      {onOpenIntelligence && (
        <button
          onClick={onOpenIntelligence}
          className="action-link text-xs mt-1"
        >
          Open Full Intelligence
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
