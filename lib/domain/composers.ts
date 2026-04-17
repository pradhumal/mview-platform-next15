/**
 * Intelligence Answer Composers
 *
 * Every function returns an IntelligenceResponse — the strict schema.
 * All data comes from IntelligenceSnapshot. No page scraping.
 */

import type { IntelligenceResponse } from "./responseSchema";
import type { IntelligenceSnapshot } from "./types";
import type { PageContext } from "@/hooks/useIntelligenceContext";

let _uid = 0;
function uid() { return `msg-${Date.now()}-${_uid++}`; }

const STRUCTURED_LABEL = "Based on your MineralView data.";
const GENERAL_LABEL = "General explanation — not account-specific.";

/** Attach mode label to a structured-data response */
function withLabel(resp: IntelligenceResponse, label: string = STRUCTURED_LABEL): IntelligenceResponse {
  return { ...resp, modeLabel: label };
}

export function composeExplainPage(ctx: PageContext, snap: IntelligenceSnapshot): IntelligenceResponse {
  if (ctx.entity?.type === "mineral") {
    const lease = snap.leases.find((l) => l.mineralId === ctx.entity!.id);
    if (lease) {
      const wells = snap.productionSeries.filter((p) => lease.linkedWellIds.includes(p.wellId));
      return {
        id: uid(),
        summary: `This is ${lease.name} in ${lease.county}, ${lease.state}. Operator: ${lease.operator ?? "Unknown"}. Status: ${lease.status}. ${wells.length} linked well${wells.length !== 1 ? "s" : ""}. Ownership clarity: ${lease.ownershipClarity}.`,
        whatChanged: null,
        whyItMatters: "Understanding your lease details helps you track production and identify operator changes.",
        confidence: { level: "high", reason: "Direct match to structured lease record" },
        limitations: "Operator data may lag public filings by up to 30 days.",
        evidence: wells.length > 0 ? [{ kind: "production-chart", label: "Linked well production" }] : [],
        sourceLinks: [{ label: "View mineral detail", to: `/app/explore/minerals/${lease.mineralId}` }],
        objectsUsed: [
          { type: "LeaseSummary", id: lease.mineralId },
          ...wells.map((w) => ({ type: "ProductionSeriesDomain", id: w.wellId })),
        ],
        followUpPrompts: ["Is production healthy?", "What's happening nearby?"],
      };
    }
  }

  if (ctx.subPage === "activity") {
    const count = snap.recentActivity.length;
    const highCount = snap.recentActivity.filter((a) => a.significance === "high").length;
    return {
      id: uid(),
      summary: `Activity feed: ${count} recent events, ${highCount} high-significance. Events are ranked by proximity and significance — items at the top are most likely to affect you.`,
      whatChanged: highCount > 0 ? `${highCount} high-significance event${highCount !== 1 ? "s" : ""} detected nearby.` : null,
      whyItMatters: "Nearby permits and completions can indicate new wells that may affect your royalties.",
      confidence: { level: "high", reason: "Sourced from structured activity event records" },
      limitations: "Activity data covers public filings only; private operations are not tracked.",
      evidence: [{ kind: "activity-map", label: "Activity near your interests" }],
      sourceLinks: [{ label: "View activity feed", to: "/app/explore/activity" }],
      objectsUsed: snap.recentActivity.slice(0, 5).map((a) => ({ type: "ActivityEventDomain", id: a.id })),
      followUpPrompts: ["What's the most important event?", "Does any of this affect me?"],
    };
  }

  if (ctx.subPage === "production") {
    const outOfRange = snap.productionSeries.filter((p) => !p.trendSummary.isWithinNormalRange);
    return {
      id: uid(),
      summary: `Tracking ${snap.productionSeries.length} well${snap.productionSeries.length !== 1 ? "s" : ""}. ${outOfRange.length === 0 ? "All within normal decline ranges." : `${outOfRange.length} well${outOfRange.length !== 1 ? "s" : ""} showing unusual patterns.`}`,
      whatChanged: outOfRange.length > 0 ? `${outOfRange.length} well${outOfRange.length !== 1 ? "s" : ""} moved outside normal range.` : null,
      whyItMatters: "Production trends directly impact your royalty income and mineral asset value.",
      confidence: { level: "high", reason: "Based on monthly production data series" },
      limitations: "Production data may be delayed 1–2 months from state reporting agencies.",
      evidence: [{ kind: "production-chart", label: "Production overview" }],
      sourceLinks: [{ label: "View production details", to: "/app/explore/production" }],
      objectsUsed: snap.productionSeries.map((p) => ({ type: "ProductionSeriesDomain", id: p.wellId })),
      followUpPrompts: ["Is this decline normal?", "How does this compare to nearby wells?"],
    };
  }

  if (ctx.subPage === "map") {
    return {
      id: uid(),
      summary: `Map shows ${snap.leases.length} mineral interest${snap.leases.length !== 1 ? "s" : ""} and ${snap.recentActivity.length} nearby events. Closer events are more relevant to you.`,
      whatChanged: null,
      whyItMatters: "Spatial proximity determines which operator actions could affect your interests.",
      confidence: { level: "medium", reason: "Location data sourced from public GIS records" },
      limitations: "Map coordinates are approximate; parcel boundaries may not be exact.",
      evidence: [{ kind: "activity-map", label: "Your interests & nearby activity" }],
      sourceLinks: [{ label: "View map", to: "/app/explore/map" }],
      objectsUsed: [
        ...snap.leases.map((l) => ({ type: "LeaseSummary", id: l.mineralId })),
        ...snap.recentActivity.slice(0, 3).map((a) => ({ type: "ActivityEventDomain", id: a.id })),
      ],
      followUpPrompts: ["What's closest to me?", "Are there new permits?"],
    };
  }

  if (ctx.subPage === "reports") {
    const attention = snap.reports.filter((r) => r.status === "requires_attention");
    return {
      id: uid(),
      summary: `${snap.reports.length} report${snap.reports.length !== 1 ? "s" : ""} tracked. ${attention.length > 0 ? `${attention.length} require${attention.length === 1 ? "s" : ""} attention.` : "None require attention."}`,
      whatChanged: attention.length > 0 ? `${attention.length} report${attention.length !== 1 ? "s" : ""} flagged for review.` : null,
      whyItMatters: "Regulatory filings can signal operator changes, pooling orders, or ownership disputes.",
      confidence: { level: "high", reason: "Matched against structured report index" },
      limitations: "Report parsing covers standard formats; non-standard filings may be missed.",
      evidence: [],
      sourceLinks: [{ label: "View reports", to: "/app/explore/reports" }],
      objectsUsed: snap.reports.slice(0, 5).map((r) => ({ type: "ReportIndex", id: r.id })),
      followUpPrompts: ["What needs my attention?", "Are these reports normal?"],
    };
  }

  if (ctx.section === "advanced") {
    return {
      id: uid(),
      summary: `Advanced View: professional tools for multi-owner management, bulk workflows, and deeper analytics. ${snap.leases.length} interest${snap.leases.length !== 1 ? "s" : ""} available for analysis.`,
      whatChanged: null,
      whyItMatters: "Advanced tools let professionals manage portfolios and run batch operations efficiently.",
      confidence: { level: "medium", reason: "General context; no specific entity selected" },
      limitations: "Advanced analytics are based on available structured data only.",
      evidence: [],
      sourceLinks: [{ label: "View interests", to: "/app/explore/minerals" }],
      objectsUsed: snap.leases.map((l) => ({ type: "LeaseSummary", id: l.mineralId })),
      followUpPrompts: ["How do bulk workflows work?", "What reports are available?"],
    };
  }

  // Default explore/general hub summary
  const counties = [...new Set(snap.leases.map((l) => l.county))];
  const highEvents = snap.recentActivity.filter((a) => a.significance === "high");
  const newReports = snap.reports.filter((r) => r.status === "new");
  const attentionReports = snap.reports.filter((r) => r.status === "requires_attention");
  const abnormalWells = snap.productionSeries.filter((p) => !p.trendSummary.isWithinNormalRange);

  // Build "what changed" line
  const changeParts: string[] = [];
  if (highEvents.length > 0) changeParts.push(`${highEvents.length} high-significance event${highEvents.length !== 1 ? "s" : ""} nearby`);
  if (abnormalWells.length > 0) changeParts.push(`${abnormalWells.length} well${abnormalWells.length !== 1 ? "s" : ""} outside normal range`);
  if (newReports.length > 0) changeParts.push(`${newReports.length} new report${newReports.length !== 1 ? "s" : ""}`);
  const whatChanged = changeParts.length > 0 ? changeParts.join(" · ") + " since your last visit." : null;

  return {
    id: uid(),
    summary: `You're tracking ${snap.leases.length} mineral interest${snap.leases.length !== 1 ? "s" : ""} across ${counties.length} count${counties.length !== 1 ? "ies" : "y"}.${attentionReports.length > 0 ? ` ${attentionReports.length} report${attentionReports.length !== 1 ? "s" : ""} may need attention.` : " Everything looks stable."} ${snap.recentActivity.length} recent events tracked nearby.`,
    whatChanged,
    whyItMatters: "A quick overview helps you prioritize which interests or events to look at first.",
    confidence: { level: "high", reason: "Aggregated from all structured domain objects" },
    limitations: "Overview stats reflect currently loaded data; historical trends require drilling in.",
    evidence: [],
    sourceLinks: [
      { label: "View interests", to: "/app/explore/minerals" },
      { label: "See activity", to: "/app/explore/activity" },
    ],
    objectsUsed: [
      ...snap.leases.map((l) => ({ type: "LeaseSummary", id: l.mineralId })),
      ...snap.recentActivity.slice(0, 3).map((a) => ({ type: "ActivityEventDomain", id: a.id })),
    ],
    followUpPrompts: ["What's most important right now?", "Is everything normal?"],
  };
}

export function composeWhatChanged(snap: IntelligenceSnapshot): IntelligenceResponse {
  const highEvents = snap.recentActivity.filter((e) => e.significance === "high");
  const abnormalWells = snap.productionSeries.filter((p) => !p.trendSummary.isWithinNormalRange);
  const newReports = snap.reports.filter((r) => r.status === "new");

  const parts: string[] = [];
  if (highEvents.length > 0) {
    const e = highEvents[0];
    parts.push(`${e.title} — ${e.distanceLabel} from your ${e.entitiesAffected.mineralName} interest (${e.relativeDate}).`);
  }
  if (abnormalWells.length > 0) {
    const w = abnormalWells[0];
    parts.push(`${w.wellName}: ${Math.abs(w.trendSummary.percentChange6mo)}% production change — outside normal range.`);
  }
  if (newReports.length > 0) {
    parts.push(`${newReports.length} new report${newReports.length !== 1 ? "s" : ""} to review.`);
  }

  const hasChanges = parts.length > 0;
  if (!hasChanges) {
    parts.push("No significant changes since your last visit. Production is stable and no new filings were recorded near your interests.");
  }

  return {
    id: uid(),
    summary: parts.join(" "),
    whatChanged: hasChanges ? parts.join(" ") : null,
    whyItMatters: hasChanges
      ? "These changes could affect your royalty income or ownership position."
      : "Stability means no immediate action is required on your part.",
    confidence: {
      level: hasChanges ? "high" : "medium",
      reason: hasChanges ? "Detected from structured event and production records" : "No changes detected in available data",
    },
    limitations: "Change detection covers the last 30 days of structured data only.",
    evidence: highEvents.length > 0 ? [{ kind: "activity-map", label: "Recent high-impact events" }] : [],
    sourceLinks: [
      { label: "View activity feed", to: "/app/explore/activity" },
      { label: "See production", to: "/app/explore/production" },
    ],
    objectsUsed: [
      ...highEvents.slice(0, 3).map((e) => ({ type: "ActivityEventDomain", id: e.id })),
      ...abnormalWells.slice(0, 3).map((w) => ({ type: "ProductionSeriesDomain", id: w.wellId })),
      ...newReports.slice(0, 3).map((r) => ({ type: "ReportIndex", id: r.id })),
    ],
    followUpPrompts: hasChanges
      ? ["Is this significant?", "What happens next?"]
      : ["When should I check back?", "What would you alert me about?"],
  };
}

export function composeDeclineAnswer(snap: IntelligenceSnapshot): IntelligenceResponse {
  const fits = snap.declineFits;
  if (fits.length === 0) {
    return {
      id: uid(),
      summary: "No decline data available for your wells yet.",
      whatChanged: null,
      whyItMatters: "Decline curves help project future production and asset value.",
      confidence: { level: "low", reason: "No decline fit data available" },
      limitations: "Decline analysis requires at least 6 months of production history.",
      evidence: [],
      sourceLinks: [],
      objectsUsed: [],
      followUpPrompts: ["What data do you need?"],
    };
  }

  const fit = snap.focusedEntity?.type === "well"
    ? fits.find((f) => f.wellId === snap.focusedEntity!.id) ?? fits[0]
    : fits[0];

  return {
    id: uid(),
    summary: `${fit.wellName}: ${fit.interpretation.isNormal ? "Normal" : "Unusual"} decline pattern. Model: ${fit.model}, fit quality: ${fit.fitQuality} (R²=${fit.fitR2.toFixed(2)}). Current rate: ${fit.currentDeclineRate}%/yr. Projected life: ~${fit.projectedAssetLifeYears} years. Performing ${fit.interpretation.comparisonToRegion} vs. region.`,
    whatChanged: !fit.interpretation.isNormal ? "Decline pattern is outside normal range for this region." : null,
    whyItMatters: "Decline trajectory directly impacts projected royalty income and asset valuation.",
    confidence: {
      level: fit.fitQuality === "strong" ? "high" : fit.fitQuality === "moderate" ? "medium" : "low",
      reason: `${fit.fitQuality} model fit (R²=${fit.fitR2.toFixed(2)})`,
    },
    limitations: `Assumption: ${fit.assumptions[0] ?? "Standard operating conditions"}`,
    evidence: [{ kind: "production-chart", label: `${fit.wellName} decline curve` }],
    sourceLinks: [{ label: "View production details", to: "/app/explore/production" }],
    objectsUsed: [{ type: "DeclineFit", id: fit.wellId }],
    followUpPrompts: ["What are the assumptions?", "How does this compare to similar wells?"],
  };
}

export function composeGeneralAnswer(question: string, snap: IntelligenceSnapshot): IntelligenceResponse {
  const q = question.toLowerCase();

  // Detect if this is a general knowledge question (not about user's specific data)
  const isGeneralKnowledge = detectGeneralKnowledge(q);

  if (isGeneralKnowledge) {
    return composeGeneralKnowledgeAnswer(question);
  }

  if (q.includes("worth") || q.includes("value") || q.includes("how much")) {
    return withLabel({
      id: uid(),
      summary: `Value depends on many factors. Your ${snap.leases.length} interest${snap.leases.length !== 1 ? "s" : ""}: ${snap.productionSeries.map((p) => `${p.wellName} at ${p.trendSummary.currentMonthlyOil} BBL/mo`).join(", ")}. Rather than presenting a number, I can help you track the underlying data that drives value.`,
      whatChanged: null,
      whyItMatters: "Tracking production and operator activity gives you the inputs needed for valuation.",
      confidence: { level: "low", reason: "Valuation requires external appraisal; structured data shows inputs only" },
      limitations: "MineralView does not provide financial advice or formal valuations.",
      evidence: [{ kind: "production-chart", label: "Current production rates" }],
      sourceLinks: [{ label: "View production", to: "/app/explore/production" }],
      objectsUsed: snap.productionSeries.map((p) => ({ type: "ProductionSeriesDomain", id: p.wellId })),
      followUpPrompts: ["What affects mineral value?", "How do I track trends?"],
    });
  }

  if (q.includes("do") && (q.includes("anything") || q.includes("need"))) {
    const attention = snap.reports.filter((r) => r.status === "requires_attention");
    if (attention.length > 0) {
      return withLabel({
        id: uid(),
        summary: `${attention.length} item${attention.length !== 1 ? "s" : ""} may need review: ${attention[0].title}.`,
        whatChanged: `${attention.length} report${attention.length !== 1 ? "s" : ""} flagged for your attention.`,
        whyItMatters: "Unreviewed reports may contain time-sensitive filings or ownership changes.",
        confidence: { level: "high", reason: "Matched against report status flags" },
        limitations: "Report urgency is inferred from filing type; consult a landman for legal interpretation.",
        evidence: [],
        sourceLinks: [{ label: "Review reports", to: "/app/explore/reports" }],
        objectsUsed: attention.slice(0, 3).map((r) => ({ type: "ReportIndex", id: r.id })),
        followUpPrompts: ["What does this report mean?", "Is this urgent?"],
      });
    }
    return withLabel({
      id: uid(),
      summary: "Nothing requires your attention right now. All production is within normal ranges and no new filings were flagged.",
      whatChanged: null,
      whyItMatters: "Knowing you have no action items lets you focus your time elsewhere.",
      confidence: { level: "medium", reason: "Based on current report statuses and production ranges" },
      limitations: "Only covers data currently in your account; external events may not be tracked yet.",
      evidence: [],
      sourceLinks: [{ label: "View reports", to: "/app/explore/reports" }],
      objectsUsed: [],
      followUpPrompts: ["What would you alert me about?", "When should I check back?"],
    });
  }

  const counties = [...new Set(snap.leases.map((l) => l.county))];
  return withLabel({
    id: uid(),
    summary: `Tracking ${snap.leases.length} interest${snap.leases.length !== 1 ? "s" : ""} across ${counties.join(", ")}. ${snap.recentActivity.length} recent events. All production ${snap.productionSeries.every((p) => p.trendSummary.isWithinNormalRange) ? "within normal ranges" : "has some anomalies worth reviewing"}.`,
    whatChanged: null,
    whyItMatters: "A broad overview helps you decide where to drill in for more detail.",
    confidence: { level: "high", reason: "Aggregated from all available structured objects" },
    limitations: "General overview; ask a specific question for deeper analysis.",
    evidence: [],
    sourceLinks: [
      { label: "View your interests", to: "/app/explore/minerals" },
      { label: "See recent activity", to: "/app/explore/activity" },
    ],
    objectsUsed: [
      ...snap.leases.map((l) => ({ type: "LeaseSummary", id: l.mineralId })),
      ...snap.recentActivity.slice(0, 3).map((a) => ({ type: "ActivityEventDomain", id: a.id })),
    ],
    followUpPrompts: ["What changed recently?", "Is everything normal?"],
  });
}

// ─── General Knowledge Mode ────────────────────────────────────

/** Keywords that indicate a general industry question, not about user-specific data */
const GENERAL_KEYWORDS = [
  "what is", "what are", "what does", "how does", "how do", "how is",
  "explain", "define", "definition", "meaning of",
  "rrc", "railroad commission", "mineral rights", "royalty", "royalties",
  "lease agreement", "division order", "pooling", "unitization",
  "severance tax", "ad valorem", "working interest", "overriding royalty",
  "net revenue interest", "mineral deed", "surface rights",
  "horizontal drilling", "hydraulic fracturing", "fracking",
  "decline curve", "hyperbolic decline", "exponential decline",
  "spacing unit", "proration", "allowable",
  "force majeure", "shut-in royalty", "delay rental",
  "habendum clause", "pugh clause", "continuous drilling",
];

function detectGeneralKnowledge(q: string): boolean {
  // If user refers to "my" data, it's personalized
  if (q.includes("my mineral") || q.includes("my interest") || q.includes("my production") ||
      q.includes("my well") || q.includes("my lease") || q.includes("my royalt") ||
      q.includes("near me") || q.includes("my area") || q.includes("my check")) {
    return false;
  }
  return GENERAL_KEYWORDS.some((kw) => q.includes(kw));
}

/**
 * Compose a general knowledge response for industry/regulatory questions.
 * These use no structured user data — purely educational.
 */
export function composeGeneralKnowledgeAnswer(question: string): IntelligenceResponse {
  const q = question.toLowerCase();

  // Pre-built general knowledge responses for common topics
  if (q.includes("decline curve") || q.includes("hyperbolic") || q.includes("exponential decline")) {
    return withLabel({
      id: uid(),
      summary: "Decline curve analysis is a method used to forecast future oil and gas production based on historical data. The two most common models are exponential decline (constant percentage loss per period) and hyperbolic decline (rate of decline decreases over time). Hyperbolic is more commonly applied to unconventional wells. Operators and analysts use these projections to estimate remaining reserves and asset value.",
      whatChanged: null,
      whyItMatters: "Understanding decline curves helps mineral owners evaluate whether production changes are expected or unusual.",
      confidence: { level: "medium", reason: "Based on general industry knowledge" },
      limitations: "Actual decline behavior varies by well, basin, and completion method. This is a general explanation, not a projection of any specific well.",
      evidence: [],
      sourceLinks: [],
      objectsUsed: [],
      followUpPrompts: ["How does this apply to my wells?", "What's a normal decline rate?"],
    }, GENERAL_LABEL);
  }

  if (q.includes("rrc") || q.includes("railroad commission")) {
    return withLabel({
      id: uid(),
      summary: "The Railroad Commission of Texas (RRC) regulates the oil and gas industry in Texas. It oversees drilling permits, production reporting, well plugging, and environmental compliance. Operators are required to file production reports monthly and apply for permits before drilling. The RRC maintains public records that mineral owners can access to verify operator activity.",
      whatChanged: null,
      whyItMatters: "RRC filings are the primary public data source for tracking operator actions near your interests.",
      confidence: { level: "medium", reason: "Based on general regulatory knowledge" },
      limitations: "This is general information about the RRC. Specific filing details depend on the operator and well in question.",
      evidence: [],
      sourceLinks: [],
      objectsUsed: [],
      followUpPrompts: ["What RRC filings affect me?", "How do I look up permits?"],
    }, GENERAL_LABEL);
  }

  if (q.includes("royalt") || q.includes("net revenue interest") || q.includes("nri")) {
    return withLabel({
      id: uid(),
      summary: "Royalty is the share of production revenue paid to mineral rights owners by the operator. Net Revenue Interest (NRI) represents the owner's actual share after accounting for all burdens (overriding royalties, etc.). A typical royalty rate in Texas ranges from 1/8 to 1/4, though it varies by lease. NRI is calculated by multiplying the royalty fraction by the mineral interest fraction.",
      whatChanged: null,
      whyItMatters: "Understanding NRI helps you verify that your royalty payments are calculated correctly.",
      confidence: { level: "medium", reason: "Based on general industry knowledge" },
      limitations: "Actual royalty rates and NRI depend on your specific lease terms. Consult your division order for exact figures.",
      evidence: [],
      sourceLinks: [],
      objectsUsed: [],
      followUpPrompts: ["What's my NRI?", "How are royalties calculated?"],
    }, GENERAL_LABEL);
  }

  if (q.includes("division order")) {
    return withLabel({
      id: uid(),
      summary: "A division order is a document from an operator that states your ownership interest in a well and authorizes them to distribute royalty payments accordingly. Signing a division order does not change your underlying mineral rights — it simply confirms payment allocation. You should verify that the NRI shown matches your title records before signing.",
      whatChanged: null,
      whyItMatters: "Division orders directly determine how much you're paid. Errors in division orders can result in under- or over-payment.",
      confidence: { level: "medium", reason: "Based on general industry knowledge" },
      limitations: "Division order specifics vary by operator and state. This is general guidance, not legal advice.",
      evidence: [],
      sourceLinks: [],
      objectsUsed: [],
      followUpPrompts: ["What should I check before signing?", "Can I dispute a division order?"],
    }, GENERAL_LABEL);
  }

  // Generic general knowledge fallback
  return withLabel({
    id: uid(),
    summary: `I can explain the concept generally, but your personalized data integration is not yet active for this type of question. "${question}" relates to mineral rights and oil & gas operations — topics that are well-documented in public resources and industry practice. For a personalized answer referencing your specific interests, navigate to your minerals to load your data.`,
    whatChanged: null,
    whyItMatters: "General knowledge provides context. Personalized data would make this answer specific to your situation.",
    confidence: { level: "low", reason: "General knowledge only — no account-specific data used" },
    limitations: "This response does not reference your specific minerals, leases, or production data.",
    evidence: [],
    sourceLinks: [
      { label: "View your interests", to: "/app/explore/minerals" },
    ],
    objectsUsed: [],
    followUpPrompts: ["Tell me about decline curves", "What is NRI?", "How does the RRC work?"],
  }, GENERAL_LABEL);
}
