"use client";

import { useState, useCallback, useMemo } from "react";
import {
  User,
  FileText,
  Download,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { mockMinerals } from "@/lib/mock";
import { TravelingIntelligence } from "@/components/TravelingIntelligence";

// ── Mock owner data ────────────────────────────────────────────────────────
interface Owner {
  id: string;
  name: string;
  role: "primary" | "managed";
  interestCount: number;
  verificationStatus: "verified" | "claimed" | "unverified";
  lastSeen: string;
  hasAlert: boolean;
}

const mockOwners: Owner[] = [
  {
    id: "o-1",
    name: "Johnson Family Trust",
    role: "primary",
    interestCount: 2,
    verificationStatus: "verified",
    lastSeen: "Today",
    hasAlert: false,
  },
  {
    id: "o-2",
    name: "Sarah Mitchell",
    role: "managed",
    interestCount: 1,
    verificationStatus: "claimed",
    lastSeen: "3 days ago",
    hasAlert: true,
  },
  {
    id: "o-3",
    name: "Davis Estate",
    role: "managed",
    interestCount: 1,
    verificationStatus: "unverified",
    lastSeen: "1 week ago",
    hasAlert: false,
  },
];

// ── Mock interests with EUR/acre + MVestimate ──────────────────────────────
interface OwnerInterest {
  id: string;
  ownerId: string;
  name: string;
  status: "producing" | "permitted" | "inactive";
  operator: string | null;
  county: string;
  acres: number;
  nri: number;
  eurAcre: number; // BOE/acre
  mvEstimate: number; // $ NPV
  alert: string | null;
}

const mockInterests: OwnerInterest[] = [
  {
    id: "i-1",
    ownerId: "o-1",
    name: "Johnson Family Trust",
    status: "producing",
    operator: "Pioneer Natural Resources",
    county: "Midland County",
    acres: 160,
    nri: 0.03125,
    eurAcre: 48.2,
    mvEstimate: 284000,
    alert: null,
  },
  {
    id: "i-2",
    ownerId: "o-1",
    name: "Section 15 Block A",
    status: "producing",
    operator: "Diamondback Energy",
    county: "Howard County",
    acres: 80,
    nri: 0.025,
    eurAcre: 42.7,
    mvEstimate: 156000,
    alert: null,
  },
  {
    id: "i-3",
    ownerId: "o-2",
    name: "Inherited Lease - Reeves",
    status: "permitted",
    operator: null,
    county: "Reeves County",
    acres: 320,
    nri: 0.0208,
    eurAcre: 35.1,
    mvEstimate: 198000,
    alert: "Permit filed in adjacent section",
  },
  {
    id: "i-4",
    ownerId: "o-3",
    name: "Davis Ranch Block 8",
    status: "inactive",
    operator: "Devon Energy",
    county: "Martin County",
    acres: 240,
    nri: 0.0208,
    eurAcre: 39.6,
    mvEstimate: 112000,
    alert: null,
  },
];

// ── Style maps ─────────────────────────────────────────────────────────────
const VERIFICATION_DOT: Record<Owner["verificationStatus"], string> = {
  verified: "bg-success",
  claimed: "bg-warning",
  unverified: "bg-muted-foreground/40",
};

const VERIFICATION_BADGE: Record<Owner["verificationStatus"], string> = {
  verified: "bg-success/15 text-success",
  claimed: "bg-warning/15 text-warning",
  unverified: "bg-muted text-muted-foreground",
};

const STATUS_BADGE: Record<OwnerInterest["status"], string> = {
  producing: "bg-success/15 text-success",
  permitted: "bg-warning/15 text-warning",
  inactive: "bg-muted text-muted-foreground",
};

// ── Sort helpers ───────────────────────────────────────────────────────────
type SortKey = "name" | "acres" | "eurAcre" | "mvEstimate";

function formatMV(v: number): string {
  return v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(2)}M`
    : `$${(v / 1_000).toFixed(0)}k`;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AdvancedOwnersPage() {
  const [selectedOwnerId, setSelectedOwnerId] = useState("o-1");
  const [sortKey, setSortKey] = useState<SortKey>("mvEstimate");
  const [sortAsc, setSortAsc] = useState(false);

  const openIntelligence = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-intelligence"));
  }, []);

  const selectedOwner = mockOwners.find((o) => o.id === selectedOwnerId)!;
  const alertCount = mockOwners.filter((o) => o.hasAlert).length;

  const interests = useMemo(() => {
    const filtered = mockInterests.filter((i) => i.ownerId === selectedOwnerId);
    return [...filtered].sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.name.localeCompare(b.name);
      else if (sortKey === "acres") diff = a.acres - b.acres;
      else if (sortKey === "eurAcre") diff = a.eurAcre - b.eurAcre;
      else diff = a.mvEstimate - b.mvEstimate;
      return sortAsc ? diff : -diff;
    });
  }, [selectedOwnerId, sortKey, sortAsc]);

  const totalNPV = interests.reduce((s, i) => s + i.mvEstimate, 0);
  const activeWells = interests.filter((i) => i.status === "producing").length;
  const alerts = interests.filter((i) => i.alert).length;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortAsc
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] md:min-h-screen animate-fade-in">
      {/* ── Topbar ── */}
      <div className="px-4 pt-5 pb-3 md:px-8 border-b border-border/60 flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-medium text-foreground">Owner Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockOwners.length} clients &middot; {mockInterests.length} total interests
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Generate PDF
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">
          <FileText className="w-3.5 h-3.5" />
          Owner Report
        </button>
      </div>

      {/* ── 3-column split layout ── */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">

        {/* ── Column 1: Client list (192px) ── */}
        <div className="md:w-48 flex-shrink-0 border-b md:border-b-0 md:border-r border-border/60">
          <div className="p-3 border-b border-border/40">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Owner clients
            </p>
            {alertCount > 0 && (
              <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-warning/10 text-warning text-2xs">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {alertCount} client{alertCount !== 1 ? "s" : ""} with recent activity
              </div>
            )}
          </div>
          <div className="overflow-y-auto">
            {mockOwners.map((owner) => {
              const isActive = owner.id === selectedOwnerId;
              return (
                <button
                  key={owner.id}
                  onClick={() => setSelectedOwnerId(owner.id)}
                  className={`w-full text-left px-3 py-3 flex items-center gap-2.5 border-b border-border/30 transition-colors ${
                    isActive ? "bg-primary/8" : "hover:bg-secondary/50"
                  }`}
                >
                  {/* Verification dot */}
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${VERIFICATION_DOT[owner.verificationStatus]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        isActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {owner.name}
                    </p>
                    <p className="text-2xs text-muted-foreground">
                      {owner.interestCount} interest{owner.interestCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {owner.hasAlert && (
                    <AlertCircle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Column 2+3: Detail pane ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {/* Detail header */}
          <div className="px-4 pt-4 pb-3 md:px-6 border-b border-border/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{selectedOwner.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`status-badge text-2xs ${VERIFICATION_BADGE[selectedOwner.verificationStatus]}`}>
                  {selectedOwner.verificationStatus}
                </span>
                <span className="text-2xs text-muted-foreground">
                  Last seen {selectedOwner.lastSeen}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 pt-4 md:px-6 space-y-4 pb-8">
            {/* TravelingIntelligence — client-contextual, updates on selection */}
            <TravelingIntelligence
              subPage="owners"
              entityLabel={`Owner: ${selectedOwner.name}`}
              onOpenIntelligence={openIntelligence}
            />

            {/* KPI strip — 4 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Interests", value: String(interests.length) },
                { label: "Portfolio NPV", value: formatMV(totalNPV) },
                { label: "Active Wells", value: String(activeWells) },
                {
                  label: "Alerts",
                  value: String(alerts),
                  highlight: alerts > 0,
                },
              ].map((kpi) => (
                <div key={kpi.label} className="calm-card !p-3 text-center">
                  <p
                    className={`text-lg font-semibold ${
                      kpi.highlight ? "text-warning" : "text-foreground"
                    }`}
                  >
                    {kpi.value}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Interests table */}
            <div className="calm-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/30">
                      {(
                        [
                          { key: "name" as SortKey, label: "Interest", minW: "min-w-[140px]" },
                          { key: null, label: "Status", minW: "min-w-[80px]" },
                          { key: null, label: "Operator", minW: "min-w-[120px]" },
                          { key: "acres" as SortKey, label: "Acres", minW: "min-w-[60px]" },
                          { key: null, label: "NRI", minW: "min-w-[60px]" },
                          { key: "eurAcre" as SortKey, label: "EUR/acre", minW: "min-w-[80px]" },
                          { key: "mvEstimate" as SortKey, label: "MVestimate", minW: "min-w-[90px]" },
                          { key: null, label: "Alert", minW: "min-w-[80px]" },
                        ] as { key: SortKey | null; label: string; minW: string }[]
                      ).map((col) => (
                        <th
                          key={col.label}
                          className={`px-3 py-2.5 text-left font-medium text-muted-foreground ${col.minW} ${
                            col.key ? "cursor-pointer select-none hover:text-foreground" : ""
                          }`}
                          onClick={col.key ? () => toggleSort(col.key!) : undefined}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {col.key && <SortIcon k={col.key} />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {interests.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`border-b border-border/30 ${
                          idx % 2 === 0 ? "" : "bg-secondary/10"
                        }`}
                      >
                        <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap">
                          {row.name}
                          <div className="text-2xs text-muted-foreground font-normal">{row.county}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`status-badge text-2xs ${STATUS_BADGE[row.status]}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                          {row.operator ?? <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="px-3 py-3 text-foreground">{row.acres}</td>
                        <td className="px-3 py-3 text-foreground">
                          {(row.nri * 100).toFixed(4)}%
                        </td>
                        <td className="px-3 py-3 text-foreground font-medium">
                          {row.eurAcre} BOE
                          {/* Sparkline placeholder */}
                          <div className="h-1.5 w-16 mt-1 rounded-full bg-primary/20 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/60"
                              style={{ width: `${(row.eurAcre / 60) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3 font-semibold text-foreground">
                          {formatMV(row.mvEstimate)}
                        </td>
                        <td className="px-3 py-3">
                          {row.alert ? (
                            <div className="flex items-center gap-1 text-warning">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-2xs leading-tight">{row.alert}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-2xs text-muted-foreground text-center">
              MineralView does not verify legal ownership. &middot; Informational only &middot; Not legal, tax, or investment advice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
