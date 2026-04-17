/**
 * Conversation Memory Service
 *
 * Persists the last 5 exchanges per user, tracks entity context
 * and explanation depth preference. Uses structured storage only.
 */

import { supabase } from "@/integrations/supabase/client";

export interface ConversationEntry {
  id: string;
  question: string;
  summary: string;
  mode: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_label: string | null;
  confidence_level: string | null;
  created_at: string;
}

export interface SessionMemory {
  recentExchanges: ConversationEntry[];
  lastEntityType: string | null;
  lastEntityId: string | null;
  lastEntityLabel: string | null;
  explanationDepth: "brief" | "standard" | "detailed";
  hasHistory: boolean;
}

const MAX_ENTRIES = 5;

/** Fetch the user's conversation memory + session context */
export async function getSessionMemory(userId: string): Promise<SessionMemory> {
  const [exchangesResult, contextResult] = await Promise.all([
    supabase
      .from("conversation_memory")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(MAX_ENTRIES),
    supabase
      .from("session_context")
      .select("explanation_depth, last_entity_type, last_entity_id, last_entity_label")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const exchanges = (exchangesResult.data ?? []) as ConversationEntry[];
  const ctx = contextResult.data;

  return {
    recentExchanges: exchanges,
    lastEntityType: ctx?.last_entity_type ?? null,
    lastEntityId: ctx?.last_entity_id ?? null,
    lastEntityLabel: ctx?.last_entity_label ?? null,
    explanationDepth: (ctx?.explanation_depth as SessionMemory["explanationDepth"]) ?? "standard",
    hasHistory: exchanges.length > 0,
  };
}

/** Save a new exchange and prune to keep only the last 5 */
export async function saveExchange(
  userId: string,
  entry: {
    question: string;
    summary: string;
    mode: string;
    entityType?: string | null;
    entityId?: string | null;
    entityLabel?: string | null;
    confidenceLevel?: string | null;
  }
): Promise<void> {
  // Insert new entry
  await supabase.from("conversation_memory").insert({
    user_id: userId,
    question: entry.question,
    summary: entry.summary,
    mode: entry.mode,
    entity_type: entry.entityType ?? null,
    entity_id: entry.entityId ?? null,
    entity_label: entry.entityLabel ?? null,
    confidence_level: entry.confidenceLevel ?? null,
  });

  // Update last entity in session_context
  if (entry.entityType && entry.entityId) {
    await supabase
      .from("session_context")
      .update({
        last_entity_type: entry.entityType,
        last_entity_id: entry.entityId,
        last_entity_label: entry.entityLabel ?? null,
      })
      .eq("user_id", userId);
  }

  // Prune old entries beyond MAX_ENTRIES
  const { data: all } = await supabase
    .from("conversation_memory")
    .select("id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (all && all.length > MAX_ENTRIES) {
    const toDelete = all.slice(MAX_ENTRIES).map((r) => r.id);
    await supabase
      .from("conversation_memory")
      .delete()
      .in("id", toDelete);
  }
}

/** Update the user's explanation depth preference */
export async function setExplanationDepth(
  userId: string,
  depth: "brief" | "standard" | "detailed"
): Promise<void> {
  await supabase
    .from("session_context")
    .update({ explanation_depth: depth })
    .eq("user_id", userId);
}

/** Build a short memory context string for prompts */
export function buildMemoryContext(memory: SessionMemory): string | null {
  if (!memory.hasHistory) return null;

  const lines: string[] = [];

  // Reference last entity
  if (memory.lastEntityLabel) {
    lines.push(`Last discussed: ${memory.lastEntityLabel} (${memory.lastEntityType}).`);
  }

  // Summarize recent topics
  const topics = memory.recentExchanges
    .slice(0, 3)
    .map((e) => e.question)
    .join("; ");
  if (topics) {
    lines.push(`Recent questions: ${topics}`);
  }

  lines.push(`Explanation preference: ${memory.explanationDepth}.`);

  return lines.join(" ");
}
