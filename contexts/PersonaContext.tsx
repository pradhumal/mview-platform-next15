/**
 * PersonaContext.tsx
 *
 * Provides the current user's persona config to all components.
 * Components call usePersona() — never read personaConfigs directly.
 *
 * Data flow:
 *   1. Auth resolves → user_id known
 *   2. personaClient.getPersonaState() fetches user_persona_state from Supabase
 *   3. PersonaConfig is resolved from personaConfigs.ts static defaults
 *   4. TODO: once Aboli's schema is agreed, hydratePersonaConfigFromSupabase()
 *      will overlay admin-managed prompt starters and feature overrides here
 *
 * The context exposes:
 *   - config: PersonaConfig — full config for the current persona
 *   - personaState: PersonaState — raw state from Supabase
 *   - isLoading: boolean
 *   - refresh: () => void — invalidates cache + re-fetches
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPersonaState,
  fetchPromptStarters,
  invalidatePersonaCache,
  type PersonaState,
} from "@/lib/personaClient";
import {
  getPersonaConfig,
  type PersonaConfig,
} from "@/lib/personaConfigs";

interface PersonaContextType {
  config: PersonaConfig;
  personaState: PersonaState | null;
  isLoading: boolean;
  refresh: () => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

const UNKNOWN_CONFIG = getPersonaConfig("unknown");

const DEFAULT_PERSONA_STATE: PersonaState = {
  persona_type: "unknown",
  behavioral_state: "orienting",
  depth_preference: "simple",
  urgency_state: "low",
  last_intent_type: null,
};

export function PersonaProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [personaState, setPersonaState] = useState<PersonaState | null>(null);
  const [config, setConfig] = useState<PersonaConfig>(UNKNOWN_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function load() {
      if (!user) {
        if (!cancelled) {
          setPersonaState(DEFAULT_PERSONA_STATE);
          setConfig(UNKNOWN_CONFIG);
          setIsLoading(false);
        }
        return;
      }
      if (!cancelled) setIsLoading(true);
      const state = await getPersonaState(user.id);
      const staticConfig = getPersonaConfig(state.persona_type);

      // Try Supabase prompt_starters table — fall back silently to static config
      const isProfessional =
        state.persona_type === "landman_acquisition_analyst" ||
        state.persona_type === "estate_mineral_manager";
      const liveStarters = await fetchPromptStarters(state.persona_type, isProfessional);

      if (!cancelled) {
        setPersonaState(state);
        setConfig(
          liveStarters
            ? { ...staticConfig, promptStarters: liveStarters }
            : staticConfig
        );
        setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user, authLoading, refreshToken]);

  const refresh = useCallback(() => {
    invalidatePersonaCache();
    setRefreshToken((t) => t + 1);
  }, []);

  return (
    <PersonaContext.Provider value={{ config, personaState, isLoading, refresh }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextType {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be used inside PersonaProvider");
  return ctx;
}
