/**
 * personaClient.ts
 *
 * Fetches and caches user_persona_state from Supabase for the current user.
 * Provides the current persona context to every intelligence query constructor.
 *
 * The context packet sent on every intelligence call must include:
 *   persona_type, behavioral_state, depth_preference,
 *   urgency_state, last_intent_type
 *
 * Without this packet, MView-API cannot route to the correct ConstitutionRouter
 * calibration — every user gets identical responses regardless of persona.
 *
 * NOTE: personaConfigs.ts remains the static fallback default.
 * Once Aboli defines the Supabase schema for admin-managed persona config,
 * the hydrateFromSupabase() function below gets the read implementation.
 * Do not add that implementation until the schema is agreed.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PersonaType =
  | "first_time_visitor"
  | "engaged_owner"
  | "concerned_owner"
  | "active_manager"
  | "professional_landman"
  | "estate_manager"
  | "unknown";

export type BehavioralState =
  | "orienting"
  | "exploring"
  | "investigating"
  | "comparing"
  | "acting"
  | "unknown";

export type DepthPreference = "simple" | "detailed" | "technical";

export type UrgencyState = "low" | "medium" | "high";

export interface PersonaState {
  persona_type: PersonaType;
  behavioral_state: BehavioralState;
  depth_preference: DepthPreference;
  urgency_state: UrgencyState;
  last_intent_type: string | null;
}

export interface IntelligenceContextPacket {
  persona_type: PersonaType;
  behavioral_state: BehavioralState;
  depth_preference: DepthPreference;
  urgency_state: UrgencyState;
  last_intent_type: string | null;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PERSONA_STATE: PersonaState = {
  persona_type: "unknown",
  behavioral_state: "orienting",
  depth_preference: "simple",
  urgency_state: "low",
  last_intent_type: null,
};

// ─── In-memory cache (per session) ───────────────────────────────────────────

let cachedState: PersonaState | null = null;
let cacheUserId: string | null = null;

// ─── Fetch persona state ──────────────────────────────────────────────────────

/**
 * Fetch user_persona_state for the current authenticated user.
 * Returns the default state if the record does not exist yet.
 * Result is cached in memory for the session — call invalidatePersonaCache()
 * after any event that may trigger a persona state change.
 */
export async function getPersonaState(userId: string): Promise<PersonaState> {
  if (cachedState && cacheUserId === userId) {
    return cachedState;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("user_persona_state")
      .select(
        "persona_type, behavioral_state, depth_preference, urgency_state, last_intent_type"
      )
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return DEFAULT_PERSONA_STATE;
    }

    const state: PersonaState = {
      persona_type: (data.persona_type as PersonaType) ?? DEFAULT_PERSONA_STATE.persona_type,
      behavioral_state: (data.behavioral_state as BehavioralState) ?? DEFAULT_PERSONA_STATE.behavioral_state,
      depth_preference: (data.depth_preference as DepthPreference) ?? DEFAULT_PERSONA_STATE.depth_preference,
      urgency_state: (data.urgency_state as UrgencyState) ?? DEFAULT_PERSONA_STATE.urgency_state,
      last_intent_type: data.last_intent_type ?? null,
    };

    cachedState = state;
    cacheUserId = userId;
    return state;
  } catch {
    return DEFAULT_PERSONA_STATE;
  }
}

/**
 * Build the context packet to include in every intelligence API call.
 * If userId is null (unauthenticated), returns the default packet.
 */
export async function buildIntelligenceContextPacket(
  userId: string | null
): Promise<IntelligenceContextPacket> {
  if (!userId) {
    return {
      persona_type: DEFAULT_PERSONA_STATE.persona_type,
      behavioral_state: DEFAULT_PERSONA_STATE.behavioral_state,
      depth_preference: DEFAULT_PERSONA_STATE.depth_preference,
      urgency_state: DEFAULT_PERSONA_STATE.urgency_state,
      last_intent_type: null,
    };
  }

  const state = await getPersonaState(userId);

  return {
    persona_type: state.persona_type,
    behavioral_state: state.behavioral_state,
    depth_preference: state.depth_preference,
    urgency_state: state.urgency_state,
    last_intent_type: state.last_intent_type,
  };
}

/**
 * Invalidate the in-memory persona cache.
 * Call this after submitting an intelligence query or after any event
 * that may cause a persona state transition on the server.
 */
export function invalidatePersonaCache(): void {
  cachedState = null;
  cacheUserId = null;
}

// ─── Admin-managed config hydration (stub — awaiting schema from Aboli) ───────

/**
 * STUB — do not implement until Aboli posts the Supabase schema
 * for the admin-managed persona config table and prompt starters.
 *
 * When implemented, this will:
 *   1. Call the platform-config edge function at session start
 *   2. Return prompt starters and feature overrides for the current persona
 *   3. Feed into usePersona() to replace static personaConfigs.ts entries
 */
export async function hydratePersonaConfigFromSupabase(
  _userId: string,
  _personaType: PersonaType
): Promise<null> {
  // TODO: implement after schema is agreed with Aboli
  // Expected return: { promptStarters: PromptStarter[], featureOverrides: FeatureOverrides }
  return null;
}
