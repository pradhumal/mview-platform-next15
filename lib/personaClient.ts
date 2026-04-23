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
import type { ValidatedStarter } from "@/lib/personaConfigs";

// ─── Types ────────────────────────────────────────────────────────────────────

// Canonical persona IDs — must match persona_id enum in Supabase prompt_starters table exactly.
// Source: Prompt_starters_supabase_schema_v1.docx (Aboli, 2026-04-22)
export type PersonaType =
  | "legacy_inherited_owner"
  | "passive_income_owner"
  | "active_deal_seeking_owner"
  | "sophisticated_portfolio_owner"
  | "distrustful_burned_owner"
  | "landman_acquisition_analyst"
  | "estate_mineral_manager"
  | "unknown"; // local fallback — not in DB enum

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

// ─── DB → UI mapping ──────────────────────────────────────────────────────────

/**
 * Map a prompt_starters DB row to the unified ValidatedStarter shape.
 * This is the ONLY place the DB field names are translated to UI field names.
 * UI components always read ValidatedStarter — never raw DB rows.
 */
export function mapDbToStarter(row: {
  id: string;
  prompt_text: string;
  follow_ups: string[] | null;
  workflow: string;
  surface: string;
  campaign: string;
  display_order: number;
}): ValidatedStarter {
  return {
    id: row.id,
    text: row.prompt_text,
    follow_ups: row.follow_ups ?? [],
    intent_slug: row.workflow,
    surface: row.surface,
    campaign: row.campaign,
    display_order: row.display_order,
  };
}

// ─── Supabase prompt starters read layer ─────────────────────────────────────

/**
 * Fetch active prompt starters for a persona from the prompt_starters table.
 * Returns null if the table is unreachable — caller falls back to personaConfigs.ts.
 *
 * Requires: prompt_starters table + RLS migration applied in Supabase.
 * Schema source: Prompt_starters_supabase_schema_v1.docx (Aboli, 2026-04-22)
 *
 * @param personaType  Canonical persona ID matching the persona_id DB enum.
 * @param isProfessional  Pass true for landman/estate personas to include gated rows.
 */
export async function fetchPromptStarters(
  personaType: PersonaType,
  isProfessional = false
): Promise<ValidatedStarter[] | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("prompt_starters")
      .select("id, prompt_text, follow_ups, workflow, surface, campaign, display_order")
      .eq("persona_type", personaType)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!isProfessional) {
      query = query.eq("requires_professional_gate", false);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(mapDbToStarter);
  } catch {
    return null;
  }
}
