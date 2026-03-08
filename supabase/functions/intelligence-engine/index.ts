import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * IntelligenceEngine Edge Function
 *
 * Modes:
 *   general      – answers using only model knowledge (no DB required)
 *                   Covers oil & gas, mineral rights, lease, royalty, RRC,
 *                   decline curve, and regulatory questions.
 *   personalized – answers using structured domain objects from the client
 *
 * Tone: calm, conservative, non-advisory.
 * Never provides legal, tax, or investment advice.
 * Never presents projections as guarantees.
 */

interface RequestBody {
  mode: "general" | "personalized";
  question: string;
  snapshot?: Record<string, unknown> | null;
  objectsProvided?: { type: string; id: string }[];
}

const REQUIRED_OBJECTS = [
  "LeaseSummary",
  "ProductionSeriesDomain",
  "ActivityEventDomain",
  "ReportIndex",
  "OwnerIdentity",
];

function detectMissingObjects(
  provided: { type: string; id: string }[] | undefined
): string[] {
  if (!provided || provided.length === 0) return REQUIRED_OBJECTS;
  const providedTypes = new Set(provided.map((o) => o.type));
  return REQUIRED_OBJECTS.filter((t) => !providedTypes.has(t));
}

const GENERAL_SYSTEM_PROMPT = `You are MineralView Intelligence, a knowledgeable assistant for mineral rights owners in Texas.

CAPABILITIES:
- Answer questions about oil & gas operations, mineral ownership, lease agreements, royalty calculations, Railroad Commission of Texas (RRC) filings, decline curve analysis, and regulatory processes.
- Use general industry knowledge only. You have no access to any user-specific data in this mode.

TONE RULES:
- Calm, conservative, factual.
- Never provide legal, tax, or investment advice.
- Never present estimates or projections as guarantees or certainties.
- Use phrases like "typically," "in general," "many owners find," rather than definitive statements.
- If a question requires account-specific data, clearly state: "I can explain the concept generally, but your personalized data integration is not yet active."

RESPONSE FORMAT:
- 2-6 sentences for the summary.
- Always note limitations of general-only knowledge.
- End with a brief note about what personalized data would add, if relevant.

Do NOT use marketing language like "coming soon" or "stay tuned." Instead use transparent capability boundaries like "this feature requires personalized data integration, which is not yet active."`;

const PERSONALIZED_SYSTEM_PROMPT = `You are MineralView Intelligence, a personalized assistant for mineral rights owners.

STRICT RULES:
- Answer using ONLY the structured data provided below. Never invent or hallucinate data.
- Always cite which objects you used.
- If data is insufficient, say so explicitly.
- Calm, conservative, factual tone.
- Never provide legal, tax, or investment advice.
- Never present projections as guarantees.

STRUCTURED DATA:
{SNAPSHOT}

OBJECTS PROVIDED: {OBJECTS}
{MISSING_NOTE}

RESPONSE FORMAT:
- 2-6 sentence summary derived from the structured data.
- Note any limitations due to missing objects.
- Cite the object types used in your answer.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { mode, question, snapshot, objectsProvided } = body;

    if (!question?.trim()) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Mode: General ───────────────────────────────────────────
    if (mode === "general") {
      const openaiKey = Deno.env.get("OPENAI_API_KEY");

      let output: string;
      let confidenceLevel: string;

      if (!openaiKey) {
        // Stub — no API key
        output = `This is a general knowledge question about mineral rights and oil & gas operations. To provide a detailed answer, an OpenAI API key needs to be configured. In the meantime, I can explain that "${question}" relates to standard industry concepts that are well-documented in public resources.`;
        confidenceLevel = "low";
      } else {
        const completion = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: GENERAL_SYSTEM_PROMPT },
              { role: "user", content: question },
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (!completion.ok) {
          const errBody = await completion.text();
          throw new Error(`OpenAI API error [${completion.status}]: ${errBody}`);
        }

        const result = await completion.json();
        output = result.choices?.[0]?.message?.content ?? "No response generated.";
        confidenceLevel = "medium";
      }

      await supabase.from("intelligence_logs").insert({
        user_id: user.id,
        mode: "general",
        question,
        objects_used: [],
        output,
        confidence_level: confidenceLevel,
      });

      return new Response(
        JSON.stringify({
          mode: "general",
          modeLabel: "General explanation — not account-specific.",
          output,
          confidence: {
            level: confidenceLevel,
            reason: openaiKey
              ? "Based on general industry knowledge"
              : "Stub response — API key not configured",
          },
          limitations: "This answer uses general knowledge only and does not reference your specific minerals, leases, or production data.",
          objectsUsed: [],
          sourceLinks: [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Mode: Personalized ──────────────────────────────────────
    if (mode === "personalized") {
      const missing = detectMissingObjects(objectsProvided);

      if (missing.length > 0 && missing.length === REQUIRED_OBJECTS.length) {
        const missingResponse = {
          mode: "personalized",
          modeLabel: "Personalized data integration is not yet active.",
          output: null,
          missingObjects: missing,
          message: `I can explain the concept generally, but your personalized data integration is not yet active. To provide account-specific insights, the following data types are needed: ${missing.join(", ")}. Once available, personalized responses will reference your specific mineral interests, production history, and nearby activity.`,
          nextSteps: [
            "Navigate to Explore > Minerals to load your interests",
            "Open a specific mineral to populate lease and production data",
            "Visit the Activity page to load recent events",
          ],
          sourceLinks: [
            { label: "View minerals", to: "/app/explore/minerals" },
            { label: "See activity", to: "/app/explore/activity" },
          ],
          dataTypesExpected: [
            "Lease and mineral interest details",
            "Monthly production series by well",
            "Nearby activity events (permits, completions, spuds)",
            "Regulatory report filings",
            "Ownership identity and verification status",
          ],
        };

        await supabase.from("intelligence_logs").insert({
          user_id: user.id,
          mode: "personalized",
          question,
          objects_used: objectsProvided ?? [],
          output: missingResponse.message,
          confidence_level: "low",
          missing_objects: missing,
        });

        return new Response(JSON.stringify(missingResponse), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const openaiKey = Deno.env.get("OPENAI_API_KEY");
      let output: string;
      let confidenceLevel: string;

      if (!openaiKey) {
        output = `Based on your MineralView data: ${objectsProvided?.length ?? 0} structured objects are available for analysis. To generate a full personalized response, an OpenAI API key needs to be configured.${missing.length > 0 ? ` Note: partial data — ${missing.join(", ")} not yet available.` : ""}`;
        confidenceLevel = "low";
      } else {
        const systemPrompt = PERSONALIZED_SYSTEM_PROMPT
          .replace("{SNAPSHOT}", JSON.stringify(snapshot, null, 2))
          .replace("{OBJECTS}", objectsProvided?.map((o) => `${o.type}:${o.id}`).join(", ") ?? "none")
          .replace("{MISSING_NOTE}", missing.length > 0
            ? `\nMISSING OBJECTS (note these limitations): ${missing.join(", ")}`
            : "");

        const completion = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question },
            ],
            temperature: 0.2,
            max_tokens: 600,
          }),
        });

        if (!completion.ok) {
          const errBody = await completion.text();
          throw new Error(`OpenAI API error [${completion.status}]: ${errBody}`);
        }

        const result = await completion.json();
        output = result.choices?.[0]?.message?.content ?? "No response generated.";
        confidenceLevel = missing.length > 0 ? "medium" : "high";
      }

      await supabase.from("intelligence_logs").insert({
        user_id: user.id,
        mode: "personalized",
        question,
        objects_used: objectsProvided ?? [],
        output,
        confidence_level: confidenceLevel,
        missing_objects: missing.length > 0 ? missing : null,
      });

      return new Response(
        JSON.stringify({
          mode: "personalized",
          modeLabel: missing.length > 0
            ? "Based on partial MineralView data."
            : "Based on your MineralView data.",
          output,
          confidence: {
            level: confidenceLevel,
            reason: missing.length > 0
              ? `Partial data — missing: ${missing.join(", ")}`
              : "Full structured data available",
          },
          limitations: missing.length > 0
            ? `Answer is based on partial data. Missing: ${missing.join(", ")}. Personalized insights for these data types will be available once loaded.`
            : "Based on your structured data only; external data not included.",
          objectsUsed: objectsProvided ?? [],
          missingObjects: missing.length > 0 ? missing : null,
          sourceLinks: [
            { label: "View minerals", to: "/app/explore/minerals" },
            { label: "See production", to: "/app/explore/production" },
          ],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid mode. Use "general" or "personalized".' }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("IntelligenceEngine error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
