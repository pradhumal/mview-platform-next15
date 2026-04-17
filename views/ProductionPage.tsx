"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingDown, TrendingUp, Minus, ChevronRight, Info } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { FollowUpPrompts, productionPrompts } from "@/components/FollowUpPrompts";
import { getAllDeclineSummaries, getProductionSeries, type DeclineSummary, type ProductionSeries } from "@/lib/dataService";
import { TravelingIntelligence } from "@/components/TravelingIntelligence";
import { Events } from "@/lib/eventTracker";

interface WellProductionData {
  summary: DeclineSummary;
  series: ProductionSeries | null;
}

const getTrendIcon = (trend: DeclineSummary["trend"]) => {
  switch (trend) {
    case "declining":
      return <TrendingDown className="w-4 h-4 text-info" />;
    case "stable":
      return <Minus className="w-4 h-4 text-muted-foreground" />;
    case "increasing":
      return <TrendingUp className="w-4 h-4 text-success" />;
  }
};

const getTrendColor = (trend: DeclineSummary["trend"]) => {
  switch (trend) {
    case "declining":
      return "hsl(var(--info))";
    case "stable":
      return "hsl(var(--muted-foreground))";
    case "increasing":
      return "hsl(var(--success))";
  }
};

const getTrendLabel = (trend: DeclineSummary["trend"], percent: number) => {
  switch (trend) {
    case "declining":
      return `${percent}% decline`;
    case "stable":
      return "Stable";
    case "increasing":
      return `+${percent}% increase`;
  }
};

export default function ProductionPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"6m" | "1y" | "all">("6m");
  const [isLoading, setIsLoading] = useState(true);
  const [wellData, setWellData] = useState<WellProductionData[]>([]);
  const openIntelligence = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-intelligence"));
  }, []);

  useEffect(() => {
    Events.productionView();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const summaries = await getAllDeclineSummaries();
        
        // Fetch production series for each well in parallel
        const dataWithSeries = await Promise.all(
          summaries.map(async (summary) => {
            const series = await getProductionSeries(summary.wellId);
            return { summary, series };
          })
        );
        
        setWellData(dataWithSeries);
      } catch (error) {
        console.error("Failed to fetch production data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
        <header className="mb-6">
          <Link
            href="/app/explore"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
          <h1 className="text-xl md:text-2xl text-foreground mb-1">Production</h1>
          <p className="text-sm text-muted-foreground">Loading production data...</p>
        </header>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="calm-card animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-16 bg-muted rounded mb-3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <Link
          href="/app/explore"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
        <h1 className="text-xl md:text-2xl text-foreground mb-1">Production</h1>
        <p className="text-sm text-muted-foreground">
          Monthly production history and trends — decline is normal. Intelligence can help interpret what you&apos;re seeing.
        </p>
      </header>

      {/* Intelligence Summary */}
      <TravelingIntelligence subPage="production" onOpenIntelligence={openIntelligence} className="mb-6" />

      {/* Period Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "6m", label: "6 months" },
          { value: "1y", label: "1 year" },
          { value: "all", label: "All time" },
        ].map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value as typeof selectedPeriod)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Context Note */}
      <div className="calm-card mb-6 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-info" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground mb-1">About production trends</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Production decline is normal for most wells. What matters is whether the decline rate
            is within expected ranges for the well&apos;s age and type.
          </p>
          <FollowUpPrompts prompts={productionPrompts} context="production-overview" />
        </div>
      </div>

      {/* Production Cards */}
      <div className="space-y-4">
        {wellData.map(({ summary, series }) => {
          const chartData = series?.data.map((d) => ({
            month: d.date.split("-")[1],
            oil: d.oil,
            gas: d.gas,
          })) || [];

          return (
            <Link
              key={summary.wellId}
              href={`/app/explore/minerals/${summary.wellId}`}
              className="calm-card block hover:border-primary/20 transition-colors"
            >
              {/* Well Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{summary.wellName}</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.projectedAssetLife} years projected asset life
                  </p>
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  {getTrendIcon(summary.trend)}
                  <span className="text-xs text-muted-foreground">
                    {getTrendLabel(summary.trend, Math.abs(summary.percentChange))}
                  </span>
                </div>
              </div>

              {/* Mini Chart */}
              {chartData.length > 0 && (
                <div className="h-16 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`gradient-${summary.wellId}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={getTrendColor(summary.trend)} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={getTrendColor(summary.trend)} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        interval={1}
                      />
                      <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number, name: string) => [
                          `${value.toLocaleString()} ${name === "oil" ? "BBL" : "MCF"}`,
                          name === "oil" ? "Oil" : "Gas",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="oil"
                        stroke={getTrendColor(summary.trend)}
                        strokeWidth={2}
                        fill={`url(#gradient-${summary.wellId})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Insight */}
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {summary.insight}
              </p>

              {/* Current Production */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Current monthly</p>
                  <p className="text-sm font-medium text-foreground">
                    {summary.currentMonthlyOil.toLocaleString()} BBL oil
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        Production data sourced from public filings. MineralView does not verify legal ownership.
      </p>
    </div>
  );
}
