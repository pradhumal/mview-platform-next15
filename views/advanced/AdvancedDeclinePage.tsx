"use client";

import { useState, useCallback } from "react";
import { Info, BarChart2, MapPin, User } from "lucide-react";
import { mockDeclineSummaries, mockProductionSeries, mockMinerals, mockWells } from "@/lib/mock";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TravelingIntelligence } from "@/components/TravelingIntelligence";

const FIT_QUALITY_STYLE = {
  strong: "bg-success/15 text-success",
  moderate: "bg-warning/15 text-warning",
  weak: "bg-destructive/15 text-destructive",
} as const;

// EUR/acre mock spatial data (county-level bars)
const EUR_SPATIAL = [
  { county: "Midland", eurAcre: 48.2 },
  { county: "Howard", eurAcre: 42.7 },
  { county: "Reeves", eurAcre: 35.1 },
  { county: "Martin", eurAcre: 39.6 },
];

function calcNPV(summary: (typeof mockDeclineSummaries)[0]): number {
  const oilPriceBbl = 72;
  const monthlyRevenue = summary.currentMonthlyOil * oilPriceBbl;
  const discountRate = 0.1 / 12;
  const months = summary.projectedAssetLife * 12;
  let npv = 0;
  let rev = monthlyRevenue;
  for (let i = 0; i < months; i++) {
    npv += rev / Math.pow(1 + discountRate, i + 1);
    rev *= 1 - (summary.currentDeclineRate / 100) / 12;
  }
  return Math.round(npv / 1000) * 1000;
}

export default function AdvancedDeclinePage() {
  const [selectedWell, setSelectedWell] = useState(mockDeclineSummaries[0]?.wellId ?? "");

  const openIntelligence = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-intelligence"));
  }, []);

  const summary = mockDeclineSummaries.find((d) => d.wellId === selectedWell);
  const series = mockProductionSeries.find((p) => p.wellId === selectedWell);
  const well = mockWells.find((w) => w.id === selectedWell);
  const linkedMineral = well
    ? mockMinerals.find((m) => well.linkedMineralIds.includes(m.id))
    : null;

  // Build chart data with 6-month projection
  const chartData: { date: string; actual?: number; projected?: number }[] = series
    ? series.data.map((pt) => ({ date: pt.date, actual: pt.oil }))
    : [];

  if (summary && chartData.length > 0) {
    const last = chartData[chartData.length - 1];
    let proj = last.actual ?? 0;
    const monthlyDecline = (summary.currentDeclineRate / 100) / 12;
    for (let i = 1; i <= 6; i++) {
      const d = new Date(last.date + "-01");
      d.setMonth(d.getMonth() + i);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      proj = Math.round(proj * (1 - monthlyDecline));
      chartData.push({ date: label, projected: proj });
    }
  }

  const npv = summary ? calcNPV(summary) : 0;
  const wellCountyShort = well?.county.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] md:min-h-screen animate-fade-in">
      {/* Page header */}
      <div className="px-4 pt-5 pb-3 md:px-8 border-b border-border/60">
        <h1 className="text-xl font-medium text-foreground">Decline Workbench</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Historical overlay, projections, and stated assumptions.
        </p>
      </div>

      {/* TravelingIntelligence strip — entity-aware, updates with well tab */}
      <div className="px-4 pt-4 md:px-8">
        <TravelingIntelligence
          subPage="decline"
          entityLabel={summary ? `Decline: ${summary.wellName}` : "Decline Workbench"}
          onOpenIntelligence={openIntelligence}
          className="mb-4"
        />
      </div>

      {/* Well tabs */}
      <div className="px-4 md:px-8 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mockDeclineSummaries.map((d) => (
            <button
              key={d.wellId}
              onClick={() => setSelectedWell(d.wellId)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedWell === d.wellId
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {d.wellName}
            </button>
          ))}
        </div>
      </div>

      {/* Split layout: main + right panel */}
      {summary && (
        <div className="flex flex-col lg:flex-row gap-4 px-4 pb-8 md:px-8 flex-1">
          {/* ── Left: main workbench ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Production chart + projection */}
            <div className="calm-card !p-4">
              <p className="text-xs font-medium text-foreground mb-3">
                Production &amp; Projection (BBL/mo)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 15% 88%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    width={44}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                    }
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(v: number) => [v.toLocaleString(), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(150 25% 40%)"
                    strokeWidth={2}
                    dot={false}
                    name="Actual (BBL)"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="hsl(150 25% 40%)"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={false}
                    name="Projected"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 6-cell stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                {
                  label: "Model",
                  value: <span className="capitalize">{summary.declineType}</span>,
                },
                {
                  label: "Fit Quality",
                  value: (
                    <span
                      className={`status-badge text-2xs ${
                        FIT_QUALITY_STYLE[summary.isWithinNormalRange ? "strong" : "weak"]
                      }`}
                    >
                      {summary.isWithinNormalRange ? "Strong" : "Weak"}
                    </span>
                  ),
                },
                {
                  label: "Current Decline",
                  value: `${summary.currentDeclineRate}%/yr`,
                },
                {
                  label: "Projected Life",
                  value: `~${summary.projectedAssetLife} yrs`,
                },
                {
                  label: "6-mo Change",
                  value: (
                    <span
                      className={
                        summary.percentChange < 0 ? "text-destructive" : "text-success"
                      }
                    >
                      {summary.percentChange}%
                    </span>
                  ),
                },
                {
                  label: "vs. Region",
                  value: <span className="capitalize">{summary.regionalComparison}</span>,
                },
              ].map((cell) => (
                <div key={cell.label} className="calm-card !p-3">
                  <p className="text-2xs text-muted-foreground mb-1">{cell.label}</p>
                  <p className="text-sm font-medium text-foreground">{cell.value}</p>
                </div>
              ))}
            </div>

            {/* Assumptions card */}
            <div className="calm-card !p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Stated Assumptions</p>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>- Decline curve fitted using {summary.declineType} model</li>
                <li>- Initial decline rate: {summary.initialDeclineRate}%/yr</li>
                <li>- Oil price assumption: $72/BBL (current strip)</li>
                <li>- Standard operating conditions assumed</li>
                <li>- No workover or restimulation factored in</li>
              </ul>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
            {/* MVestimate NPV */}
            <div className="calm-card !p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <BarChart2 className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-medium text-foreground">MVestimate&#8482; NPV</p>
                <span className="ml-auto status-badge text-2xs bg-primary/10 text-primary">
                  deterministic
                </span>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                ${(npv / 1_000_000).toFixed(2)}M
              </p>
              <p className="text-2xs text-muted-foreground mt-0.5">
                10% discount rate &middot; {summary.projectedAssetLife}-yr horizon &middot; $72/BBL strip
              </p>
              <p className="text-2xs text-muted-foreground mt-3">
                Informational only &middot; Not investment advice
              </p>
            </div>

            {/* EUR/acre spatial bars */}
            <div className="calm-card !p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">EUR/Acre by County</p>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={EUR_SPATIAL}
                  layout="vertical"
                  margin={{ left: 0, right: 4, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 9 }} domain={[0, 60]} unit=" BOE" />
                  <YAxis type="category" dataKey="county" tick={{ fontSize: 10 }} width={46} />
                  <Tooltip
                    contentStyle={{ fontSize: 11 }}
                    formatter={(v: number) => [`${v} BOE/acre`, "EUR"]}
                  />
                  <Bar dataKey="eurAcre" radius={[0, 4, 4, 0]}>
                    {EUR_SPATIAL.map((entry) => (
                      <Cell
                        key={entry.county}
                        fill={
                          entry.county === wellCountyShort
                            ? "hsl(150 25% 40%)"
                            : "hsl(35 20% 82%)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Owner context */}
            {linkedMineral && (
              <div className="calm-card !p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-foreground">Owner Context</p>
                </div>
                <p className="text-sm font-medium text-foreground">{linkedMineral.name}</p>
                <p className="text-2xs text-muted-foreground mt-0.5">
                  {linkedMineral.county}, {linkedMineral.state}
                </p>
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-2xs">
                    <span className="text-muted-foreground">NRI</span>
                    <span className="text-foreground font-medium">
                      {linkedMineral.nri
                        ? `${(linkedMineral.nri * 100).toFixed(4)}%`
                        : "\u2014"}
                    </span>
                  </div>
                  <div className="flex justify-between text-2xs">
                    <span className="text-muted-foreground">Acreage</span>
                    <span className="text-foreground font-medium">
                      {linkedMineral.acreage ?? "\u2014"} ac
                    </span>
                  </div>
                  <div className="flex justify-between text-2xs">
                    <span className="text-muted-foreground">Operator</span>
                    <span className="text-foreground font-medium truncate max-w-[140px]">
                      {linkedMineral.operator ?? "\u2014"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
