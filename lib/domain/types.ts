/**
 * Structured Domain Objects
 *
 * These are the ONLY shapes Intelligence is allowed to consume.
 * No free-text summarization or page scraping — every answer must
 * be derived from one or more of these objects.
 */

// ─── Owner Identity ────────────────────────────────────────────
export interface OwnerIdentity {
  userId: string;
  displayName: string;
  role: "owner" | "professional";
  /** Whether identity has been independently verified */
  verificationStatus: "verified" | "claimed" | "unverified";
  /** 0-1 confidence that the user matches public records */
  matchConfidence: number;
  /** When the owner last opened the app */
  lastSeenAt: string;
  trustLevel: "new" | "established" | "verified";
}

// ─── Lease Summary ─────────────────────────────────────────────
export type OwnershipClarity = "clear" | "partial" | "unclear";

export interface LeaseSummary {
  mineralId: string;
  name: string;
  county: string;
  state: string;
  operator: string | null;
  status: "producing" | "permitted" | "inactive";
  ownershipClarity: OwnershipClarity;
  nri: number | null;
  acreage: number | null;
  legalDescription: string | null;
  apiNumber: string | null;
  linkedWellIds: string[];
}

// ─── Production Series ─────────────────────────────────────────
export interface ProductionPoint {
  date: string; // YYYY-MM
  oil: number;  // BBL
  gas: number;  // MCF
  water: number; // BBL
  daysOnline: number;
}

export type ProductionTrend = "declining" | "stable" | "increasing";

export interface ProductionSeriesDomain {
  wellId: string;
  wellName: string;
  operator: string;
  points: ProductionPoint[];
  /** Structured trend summary — not free text */
  trendSummary: {
    trend: ProductionTrend;
    percentChange6mo: number;
    currentMonthlyOil: number;
    currentMonthlyGas: number;
    isWithinNormalRange: boolean;
    regionalComparison: "above" | "average" | "below";
  };
}

// ─── Decline Fit ───────────────────────────────────────────────
export type DeclineModel = "hyperbolic" | "exponential";
export type FitQuality = "strong" | "moderate" | "weak";

export interface DeclineFit {
  wellId: string;
  wellName: string;
  model: DeclineModel;
  /** R² of historical fit (0-1) */
  fitQuality: FitQuality;
  fitR2: number;
  initialDeclineRate: number; // %
  currentDeclineRate: number; // %
  projectedAssetLifeYears: number;
  /** Explicitly stated assumptions */
  assumptions: string[];
  /** Structured insight fields — not free text */
  interpretation: {
    isNormal: boolean;
    comparisonToRegion: "above" | "average" | "below";
  };
}

// ─── Activity Event ────────────────────────────────────────────
export type ActivityType =
  | "permit"
  | "completion"
  | "workover"
  | "spud"
  | "production_change"
  | "rig_move"
  | "frac";

export type Significance = "high" | "medium" | "low";

export interface ActivityEventDomain {
  id: string;
  type: ActivityType;
  title: string;
  date: string; // ISO
  relativeDate: string;
  distance: number; // miles
  distanceLabel: string;
  /** Entities this event could affect */
  entitiesAffected: {
    mineralId: string;
    mineralName: string;
    wellId?: string;
    wellName?: string;
  };
  operator: string;
  county: string;
  significance: Significance;
  coordinates: { lat: number; lng: number };
}

// ─── Report Index + Detail ─────────────────────────────────────
export type ReportType =
  | "rrc_filing"
  | "operator_report"
  | "production_report"
  | "division_order"
  | "pooling_order";

export type ReportStatus = "new" | "reviewed" | "requires_attention";

export interface ReportIndex {
  id: string;
  type: ReportType;
  title: string;
  filedDate: string;
  source: string;
  operator: string | undefined;
  county: string;
  status: ReportStatus;
  entitiesAffected: {
    mineralId?: string;
    mineralName?: string;
    wellId?: string;
    wellName?: string;
  };
}

export interface ReportDetail extends ReportIndex {
  /** Structured content — NOT free-form text summary */
  structuredContent: {
    keyFacts: string[];
    dataSourceUrl: string | null;
  };
}

// ─── Intelligence Snapshot ─────────────────────────────────────
/**
 * The complete structured snapshot that Intelligence reads.
 * Every answer MUST be composed from fields in this object.
 * No free-text scraping, no page DOM access, no LLM hallucination.
 */
export interface IntelligenceSnapshot {
  owner: OwnerIdentity;
  leases: LeaseSummary[];
  productionSeries: ProductionSeriesDomain[];
  declineFits: DeclineFit[];
  recentActivity: ActivityEventDomain[];
  reports: ReportIndex[];
  /** Current entity the user is looking at */
  focusedEntity: {
    type: "mineral" | "well" | "report";
    id: string;
    name: string;
  } | null;
}
