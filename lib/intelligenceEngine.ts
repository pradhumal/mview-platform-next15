/**
 * IntelligenceEngine Client Service
 *
 * Two modes:
 *   general      – no structured data needed, uses model knowledge
 *   personalized – requires IntelligenceSnapshot, answers from structured objects
 *
 * Handles missing objects gracefully with actionable next steps.
 */

import { supabase } from "@/integrations/supabase/client";
import type { IntelligenceSnapshot } from "@/lib/domain/types";
import type { IntelligenceResponse, ObjectUsed, SourceLink, ConfidenceLevel } from "@/lib/domain/responseSchema";

// ─── Types ─────────────────────────────────────────────────────

export interface EngineRequest {
  mode: "general" | "personalized";
  question: string;
  snapshot?: IntelligenceSnapshot | null;
}

export interface EngineMissingResponse {
  mode: "personalized";
  modeLabel: string;
  output: null;
  missingObjects: string[];
  message: string;
  nextSteps: string[];
  sourceLinks: SourceLink[];
  dataTypesExpected?: string[];
}

export interface EngineSuccessResponse {
  mode: "general" | "personalized";
  modeLabel: string;
  output: string;
  confidence: { level: ConfidenceLevel; reason: string };
  limitations: string;
  objectsUsed: ObjectUsed[];
  missingObjects?: string[] | null;
  sourceLinks: SourceLink[];
}

export type EngineResponse = EngineSuccessResponse | EngineMissingResponse;

// ─── Helpers ───────────────────────────────────────────────────

function snapshotToObjects(snap: IntelligenceSnapshot): ObjectUsed[] {
  const objects: ObjectUsed[] = [];

  if (snap.owner) objects.push({ type: "OwnerIdentity", id: snap.owner.userId });
  snap.leases.forEach((l) => objects.push({ type: "LeaseSummary", id: l.mineralId }));
  snap.productionSeries.forEach((p) => objects.push({ type: "ProductionSeriesDomain", id: p.wellId }));
  snap.recentActivity.slice(0, 10).forEach((a) => objects.push({ type: "ActivityEventDomain", id: a.id }));
  snap.reports.slice(0, 10).forEach((r) => objects.push({ type: "ReportIndex", id: r.id }));
  snap.declineFits.forEach((d) => objects.push({ type: "DeclineFit", id: d.wellId }));

  return objects;
}

// ─── Engine ────────────────────────────────────────────────────

export async function askIntelligenceEngine(request: EngineRequest): Promise<EngineResponse> {
  const { mode, question, snapshot } = request;

  const objectsProvided = snapshot ? snapshotToObjects(snapshot) : [];

  const { data, error } = await supabase.functions.invoke("intelligence-engine", {
    body: {
      mode,
      question,
      snapshot: mode === "personalized" ? snapshot : null,
      objectsProvided: mode === "personalized" ? objectsProvided : [],
    },
  });

  if (error) {
    throw new Error(`Intelligence engine error: ${error.message}`);
  }

  return data as EngineResponse;
}

/**
 * Convert an EngineSuccessResponse into the strict IntelligenceResponse schema
 * used by the IntelligencePanel renderer.
 */
let _uid = 0;
function uid() { return `eng-${Date.now()}-${_uid++}`; }

export function engineResponseToIntelligence(
  res: EngineSuccessResponse,
  question: string
): IntelligenceResponse {
  return {
    id: uid(),
    modeLabel: res.modeLabel,
    summary: res.output,
    whatChanged: null,
    whyItMatters: res.mode === "personalized"
      ? "This answer is based on your structured mineral data."
      : "This is general knowledge — connect your data for personalized insights.",
    confidence: res.confidence,
    limitations: res.limitations,
    evidence: [],
    sourceLinks: res.sourceLinks,
    objectsUsed: res.objectsUsed,
    followUpPrompts: res.missingObjects && res.missingObjects.length > 0
      ? ["What data do you need?", "How do I add my minerals?"]
      : ["Tell me more", "What should I do next?"],
  };
}

/**
 * Build an IntelligenceResponse for a missing-objects scenario.
 */
export function missingObjectsToIntelligence(res: EngineMissingResponse): IntelligenceResponse {
  return {
    id: uid(),
    modeLabel: res.modeLabel,
    summary: res.message,
    whatChanged: null,
    whyItMatters: "Personalized answers require your mineral data to be loaded.",
    confidence: { level: "low", reason: `Missing: ${res.missingObjects.join(", ")}` },
    limitations: "Cannot provide personalized analysis without structured objects.",
    evidence: [],
    sourceLinks: res.sourceLinks,
    objectsUsed: [],
    followUpPrompts: res.nextSteps.slice(0, 2),
  };
}

/**
 * Type guard: is this a missing-objects response?
 */
export function isMissingResponse(res: EngineResponse): res is EngineMissingResponse {
  return res.output === null && "missingObjects" in res;
}
