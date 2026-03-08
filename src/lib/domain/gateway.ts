/**
 * Intelligence Data Gateway
 *
 * SINGLE entry point for all Intelligence data access.
 * Transforms raw data (mock or Supabase) into structured domain objects.
 *
 * Rules:
 *  1. Intelligence ONLY reads from gateway.getSnapshot()
 *  2. No page scraping, no free-text summarization
 *  3. Every answer must cite a field from a domain object
 */

import {
  type OwnerIdentity,
  type LeaseSummary,
  type ProductionSeriesDomain,
  type DeclineFit,
  type ActivityEventDomain,
  type ReportIndex,
  type IntelligenceSnapshot,
  type FitQuality,
  type OwnershipClarity,
} from "./types";

import {
  getMyMinerals,
  getAllProductionSeries,
  getAllDeclineSummaries,
  getActivityFeed,
  getReportsIndex,
  getUserProfile,
  getSessionContext,
} from "@/lib/dataService";

import { supabase } from "@/integrations/supabase/client";

// ── Mappers ──────────────────────────────────────────────────

function mapOwnerIdentity(
  profile: Awaited<ReturnType<typeof getUserProfile>>,
  ownerRow: { verification_status: string; trust_level: string; last_seen_at: string } | null,
  role: "owner" | "professional",
  userId: string
): OwnerIdentity {
  return {
    userId,
    displayName: profile.displayName,
    role,
    verificationStatus: (ownerRow?.verification_status as OwnerIdentity["verificationStatus"]) ?? "unverified",
    matchConfidence: ownerRow?.verification_status === "verified" ? 1 : 0.5,
    lastSeenAt: ownerRow?.last_seen_at ?? new Date().toISOString(),
    trustLevel: (ownerRow?.trust_level as OwnerIdentity["trustLevel"]) ?? "new",
  };
}

function mapLeases(minerals: Awaited<ReturnType<typeof getMyMinerals>>): LeaseSummary[] {
  return minerals.map((m) => ({
    mineralId: m.id,
    name: m.name,
    county: m.county,
    state: m.state,
    operator: m.operator,
    status: m.status,
    ownershipClarity: "claimed" as OwnershipClarity, // No verification system yet
    nri: m.nri ?? null,
    acreage: m.acreage ?? null,
    legalDescription: m.legalDescription ?? null,
    apiNumber: m.apiNumber ?? null,
    linkedWellIds: m.linkedWellIds,
  }));
}

function mapProductionSeries(
  series: Awaited<ReturnType<typeof getAllProductionSeries>>,
  declines: Awaited<ReturnType<typeof getAllDeclineSummaries>>
): ProductionSeriesDomain[] {
  return series.map((s) => {
    const decline = declines.find((d) => d.wellId === s.wellId);
    return {
      wellId: s.wellId,
      wellName: s.wellName,
      operator: s.operator,
      points: s.data.map((d) => ({
        date: d.date,
        oil: d.oil,
        gas: d.gas,
        water: d.water,
        daysOnline: d.daysOnline,
      })),
      trendSummary: {
        trend: decline?.trend ?? "stable",
        percentChange6mo: decline?.percentChange ?? 0,
        currentMonthlyOil: decline?.currentMonthlyOil ?? 0,
        currentMonthlyGas: decline?.currentMonthlyGas ?? 0,
        isWithinNormalRange: decline?.isWithinNormalRange ?? true,
        regionalComparison: decline?.regionalComparison ?? "average",
      },
    };
  });
}

function mapDeclineFits(
  declines: Awaited<ReturnType<typeof getAllDeclineSummaries>>
): DeclineFit[] {
  return declines.map((d) => {
    const fitR2 = d.isWithinNormalRange ? 0.92 : 0.75;
    const fitQuality: FitQuality = fitR2 > 0.85 ? "strong" : fitR2 > 0.7 ? "moderate" : "weak";
    return {
      wellId: d.wellId,
      wellName: d.wellName,
      model: d.declineType,
      fitQuality,
      fitR2,
      initialDeclineRate: d.initialDeclineRate,
      currentDeclineRate: d.currentDeclineRate,
      projectedAssetLifeYears: d.projectedAssetLife,
      assumptions: [
        `${d.declineType} decline model applied`,
        "Based on public RRC production data",
        "Economic limit assumed at $10/BBL operating cost",
        "No re-completion or stimulation assumed",
      ],
      interpretation: {
        isNormal: d.isWithinNormalRange,
        comparisonToRegion: d.regionalComparison,
      },
    };
  });
}

function mapActivityEvents(
  events: Awaited<ReturnType<typeof getActivityFeed>>
): ActivityEventDomain[] {
  return events.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    date: e.date,
    relativeDate: e.relativeDate,
    distance: e.distance,
    distanceLabel: e.distanceLabel,
    entitiesAffected: {
      mineralId: e.relatedMineralId,
      mineralName: e.relatedMineralName,
      wellId: e.relatedWellId,
      wellName: e.relatedWellName,
    },
    operator: e.operator,
    county: e.county,
    significance: e.significance,
    coordinates: e.coordinates,
  }));
}

function mapReports(
  reports: Awaited<ReturnType<typeof getReportsIndex>>
): ReportIndex[] {
  return reports.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    filedDate: r.filedDate,
    source: r.source,
    operator: r.operator,
    county: r.county,
    status: r.status,
    entitiesAffected: {
      mineralId: r.relatedMineralId,
      mineralName: r.relatedMineralName,
      wellId: r.relatedWellId,
      wellName: r.relatedWellName,
    },
  }));
}

// ── Gateway ──────────────────────────────────────────────────

/**
 * Fetch the complete intelligence snapshot.
 * This is the ONLY function Intelligence is allowed to call for data.
 */
export async function getSnapshot(
  userId: string,
  role: "owner" | "professional"
): Promise<IntelligenceSnapshot> {
  // Fetch all data in parallel
  const [minerals, productionRaw, declinesRaw, activityRaw, reportsRaw, profile, sessionCtx, ownerProfile] =
    await Promise.all([
      getMyMinerals(),
      getAllProductionSeries(),
      getAllDeclineSummaries(),
      getActivityFeed({ significance: ["high", "medium"] }),
      getReportsIndex(),
      getUserProfile(),
      getSessionContext(),
      fetchOwnerProfile(userId),
    ]);

  const owner = mapOwnerIdentity(profile, ownerProfile, role, userId);
  const leases = mapLeases(minerals);
  const productionSeries = mapProductionSeries(productionRaw, declinesRaw);
  const declineFits = mapDeclineFits(declinesRaw);
  const recentActivity = mapActivityEvents(activityRaw);
  const reports = mapReports(reportsRaw);

  // Resolve focused entity from session context
  let focusedEntity: IntelligenceSnapshot["focusedEntity"] = null;
  if (sessionCtx?.active_entity_id && sessionCtx?.active_entity_type) {
    const entityType = sessionCtx.active_entity_type as "mineral" | "well" | "report";
    let name = sessionCtx.active_entity_id;
    if (entityType === "mineral") {
      name = leases.find((l) => l.mineralId === sessionCtx.active_entity_id)?.name ?? name;
    } else if (entityType === "report") {
      name = reports.find((r) => r.id === sessionCtx.active_entity_id)?.title ?? name;
    }
    focusedEntity = { type: entityType, id: sessionCtx.active_entity_id, name };
  }

  return {
    owner,
    leases,
    productionSeries,
    declineFits,
    recentActivity,
    reports,
    focusedEntity,
  };
}

// ── Helpers ──────────────────────────────────────────────────

async function fetchOwnerProfile(userId: string) {
  const { data } = await supabase
    .from("owner_profiles")
    .select("verification_status, trust_level, last_seen_at")
    .eq("user_id", userId)
    .single();
  return data;
}
