"use client";

import { useState } from "react";
import { TrendingDown, Info } from "lucide-react";
import { mockDeclineSummaries, mockProductionSeries } from "@/lib/mock";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const FIT_QUALITY_STYLE = {
  strong: "bg-success/15 text-success",
  moderate: "bg-warning/15 text-warning",
  weak: "bg-destructive/15 text-destructive",
} as const;

export default function AdvancedDeclinePage() {
  const [selectedWell, setSelectedWell] = useState(mockDeclineSummaries[0]?.wellId ?? "");
  const summary = mockDeclineSummaries.find((d) => d.wellId === selectedWell);
  const series = mockProductionSeries.find((p) => p.wellId === selectedWell);

  // Build chart data with projection
  const chartData: { date: string; actual?: number; projected?: number }[] = series
    ? series.data.map((pt) => ({ date: pt.date, actual: pt.oil }))
    : [];

  // Append simple projection
  if (summary && chartData.length > 0) {
    const last = chartData[chartData.length - 1];
    let proj = last.actual;
    const monthlyDecline = (summary.currentDeclineRate / 100) / 12;
    for (let i = 1; i <= 6; i++) {
      const d = new Date(last.date + "-01");
      d.setMonth(d.getMonth() + i);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      proj = Math.round(proj * (1 - monthlyDecline));
      chartData.push({ date: label, actual: undefined as unknown as number, projected: proj });
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 animate-fade-in">
      <h1 className="text-xl font-medium text-foreground mb-1">Decline Workbench</h1>
      <p className="text-sm text-muted-foreground mb-6">Historical overlay, projections, and stated assumptions.</p>

      {/* Well selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {mockDeclineSummaries.map((d) => (
          <button
            key={d.wellId}
            onClick={() => setSelectedWell(d.wellId)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedWell === d.wellId ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {d.wellName}
          </button>
        ))}
      </div>

      {summary && (
        <>
          {/* Chart */}
          <div className="calm-card !p-3 mb-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 15% 88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="actual" stroke="hsl(150 25% 40%)" strokeWidth={2} dot={false} name="Actual (BBL)" />
                <Line type="monotone" dataKey="projected" stroke="hsl(150 25% 40%)" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Projected" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="calm-card !p-3">
              <p className="text-2xs text-muted-foreground">Model</p>
              <p className="text-sm font-medium text-foreground capitalize">{summary.declineType}</p>
            </div>
            <div className="calm-card !p-3">
              <p className="text-2xs text-muted-foreground">Fit Quality</p>
              <span className={`status-badge text-2xs mt-1 ${FIT_QUALITY_STYLE[summary.isWithinNormalRange ? "strong" : "weak"]}`}>
                {summary.isWithinNormalRange ? "Strong" : "Weak"}
              </span>
            </div>
            <div className="calm-card !p-3">
              <p className="text-2xs text-muted-foreground">Current Decline</p>
              <p className="text-sm font-medium text-foreground">{summary.currentDeclineRate}%/yr</p>
            </div>
            <div className="calm-card !p-3">
              <p className="text-2xs text-muted-foreground">Projected Life</p>
              <p className="text-sm font-medium text-foreground">~{summary.projectedAssetLife} yrs</p>
            </div>
            <div className="calm-card !p-3">
              <p className="text-2xs text-muted-foreground">6-mo Change</p>
              <p className={`text-sm font-medium ${summary.percentChange < 0 ? "text-destructive" : "text-success"}`}>
                {summary.percentChange}%
              </p>
            </div>
            <div className="calm-card !p-3">
              <p className="text-2xs text-muted-foreground">vs. Region</p>
              <p className="text-sm font-medium text-foreground capitalize">{summary.regionalComparison}</p>
            </div>
          </div>

          {/* Assumptions */}
          <div className="calm-card !p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Assumptions</p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>ΓÇó Decline curve fitted using {summary.declineType} model</li>
              <li>ΓÇó Initial decline rate: {summary.initialDeclineRate}%</li>
              <li>ΓÇó Standard operating conditions assumed</li>
              <li>ΓÇó No workover or restimulation factored in</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
