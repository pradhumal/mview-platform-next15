/**
 * Feature Flags — Phase 1 Launch Mode
 *
 * LAUNCH_MODE = true  →  Only ship validated, complete features.
 * LAUNCH_MODE = false →  Everything is unlocked (dev/staging).
 *
 * Toggle this single boolean to switch modes.
 */

export const LAUNCH_MODE = true;

/**
 * Granular flags derived from LAUNCH_MODE.
 * Each flag documents WHY a feature is gated.
 */
export const featureFlags = {
  /** Owner login, onboarding, Intelligence home — always on */
  ownerAuth: true,
  ownerIntelligence: true,

  /** Explore surfaces — on in launch */
  exploreMap: true,
  exploreProduction: true,
  exploreActivity: true,
  exploreReports: true,

  /** Minerals list + detail — on in launch */
  exploreMinerals: true,

  /** Identity labeling (verified/claimed) — on in launch */
  identityLabeling: true,

  /** View source links in Intelligence responses — on in launch */
  viewSourceLinks: true,

  /** Decline only when assumptions + overlay present — on in launch */
  declineWithAssumptions: true,

  /** ── Gated in Launch Mode ── */

  /** Advanced View (professional tools) — incomplete edge cases */
  advancedView: true,

  /** Add mineral flow — needs validation polish */
  addMineral: !LAUNCH_MODE,

  /** Statement upload prompt — not ready */
  statementUpload: !LAUNCH_MODE,

  /** Data explorer page — experimental */
  dataExplorer: !LAUNCH_MODE,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

/** Check a single flag */
export function isEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
