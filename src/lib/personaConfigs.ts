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

export interface PromptStarter {
  text: string;
  intent_slug: string;
  persona_type: PersonaType | "all";
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
  promptStarters: PromptStarter[];
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
  first_time_visitor: {
    persona_type: "first_time_visitor",
    display_label: "Welcome",
    depth_default: "simple",
    promptStarters: [
      { text: "What do you see about my minerals?", intent_slug: "portfolio_overview", persona_type: "first_time_visitor" },
      { text: "Is anything important happening right now?", intent_slug: "activity_alert_check", persona_type: "first_time_visitor" },
      { text: "How does MineralView work?", intent_slug: "platform_orientation", persona_type: "first_time_visitor" },
    ],
    features: { ...ownerBase, showStatementUpload: false },
  },

  engaged_owner: {
    persona_type: "engaged_owner",
    display_label: "My Minerals",
    depth_default: "simple",
    promptStarters: [
      { text: "What changed near me?", intent_slug: "nearby_activity_check", persona_type: "engaged_owner" },
      { text: "Is this decline normal?", intent_slug: "decline_interpretation", persona_type: "engaged_owner" },
      { text: "Do I need to do anything?", intent_slug: "action_required_check", persona_type: "engaged_owner" },
    ],
    features: ownerBase,
  },

  concerned_owner: {
    persona_type: "concerned_owner",
    display_label: "My Minerals",
    depth_default: "simple",
    promptStarters: [
      { text: "Why is my production down?", intent_slug: "production_decline_cause", persona_type: "concerned_owner" },
      { text: "Should I be worried about this?", intent_slug: "concern_triage", persona_type: "concerned_owner" },
      { text: "What should I do next?", intent_slug: "action_required_check", persona_type: "concerned_owner" },
    ],
    features: ownerBase,
  },

  active_manager: {
    persona_type: "active_manager",
    display_label: "My Portfolio",
    depth_default: "detailed",
    promptStarters: [
      { text: "What's the production trend on my wells?", intent_slug: "production_trend_summary", persona_type: "active_manager" },
      { text: "Which interests have new activity?", intent_slug: "activity_by_interest", persona_type: "active_manager" },
      { text: "Are there any filing deadlines I should know?", intent_slug: "regulatory_deadline_check", persona_type: "active_manager" },
    ],
    features: { ...ownerBase, showPortfolioAnalytics: true },
  },

  professional_landman: {
    persona_type: "professional_landman",
    display_label: "Workbench",
    depth_default: "technical",
    promptStarters: [
      { text: "Show decline analysis for Smith Unit 1H", intent_slug: "decline_analysis", persona_type: "professional_landman" },
      { text: "What's the EUR/acre for this section?", intent_slug: "eur_per_acre_lookup", persona_type: "professional_landman" },
      { text: "Compare MVestimate NPV across these wells", intent_slug: "mvestimate_comparison", persona_type: "professional_landman" },
    ],
    features: professionalBase,
  },

  estate_manager: {
    persona_type: "estate_manager",
    display_label: "Client Portfolio",
    depth_default: "detailed",
    promptStarters: [
      { text: "Which clients have alerts this week?", intent_slug: "client_alert_summary", persona_type: "estate_manager" },
      { text: "Show portfolio NPV for this client", intent_slug: "portfolio_npv_by_client", persona_type: "estate_manager" },
      { text: "Which interests need verification?", intent_slug: "verification_status_check", persona_type: "estate_manager" },
    ],
    features: { ...professionalBase, showDeclineWorkbench: false },
  },

  unknown: {
    persona_type: "unknown",
    display_label: "MineralView",
    depth_default: "simple",
    promptStarters: [
      { text: "What do you see about my minerals?", intent_slug: "portfolio_overview", persona_type: "all" },
      { text: "Is anything important happening right now?", intent_slug: "activity_alert_check", persona_type: "all" },
      { text: "How does MineralView work?", intent_slug: "platform_orientation", persona_type: "all" },
    ],
    features: { ...ownerBase, showStatementUpload: false },
  },
};

export function getPersonaConfig(personaType: PersonaType): PersonaConfig {
  return personaConfigs[personaType] ?? personaConfigs["unknown"];
}
