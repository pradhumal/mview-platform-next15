/**
 * eventTracker.ts
 *
 * Canonical behavioral event tracker for MView-Platform.
 * All 26 platform_ui events write to user_behavior_events in Supabase
 * via the track-behavior-event edge function.
 *
 * Schema per event:
 *   event_type, event_source, entity_type, entity_id,
 *   page_path, section, metadata, session_id, user_id,
 *   anonymous_id, occurred_at
 *
 * event_source is always "platform_ui" for all events fired here.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Canonical event types ────────────────────────────────────────────────────

export type CanonicalEventType =
  // Navigation
  | "page_view"
  // Intelligence tab
  | "intelligence_query_submitted"
  | "intelligence_followup_click"
  | "depth_preference_changed"
  | "style_preference_changed"
  // Entity views (Explore surfaces)
  | "mineral_view"
  | "well_view"
  | "operator_view"
  | "report_view"
  | "activity_view"
  | "production_view"
  // Claim flow
  | "claim_started"
  | "claim_completed"
  // Statement upload
  | "upload_statement"
  // Advanced tab
  | "advanced_tool_view"
  | "advanced_filter_used"
  | "comparison_run"
  // Video milestones (25 | 50 | 75 | 90 | 100)
  | "video_milestone_reached"
  // Explore interactions
  | "explore_section_opened"
  | "map_interaction"
  // Settings / onboarding
  | "onboarding_step_completed"
  | "role_selected"
  // Session
  | "session_started"
  | "session_resumed"
  // Auth
  | "sign_in"
  | "sign_out";

export type EntityType =
  | "mineral"
  | "well"
  | "operator"
  | "report"
  | "activity"
  | "production"
  | "claim"
  | "statement"
  | "video"
  | null;

export type SectionType =
  | "intelligence"
  | "explore"
  | "advanced"
  | "auth"
  | "onboarding"
  | null;

// ─── Event payload ────────────────────────────────────────────────────────────

export interface TrackEventPayload {
  event_type: CanonicalEventType;
  entity_type?: EntityType;
  entity_id?: string | null;
  page_path?: string;
  section?: SectionType;
  metadata?: Record<string, unknown>;
}

// ─── Session ID (anonymous, per-tab) ─────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = sessionStorage.getItem("mv_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("mv_session_id", sid);
  }
  return sid;
}

function getAnonymousId(): string {
  if (typeof window === "undefined") return "ssr";
  let aid = localStorage.getItem("mv_anonymous_id");
  if (!aid) {
    aid = crypto.randomUUID();
    localStorage.setItem("mv_anonymous_id", aid);
  }
  return aid;
}

// ─── Core tracker ─────────────────────────────────────────────────────────────

export async function track(payload: TrackEventPayload): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const event = {
      event_type: payload.event_type,
      event_source: "platform_ui",
      entity_type: payload.entity_type ?? null,
      entity_id: payload.entity_id ?? null,
      page_path:
        payload.page_path ??
        (typeof window !== "undefined" ? window.location.pathname : null),
      section: payload.section ?? null,
      metadata: payload.metadata ?? {},
      session_id: getSessionId(),
      user_id: user?.id ?? null,
      anonymous_id: getAnonymousId(),
      occurred_at: new Date().toISOString(),
    };

    const { error } = await supabase.functions.invoke("track-behavior-event", {
      body: event,
    });

    if (error) {
      console.warn("[eventTracker] Failed to track event:", error.message);
    }
  } catch (err) {
    // Never throw — tracking must never break the UI
    console.warn("[eventTracker] Unexpected error:", err);
  }
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export const Events = {
  pageView: (path: string, section: SectionType) =>
    track({ event_type: "page_view", page_path: path, section }),

  intelligenceQuerySubmitted: (metadata?: Record<string, unknown>) =>
    track({
      event_type: "intelligence_query_submitted",
      section: "intelligence",
      metadata,
    }),

  intelligenceFollowupClick: (promptText: string) =>
    track({
      event_type: "intelligence_followup_click",
      section: "intelligence",
      metadata: { prompt_text: promptText },
    }),

  depthPreferenceChanged: (value: string) =>
    track({
      event_type: "depth_preference_changed",
      section: "intelligence",
      metadata: { depth: value },
    }),

  stylePreferenceChanged: (value: string) =>
    track({
      event_type: "style_preference_changed",
      section: "intelligence",
      metadata: { style: value },
    }),

  mineralView: (mineralId: string) =>
    track({
      event_type: "mineral_view",
      entity_type: "mineral",
      entity_id: mineralId,
      section: "explore",
    }),

  wellView: (wellId: string) =>
    track({
      event_type: "well_view",
      entity_type: "well",
      entity_id: wellId,
      section: "explore",
    }),

  operatorView: (operatorId: string) =>
    track({
      event_type: "operator_view",
      entity_type: "operator",
      entity_id: operatorId,
      section: "explore",
    }),

  reportView: (reportId: string) =>
    track({
      event_type: "report_view",
      entity_type: "report",
      entity_id: reportId,
      section: "explore",
    }),

  activityView: () =>
    track({ event_type: "activity_view", entity_type: "activity", section: "explore" }),

  productionView: () =>
    track({ event_type: "production_view", entity_type: "production", section: "explore" }),

  claimStarted: (mineralId: string) =>
    track({
      event_type: "claim_started",
      entity_type: "claim",
      entity_id: mineralId,
      section: "explore",
    }),

  claimCompleted: (mineralId: string) =>
    track({
      event_type: "claim_completed",
      entity_type: "claim",
      entity_id: mineralId,
      section: "explore",
    }),

  uploadStatement: (metadata?: Record<string, unknown>) =>
    track({
      event_type: "upload_statement",
      entity_type: "statement",
      section: "intelligence",
      metadata,
    }),

  advancedToolView: (toolName: string) =>
    track({
      event_type: "advanced_tool_view",
      section: "advanced",
      metadata: { tool: toolName },
    }),

  advancedFilterUsed: (filterKey: string, filterValue: unknown) =>
    track({
      event_type: "advanced_filter_used",
      section: "advanced",
      metadata: { filter_key: filterKey, filter_value: filterValue },
    }),

  comparisonRun: (metadata?: Record<string, unknown>) =>
    track({ event_type: "comparison_run", section: "advanced", metadata }),

  videoMilestoneReached: (
    videoId: string,
    milestone: 25 | 50 | 75 | 90 | 100
  ) =>
    track({
      event_type: "video_milestone_reached",
      entity_type: "video",
      entity_id: videoId,
      metadata: { milestone_percent: milestone },
    }),

  sessionStarted: () =>
    track({ event_type: "session_started", section: null }),

  signIn: () =>
    track({ event_type: "sign_in", section: "auth" }),

  signOut: () =>
    track({ event_type: "sign_out", section: "auth" }),

  onboardingStepCompleted: (step: string) =>
    track({
      event_type: "onboarding_step_completed",
      section: "onboarding",
      metadata: { step },
    }),

  roleSelected: (role: string) =>
    track({
      event_type: "role_selected",
      section: "onboarding",
      metadata: { role },
    }),
} as const;
