/**
 * Strict Intelligence Response Schema
 *
 * Every Intelligence answer MUST conform to this shape.
 * No answer should render without structured objects.
 */

export type ConfidenceLevel = "low" | "medium" | "high";

export interface ConfidenceRating {
  level: ConfidenceLevel;
  reason: string;
}

export interface ObjectUsed {
  type: string;
  id: string;
}

export interface EvidenceBlockData {
  kind: "production-chart" | "activity-map" | "summary-card";
  label?: string;
}

export interface SourceLink {
  label: string;
  to: string;
}

/**
 * The canonical shape for every Intelligence response.
 * Renderers MUST check for all fields.
 */
export interface IntelligenceResponse {
  id: string;
  /** Mode label shown at the top of the response */
  modeLabel?: string;
  /** 2–6 sentence summary */
  summary: string;
  /** What changed since last visit / last data point (null if n/a) */
  whatChanged: string | null;
  /** Why this matters to the owner */
  whyItMatters: string;
  /** Confidence + reasoning */
  confidence: ConfidenceRating;
  /** One-line limitation disclosure */
  limitations: string;
  /** Evidence blocks to render inline */
  evidence: EvidenceBlockData[];
  /** Deep-link "view source" actions */
  sourceLinks: SourceLink[];
  /** Which domain objects were consumed */
  objectsUsed: ObjectUsed[];
  /** Optional follow-up prompts */
  followUpPrompts?: string[];
}
