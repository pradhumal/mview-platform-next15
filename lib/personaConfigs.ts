/**
 * personaConfigs.ts
 *
 * Static default persona configurations — the fallback when Supabase
 * admin-managed config is not yet available or fails to load.
 *
 * IMPORTANT: Do not hardcode prompt starters in JSX.
 * Every component reads prompts from usePersona(), which reads from here
 * as the static default. Once Aboli defines the Supabase schema for
 * admin-managed persona config, hydratePersonaConfigFromSupabase() in
 * personaClient.ts will supply overrides — this file remains the fallback.
 *
 * features flags here must remain the authoritative static default.
 * Runtime overrides come from Supabase admin config — design for that now.
 */

import type { PersonaType } from "@/lib/personaClient";

/**
 * ValidatedStarter — unified shape consumed by the UI.
 * Both the Supabase read path and the static fallback map to this type.
 * The UI never branches on data source — it always reads ValidatedStarter[].
 */
export interface ValidatedStarter {
  id: string;
  text: string;
  follow_ups: string[];
  intent_slug: string;
  surface: string;
  campaign: string;
  display_order: number;
}

/**
 * Map a static fallback PromptStarter entry to ValidatedStarter.
 * Used when Supabase is unreachable and personaConfigs.ts is the source.
 */
export function mapFallbackToStarter(
  p: { text: string; intent_slug: string },
  display_order: number
): ValidatedStarter {
  return {
    id: `fallback_${p.intent_slug}_${display_order}`,
    text: p.text,
    follow_ups: [],
    intent_slug: p.intent_slug,
    surface: "prompt_starters_inside_product",
    campaign: "intelligence_layer",
    display_order,
  };
}

export interface PersonaFeatures {
  showDeclineWorkbench: boolean;
  showPortfolioAnalytics: boolean;
  showValuationTools: boolean;
  showStatementUpload: boolean;
  showAdvancedTab: boolean;
  bottomNavTabs: ("intelligence" | "explore" | "advanced")[];
}

export interface PersonaConfig {
  persona_type: PersonaType;
  display_label: string;
  depth_default: "simple" | "detailed" | "technical";
  promptStarters: ValidatedStarter[];
  features: PersonaFeatures;
}

// ─── Static defaults ──────────────────────────────────────────────────────────

const ownerBase: PersonaFeatures = {
  showDeclineWorkbench: false,
  showPortfolioAnalytics: false,
  showValuationTools: false,
  showStatementUpload: true,
  showAdvancedTab: false,
  bottomNavTabs: ["intelligence", "explore"],
};

const professionalBase: PersonaFeatures = {
  showDeclineWorkbench: true,
  showPortfolioAnalytics: true,
  showValuationTools: true,
  showStatementUpload: false,
  showAdvancedTab: true,
  bottomNavTabs: ["intelligence", "explore", "advanced"],
};

export const personaConfigs: Record<PersonaType, PersonaConfig> = {
  // ── A. Legacy / Inherited Owner ────────────────────────────────────────────
  legacy_inherited_owner: {
    persona_type: "legacy_inherited_owner",
    display_label: "My Minerals",
    depth_default: "simple",
    promptStarters: [
      mapFallbackToStarter({ text: "I just inherited minerals — what are my first three steps?", intent_slug: "explain_ownership" }, 10),
      mapFallbackToStarter({ text: "Explain this 'Division Order' in plain English.", intent_slug: "explain_ownership" }, 20),
      mapFallbackToStarter({ text: "What does my ownership record show about this lease?", intent_slug: "explain_ownership" }, 30),
    ],
    features: { ...ownerBase, showStatementUpload: false },
  },

  // ── B. Passive Income Owner ────────────────────────────────────────────────
  passive_income_owner: {
    persona_type: "passive_income_owner",
    display_label: "My Minerals",
    depth_default: "simple",
    promptStarters: [
      mapFallbackToStarter({ text: "Are there significant changes in my revenue this month?", intent_slug: "production_change_analysis" }, 10),
      mapFallbackToStarter({ text: "Scan for new permits or drilling activity.", intent_slug: "nearby_drilling_activity" }, 20),
      mapFallbackToStarter({ text: "Does my latest check match my historical average?", intent_slug: "production_change_analysis" }, 30),
    ],
    features: ownerBase,
  },

  // ── C. Active Deal-Seeking Owner ───────────────────────────────────────────
  active_deal_seeking_owner: {
    persona_type: "active_deal_seeking_owner",
    display_label: "My Minerals",
    depth_default: "detailed",
    promptStarters: [
      mapFallbackToStarter({ text: "Compare my lease offer to nearby verified comps.", intent_slug: "evaluate_lease_offer" }, 10),
      mapFallbackToStarter({ text: "Is a 20% royalty standard for this activity?", intent_slug: "evaluate_lease_offer" }, 20),
      mapFallbackToStarter({ text: "What hard data can I review before deciding whether to accept an offer or keep my mineral rights?", intent_slug: "evaluate_lease_offer" }, 30),
    ],
    features: { ...ownerBase, showValuationTools: true },
  },

  // ── D. Sophisticated Portfolio Owner ──────────────────────────────────────
  sophisticated_portfolio_owner: {
    persona_type: "sophisticated_portfolio_owner",
    display_label: "My Portfolio",
    depth_default: "detailed",
    promptStarters: [
      mapFallbackToStarter({ text: "Explain the production variance between Q1 and Q4.", intent_slug: "production_change_analysis" }, 10),
      mapFallbackToStarter({ text: "Identify assets underperforming their projected decline.", intent_slug: "well_performance_analysis" }, 20),
      mapFallbackToStarter({ text: "Explain how NRI-weighted yield is derived from my data.", intent_slug: "portfolio_overview" }, 30),
    ],
    features: { ...ownerBase, showPortfolioAnalytics: true, showValuationTools: true },
  },

  // ── E. Distrustful / Burned Owner ────────────────────────────────────────
  distrustful_burned_owner: {
    persona_type: "distrustful_burned_owner",
    display_label: "My Minerals",
    depth_default: "simple",
    promptStarters: [
      mapFallbackToStarter({ text: "Show the state filing that matches my check stub volume.", intent_slug: "explain_ownership" }, 10),
      mapFallbackToStarter({ text: "Identify the discrepancy in my payout decimal.", intent_slug: "explain_ownership" }, 20),
      mapFallbackToStarter({ text: "Can I compare my lease production with official Texas Railroad Commission data?", intent_slug: "production_change_analysis" }, 30),
    ],
    features: ownerBase,
  },

  // ── F. Landman / Acquisition Analyst (professional gate) ─────────────────
  landman_acquisition_analyst: {
    persona_type: "landman_acquisition_analyst",
    display_label: "Workbench",
    depth_default: "technical",
    promptStarters: [
      mapFallbackToStarter({ text: "Identify potential base-case EUR revisions based on recent flow-back.", intent_slug: "well_performance_analysis" }, 10),
      mapFallbackToStarter({ text: "Show hyperbolic model parameters (b value, Di, projected life).", intent_slug: "well_performance_analysis" }, 20),
      mapFallbackToStarter({ text: "Show EUR/acre with spatial grid context for this well.", intent_slug: "well_performance_analysis" }, 30),
    ],
    features: professionalBase,
  },

  // ── G. Estate / Mineral Manager (professional gate) ──────────────────────
  estate_mineral_manager: {
    persona_type: "estate_mineral_manager",
    display_label: "Client Portfolio",
    depth_default: "detailed",
    promptStarters: [
      mapFallbackToStarter({ text: "Show a portfolio summary for this client — active wells and NPV.", intent_slug: "portfolio_overview" }, 10),
      mapFallbackToStarter({ text: "Identify revenue distribution anomalies and missing payments.", intent_slug: "production_change_analysis" }, 20),
      mapFallbackToStarter({ text: "Prepare an Interests table report including NRI and EUR/acre.", intent_slug: "portfolio_overview" }, 30),
    ],
    features: { ...professionalBase, showDeclineWorkbench: false },
  },

  // ── Unknown (local fallback — not in DB enum) ─────────────────────────────
  unknown: {
    persona_type: "unknown",
    display_label: "MineralView",
    depth_default: "simple",
    promptStarters: [
      mapFallbackToStarter({ text: "What do you see about my minerals?", intent_slug: "portfolio_overview" }, 10),
      mapFallbackToStarter({ text: "Is anything important happening right now?", intent_slug: "nearby_drilling_activity" }, 20),
      mapFallbackToStarter({ text: "How does MineralView work?", intent_slug: "explain_ownership" }, 30),
    ],
    features: { ...ownerBase, showStatementUpload: false },
  },
};

export function getPersonaConfig(personaType: PersonaType): PersonaConfig {
  return personaConfigs[personaType] ?? personaConfigs["unknown"];
}
