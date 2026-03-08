/**
 * Data Service Layer
 * 
 * This module provides a centralized data access layer for the MineralView application.
 * Currently uses mock data, but designed to be swappable with Supabase implementation.
 * 
 * All components should fetch data ONLY through this layer.
 */

import { supabase } from "@/integrations/supabase/client";

import {
  mockMinerals,
  mockWells,
  mockProductionSeries,
  mockDeclineSummaries,
  mockActivityFeed,
  mockReports,
  mockReportDetails,
  mockUserProfile,
  mockMapFeatures,
  filterFeaturesByBounds,
  simulateStatementUpload,
  type MineralInterest,
  type Well,
  type ProductionSeries,
  type DeclineSummary,
  type ActivityEvent,
  type Report,
  type ReportDetail,
  type UserProfile,
  type MapFeature,
  type MapBounds,
  type ParsedStatement,
} from "./mock";

// Simulate network delay for realistic UX
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// USER PROFILE
// ==========================================

export async function getUserProfile(): Promise<UserProfile> {
  await delay(200);
  return mockUserProfile;
}

export async function updateUserPreferences(
  preferences: Partial<UserProfile["preferences"]>
): Promise<UserProfile> {
  await delay(300);
  // In production, this would update the database
  return {
    ...mockUserProfile,
    preferences: { ...mockUserProfile.preferences, ...preferences },
  };
}

// ==========================================
// MINERALS / INTERESTS
// ==========================================

export async function getMyMinerals(): Promise<MineralInterest[]> {
  await delay(400);
  return mockMinerals;
}

export async function getMineralById(id: string): Promise<MineralInterest | null> {
  await delay(300);
  return mockMinerals.find((m) => m.id === id) || null;
}

export async function getMineralWithWells(id: string): Promise<{
  mineral: MineralInterest;
  wells: Well[];
} | null> {
  await delay(400);
  const mineral = mockMinerals.find((m) => m.id === id);
  if (!mineral) return null;

  const wells = mockWells.filter((w) => mineral.linkedWellIds.includes(w.id));
  return { mineral, wells };
}

export async function updateMineralSettings(
  id: string,
  settings: Partial<Pick<MineralInterest, "alertRadius" | "emailAlerts" | "pushAlerts">>
): Promise<MineralInterest | null> {
  await delay(300);
  const mineral = mockMinerals.find((m) => m.id === id);
  if (!mineral) return null;
  return { ...mineral, ...settings };
}

// ==========================================
// WELLS
// ==========================================

export async function getWellById(id: string): Promise<Well | null> {
  await delay(300);
  return mockWells.find((w) => w.id === id) || null;
}

export async function getWellsByMineralId(mineralId: string): Promise<Well[]> {
  await delay(300);
  return mockWells.filter((w) => w.linkedMineralIds.includes(mineralId));
}

export async function searchWells(query: string): Promise<Well[]> {
  await delay(400);
  const q = query.toLowerCase();
  return mockWells.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.apiNumber.toLowerCase().includes(q) ||
      w.operator.toLowerCase().includes(q) ||
      w.county.toLowerCase().includes(q)
  );
}

/**
 * Get a plain-English summary of a well's status and what it means
 */
export async function getWellSummary(wellId: string): Promise<{
  wellId: string;
  wellName: string;
  whatItIs: string;
  whatItsDoing: string;
  isThisNormal: string;
  whatHappensNext: string;
} | null> {
  await delay(300);
  const well = mockWells.find((w) => w.id === wellId);
  if (!well) return null;

  const decline = mockDeclineSummaries.find((d) => d.wellId === wellId);

  // Generate contextual summaries based on well data
  const whatItIs = well.wellType === "horizontal"
    ? `This is a horizontal ${well.formation} well in ${well.county}, drilled and completed ${well.completionDate ? `in ${new Date(well.completionDate).getFullYear()}` : "recently"}.`
    : `This is a vertical well in ${well.county} targeting the ${well.formation} formation.`;

  const whatItsDoing = well.status === "producing" && well.currentProduction
    ? `The well is currently producing at ${well.currentProduction.oil} BBL/day oil and ${well.currentProduction.gas} MCF/day gas. ${decline ? decline.insight : "Production is within expected ranges."}`
    : well.status === "permitted"
    ? "This well is permitted but not yet drilled. The operator has received approval to drill."
    : well.status === "drilling"
    ? "Drilling is currently in progress on this well."
    : "The well is currently inactive.";

  const isThisNormal = decline
    ? decline.isWithinNormalRange
      ? "Yes. The current production behavior is within typical ranges for wells of this type and age."
      : "There may be some deviation from expected patterns. Consider reviewing the production details."
    : "Unable to assess without production history.";

  const whatHappensNext = well.status === "producing"
    ? "Production typically continues at gradually declining rates. We'll alert you if anything unusual occurs."
    : well.status === "permitted"
    ? "Drilling could begin within the next 30-90 days. We'll notify you when the rig arrives."
    : well.status === "drilling"
    ? "Once drilling is complete, the well will be prepared for completion. First production typically follows 30-60 days after completion."
    : "No significant changes expected.";

  return {
    wellId,
    wellName: well.name,
    whatItIs,
    whatItsDoing,
    isThisNormal,
    whatHappensNext,
  };
}

// ==========================================
// PRODUCTION
// ==========================================

export async function getProductionSeries(wellId: string): Promise<ProductionSeries | null> {
  await delay(400);
  return mockProductionSeries.find((p) => p.wellId === wellId) || null;
}

export async function getAllProductionSeries(): Promise<ProductionSeries[]> {
  await delay(500);
  return mockProductionSeries;
}

export async function getDeclineSummary(wellId: string): Promise<DeclineSummary | null> {
  await delay(300);
  return mockDeclineSummaries.find((d) => d.wellId === wellId) || null;
}

export async function getAllDeclineSummaries(): Promise<DeclineSummary[]> {
  await delay(400);
  return mockDeclineSummaries;
}

// ==========================================
// ACTIVITY
// ==========================================

export interface ActivityFilters {
  timeRangeDays?: 30 | 90 | 180;
  eventTypes?: ActivityEvent["type"][];
  mineralId?: string;
  significance?: ActivityEvent["significance"][];
}

export async function getActivityFeed(filters?: ActivityFilters): Promise<ActivityEvent[]> {
  await delay(400);
  let events = [...mockActivityFeed];

  if (filters?.mineralId) {
    events = events.filter((e) => e.relatedMineralId === filters.mineralId);
  }

  if (filters?.eventTypes && filters.eventTypes.length > 0) {
    events = events.filter((e) => filters.eventTypes!.includes(e.type));
  }

  if (filters?.significance && filters.significance.length > 0) {
    events = events.filter((e) => filters.significance!.includes(e.significance));
  }

  // Sort by date (most recent first)
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return events;
}

export async function getRecentActivityForMineral(mineralId: string): Promise<ActivityEvent[]> {
  await delay(300);
  return mockActivityFeed
    .filter((e) => e.relatedMineralId === mineralId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
}

// ==========================================
// REPORTS & FILINGS
// ==========================================

export async function getReportsIndex(): Promise<Report[]> {
  await delay(400);
  return mockReports.sort(
    (a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime()
  );
}

export async function getReportDetail(reportId: string): Promise<ReportDetail | null> {
  await delay(400);
  const detail = mockReportDetails.find((r) => r.id === reportId);
  if (detail) return detail;

  // For reports without full details, return the basic report with minimal content
  const basic = mockReports.find((r) => r.id === reportId);
  if (basic) {
    return {
      ...basic,
      fullContent: basic.summary || "Full content not available.",
    };
  }

  return null;
}

export async function getReportsForMineral(mineralId: string): Promise<Report[]> {
  await delay(300);
  return mockReports
    .filter((r) => r.relatedMineralId === mineralId)
    .sort((a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime());
}

// ==========================================
// MAP
// ==========================================

export interface MapFilters {
  showWells?: boolean;
  showPermits?: boolean;
  showUserInterests?: boolean;
  wellStatus?: Well["status"][];
  timeRangeDays?: 30 | 90 | 180;
}

export async function getMapFeatures(
  bounds?: MapBounds,
  filters?: MapFilters
): Promise<MapFeature[]> {
  await delay(300);
  
  let features = bounds
    ? filterFeaturesByBounds(mockMapFeatures, bounds)
    : mockMapFeatures;

  if (filters) {
    if (filters.showWells === false) {
      features = features.filter((f) => f.type !== "well");
    }
    if (filters.showPermits === false) {
      features = features.filter((f) => f.type !== "permit");
    }
    if (filters.showUserInterests === false) {
      features = features.filter((f) => f.type !== "interest");
    }
    if (filters.wellStatus && filters.wellStatus.length > 0) {
      features = features.filter(
        (f) => f.type === "interest" || filters.wellStatus!.includes(f.properties.status as Well["status"])
      );
    }
  }

  return features;
}

// ==========================================
// STATEMENT UPLOAD
// ==========================================

export async function uploadStatement(file: File): Promise<ParsedStatement> {
  // Simulate file upload and parsing
  return simulateStatementUpload(file.name);
}

// ==========================================
// INTELLIGENCE CONTEXT
// ==========================================

/**
 * Get contextual data for MineralView Intelligence to answer questions.
 * This aggregates relevant data based on the current context.
 */
export interface IntelligenceContext {
  profile: UserProfile;
  minerals: MineralInterest[];
  recentActivity: ActivityEvent[];
  productionAlerts: {
    wellId: string;
    wellName: string;
    message: string;
    severity: "info" | "warning" | "alert";
  }[];
  unreadReports: Report[];
  currentEntityContext?: {
    type: "mineral" | "well" | "report";
    id: string;
    name: string;
  };
}

export async function getIntelligenceContext(
  currentEntityId?: string,
  currentEntityType?: "mineral" | "well" | "report"
): Promise<IntelligenceContext> {
  await delay(300);

  const profile = mockUserProfile;
  const minerals = mockMinerals;
  const recentActivity = mockActivityFeed
    .filter((e) => e.significance === "high" || e.significance === "medium")
    .slice(0, 5);
  
  const productionAlerts = mockDeclineSummaries
    .filter((d) => !d.isWithinNormalRange || d.percentChange < -10)
    .map((d) => ({
      wellId: d.wellId,
      wellName: d.wellName,
      message: d.insight,
      severity: "info" as const,
    }));

  const unreadReports = mockReports.filter((r) => r.status === "new" || r.status === "requires_attention");

  let currentEntityContext: IntelligenceContext["currentEntityContext"];
  if (currentEntityId && currentEntityType) {
    if (currentEntityType === "mineral") {
      const mineral = minerals.find((m) => m.id === currentEntityId);
      if (mineral) {
        currentEntityContext = { type: "mineral", id: mineral.id, name: mineral.name };
      }
    } else if (currentEntityType === "well") {
      const well = mockWells.find((w) => w.id === currentEntityId);
      if (well) {
        currentEntityContext = { type: "well", id: well.id, name: well.name };
      }
    } else if (currentEntityType === "report") {
      const report = mockReports.find((r) => r.id === currentEntityId);
      if (report) {
        currentEntityContext = { type: "report", id: report.id, name: report.title };
      }
    }
  }

  return {
    profile,
    minerals,
    recentActivity,
    productionAlerts,
    unreadReports,
    currentEntityContext,
  };
}

/**
 * Get a status summary for the welcome/home screen
 */
export async function getStatusSummary(): Promise<{
  totalInterests: number;
  activeAlerts: number;
  recentActivity: number;
  lastChecked: string;
  statusMessage: string;
}> {
  await delay(200);
  
  const highPriorityEvents = mockActivityFeed.filter((e) => e.significance === "high").length;
  
  return {
    totalInterests: mockMinerals.length,
    activeAlerts: highPriorityEvents,
    recentActivity: mockActivityFeed.length,
    lastChecked: mockUserProfile.stats.lastChecked,
    statusMessage: highPriorityEvents > 0
      ? `${highPriorityEvents} item${highPriorityEvents > 1 ? "s" : ""} may need your attention`
      : "No unusual activity detected recently",
  };
}

// Re-export types for convenience
// ==========================================
// SESSION CONTEXT (Supabase-backed)
// ==========================================

export interface SessionContext {
  active_entity_id: string | null;
  active_entity_type: string | null;
  active_view: string;
}

export async function getSessionContext(): Promise<SessionContext | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("session_context")
    .select("active_entity_id, active_entity_type, active_view")
    .eq("user_id", user.id)
    .single();

  return data as SessionContext | null;
}

export async function updateSessionContext(
  updates: Partial<SessionContext>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("session_context")
    .update({ ...updates })
    .eq("user_id", user.id);
}

// ==========================================
// OWNER PROFILE (Supabase-backed)
// ==========================================

export async function touchOwnerLastSeen(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("owner_profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("user_id", user.id);
}

// ==========================================
// WATCHED ENTITIES (Supabase-backed)
// ==========================================

export interface WatchedEntity {
  id: string;
  entity_id: string;
  entity_type: string;
  created_at: string;
}

export async function getWatchedEntities(): Promise<WatchedEntity[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("watched_entities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as WatchedEntity[]) || [];
}

export async function watchEntity(entityId: string, entityType: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("watched_entities")
    .upsert(
      { user_id: user.id, entity_id: entityId, entity_type: entityType },
      { onConflict: "user_id,entity_id,entity_type" }
    );
}

export async function unwatchEntity(entityId: string, entityType: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("watched_entities")
    .delete()
    .eq("user_id", user.id)
    .eq("entity_id", entityId)
    .eq("entity_type", entityType);
}

export type {
  MineralInterest,
  Well,
  ProductionSeries,
  DeclineSummary,
  ActivityEvent,
  Report,
  ReportDetail,
  UserProfile,
  MapFeature,
  MapBounds,
  ParsedStatement,
};
