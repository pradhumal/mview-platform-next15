"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Sparkles, MapPin, TrendingDown, FileText, Upload, X, Loader2, HelpCircle, Eye, Bell, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams} from "next/navigation";
import { MiniProductionChart } from "@/components/intelligence/MiniProductionChart";
import { StatementUploadPrompt } from "@/components/StatementUploadPrompt";
import { MiniActivityMap } from "@/components/intelligence/MiniActivityMap";
import { generalFollowUpPrompts, uploadPrompts } from "@/components/FollowUpPrompts";
import {
  getStatusSummary,
  getIntelligenceContext,
  getActivityFeed,
  getDeclineSummary,
  getMyMinerals,
  uploadStatement,
  type IntelligenceContext,
  type ParsedStatement,
} from "@/lib/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { getSessionMemory, saveExchange, type SessionMemory } from "@/lib/conversationMemory";

// First-time visitor prompts - orientation-level, trust-forming
const firstTimePrompts = [
  { text: "What do you see about my minerals?", icon: Eye },
  { text: "Is anything important happening right now?", icon: Bell },
  { text: "How does MineralView work?", icon: HelpCircle },
];

// Returning/engaged user prompts - diagnostic and interpretive
const returningPrompts = [
  { text: "What changed near me?", icon: MapPin },
  { text: "Is this decline normal?", icon: TrendingDown },
  { text: "Do I need to do anything?", icon: FileText },
];

interface EmbeddedEvidence {
  type: "production-chart" | "activity-map" | "statement-summary";
  data?: ParsedStatement;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  modeLabel?: string;
  actions?: { label: string; to: string }[];
  evidence?: EmbeddedEvidence;
  followUpPrompts?: string[];
}

type ContextMode = "simple" | "detailed";

export default function OwnerIntelligencePage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextMode, setContextMode] = useState<ContextMode>("simple");
  const [statusSummary, setStatusSummary] = useState<{
    totalInterests: number;
    statusMessage: string;
    lastChecked: string;
  } | null>(null);
  const [context, setContext] = useState<IntelligenceContext | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isEngaged, setIsEngaged] = useState(false);
  const [memory, setMemory] = useState<SessionMemory | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check engagement state from localStorage and context
  useEffect(() => {
    const hasEngaged = localStorage.getItem("mineralview_engaged") === "true";
    setIsEngaged(hasEngaged);
  }, []);

  // Load initial context, engagement state, and memory
  useEffect(() => {
    async function loadContext() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const promises: Promise<any>[] = [
          getStatusSummary(),
          getIntelligenceContext(),
        ];
        if (user) promises.push(getSessionMemory(user.id));

        const results = await Promise.all(promises);
        const [summary, ctx] = results;
        setStatusSummary(summary);
        setContext(ctx);
        if (results[2]) setMemory(results[2] as SessionMemory);
        
        // Check if user has minerals or activity - they're engaged
        if (ctx && (ctx.minerals.length > 0 || ctx.unreadReports.length > 0)) {
          setIsEngaged(true);
          localStorage.setItem("mineralview_engaged", "true");
        }
      } catch (error) {
        console.error("Failed to load intelligence context:", error);
      }
    }
    loadContext();
  }, []);

  // Handle initial query from URL
  useEffect(() => {
    const initialQuery = searchParams.get("q");
    const interestId = searchParams.get("interest");
    
    if (initialQuery && messages.length === 0) {
      handleSend(initialQuery);
    } else if (interestId && messages.length === 0) {
      // User navigated here asking about a specific interest
      handleSend(`Tell me about my interest`);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(file);
    
    // Add user message about upload
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `I uploaded a royalty statement: ${file.name}`,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    try {
      const parsed = await uploadStatement(file);
      
      // Add assistant response with parsed statement
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateStatementInsights(parsed),
        evidence: { type: "statement-summary", data: parsed },
        actions: [
          { label: "View related interest", to: `/app/explore/minerals/${parsed.linkedMineralId}` },
          { label: "See production history", to: "/app/explore/production" },
        ],
        followUpPrompts: uploadPrompts,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to parse statement:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I wasn't able to parse that statement. Please make sure it's a PDF or image of a royalty statement.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
      setUploadedFile(null);
    }
  };

  const generateStatementInsights = (statement: ParsedStatement): string => {
    const insights = statement.insights.slice(0, 3).join(" ");
    const discrepancyNote = statement.discrepancies && statement.discrepancies.length > 0
      ? ` I noticed a minor discrepancy: ${statement.discrepancies[0].description}`
      : "";
    
    return `I've analyzed your ${statement.period} royalty statement from ${statement.operator}. ${insights}${discrepancyNote}`;
  };

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Mark user as engaged once they ask a question
    if (!isEngaged) {
      setIsEngaged(true);
      localStorage.setItem("mineralview_engaged", "true");
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate intelligent response based on context
    setTimeout(async () => {
      const response = await generateContextualResponse(text, contextMode, context);
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);

      // Persist to conversation memory
      if (user) {
        saveExchange(user.id, {
          question: text,
          summary: response.content.slice(0, 200),
          mode: response.modeLabel?.includes("General") ? "general" : "personalized",
          confidenceLevel: null,
        }).catch(console.error);
      }
    }, 1200);
  }, [contextMode, context, isEngaged]);

  const generateContextualResponse = async (
    question: string,
    mode: ContextMode,
    ctx: IntelligenceContext | null
  ): Promise<Message> => {
    const q = question.toLowerCase();

    // Handle "how does this work" question for first-time users
    if (q.includes("how does") || q.includes("how do you") || q.includes("how mineralview")) {
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        modeLabel: "General explanation — not account-specific.",
        content: "MineralView tracks public oil & gas filings, production reports, and nearby activity related to your mineral interests. When something changes, I explain what it means in plain language — so you know when something matters, and when it doesn't. You're always in control, and your data stays private.",
        actions: [
          { label: "Add a mineral interest", to: "/app/explore/minerals/add" },
          { label: "See what we track", to: "/app/explore" },
        ],
        followUpPrompts: ["What do you see about my minerals?", "How do I add an interest?", "What would you alert me about?"],
      };
    }

    // Handle "what do you see" question for first-time users
    if (q.includes("what do you see") || q.includes("about my minerals")) {
      const mineralCount = ctx?.minerals.length || 0;
      if (mineralCount === 0) {
        return {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          modeLabel: "Based on your MineralView data.",
          content: "I don't see any mineral interests added to your account yet. Once you add your interests, I'll track nearby activity, production changes, and public filings — and explain what matters.",
          actions: [
            { label: "Add your first interest", to: "/app/explore/minerals/add" },
          ],
          followUpPrompts: ["How do I add an interest?", "What will you track?", "How does this work?"],
        };
      }
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        modeLabel: "Based on your MineralView data.",
        content: `I'm tracking ${mineralCount} mineral interest${mineralCount !== 1 ? "s" : ""} for you. I watch for nearby permits, production changes, and public filings. Currently, everything looks stable — I'll let you know if anything meaningful changes.`,
        actions: [
          { label: "View your interests", to: "/app/explore/minerals" },
          { label: "See recent activity", to: "/app/explore/activity" },
        ],
        followUpPrompts: ["What changed recently?", "Is anything unusual?", "What should I watch for?"],
      };
    }

    // Handle "is anything important" question
    if (q.includes("important") && (q.includes("anything") || q.includes("something"))) {
      const attentionItems = ctx?.unreadReports.filter((r: { status: string }) => r.status === "requires_attention") || [];
      if (attentionItems.length > 0) {
        return {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          modeLabel: "Based on your MineralView data.",
          content: `There ${attentionItems.length === 1 ? "is" : "are"} ${attentionItems.length} item${attentionItems.length > 1 ? "s" : ""} that may be worth reviewing: ${attentionItems[0].title}. This isn't urgent, but you may want to take a look when you have time.`,
          actions: [
            { label: "Review reports", to: "/app/explore/reports" },
          ],
          followUpPrompts: ["What does this report mean?", "Is this urgent?", "What should I do?"],
        };
      }
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        modeLabel: "Based on your MineralView data.",
        content: "Nothing urgent right now. Your mineral interests appear stable, with no significant changes in recent activity. I'll let you know if something meaningful happens.",
        actions: [
          { label: "View your interests", to: "/app/explore/minerals" },
          { label: "See recent activity", to: "/app/explore/activity" },
        ],
        followUpPrompts: ["What would you alert me about?", "What should I expect?", "How often do things change?"],
      };
    }

    // Handle valuation questions safely
    if (q.includes("worth") || q.includes("value") || q.includes("how much")) {
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        modeLabel: "General explanation — not account-specific.",
        content: "Mineral value depends on many factors including production history, remaining reserves, operator activity, and market conditions. Rather than focusing on a specific number, monitoring current activity helps you understand trends. I can help you track what's happening and provide context when meaningful changes occur.",
        actions: [
          { label: "View your interests", to: "/app/explore/minerals" },
          { label: "See recent activity", to: "/app/explore/activity" },
        ],
        followUpPrompts: ["What affects mineral value?", "How do I track trends?", "What should I watch for?"],
      };
    }

    // Use actual data for production/decline questions
    if (q.includes("decline") || q.includes("normal") || q.includes("production")) {
      try {
        const minerals = await getMyMinerals();
        if (minerals.length > 0 && minerals[0].linkedWellIds.length > 0) {
          const declineSummary = await getDeclineSummary(minerals[0].linkedWellIds[0]);
          if (declineSummary) {
            return {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              modeLabel: "Based on your MineralView data.",
              content: mode === "detailed"
                ? `${declineSummary.insight} The well shows a ${Math.abs(declineSummary.percentChange)}% ${declineSummary.trend === "declining" ? "decline" : "change"} over the past 6 months. This is ${declineSummary.isWithinNormalRange ? "within normal range" : "slightly outside typical patterns"} and the well is performing ${declineSummary.regionalComparison} compared to the regional average.`
                : declineSummary.insight,
              evidence: { type: "production-chart" },
              actions: [
                { label: "View production details", to: "/app/explore/production" },
              ],
              followUpPrompts: ["How does this compare to similar wells?", "What would cause this to change?", "Does this affect my checks?"],
            };
          }
        }
      } catch (error) {
        console.error("Failed to get decline data:", error);
      }
    }

    // Use actual data for activity questions
    if (q.includes("change") || q.includes("what changed") || q.includes("new") || q.includes("near") || q.includes("update")) {
      try {
        const activity = await getActivityFeed({ significance: ["high", "medium"] });
        if (activity.length > 0) {
          const recent = activity[0];
          return {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            modeLabel: "Based on your MineralView data.",
            content: mode === "detailed"
              ? `${recent.description} This event is ${recent.distanceLabel} from your ${recent.relatedMineralName} interest.`
              : `${recent.title}. ${recent.distanceLabel} from your ${recent.relatedMineralName} interest. ${recent.relativeDate}.`,
            evidence: { type: "activity-map" },
            actions: [
              { label: "View on map", to: "/app/explore/map" },
              { label: "See all activity", to: "/app/explore/activity" },
            ],
            followUpPrompts: ["Does this usually matter?", "Is this common in my area?", "What happens next?"],
          };
        }
      } catch (error) {
        console.error("Failed to get activity data:", error);
      }
    }

    if (q.includes("check") || q.includes("dropped") || q.includes("worried")) {
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        modeLabel: "Based on your MineralView data.",
        content: mode === "detailed"
          ? "Based on production records, your interests are showing normal behavior. Wells naturally decline over time, and the patterns I'm seeing are consistent with expectations for wells of this age and type. No action is needed."
          : "Your recent production change appears normal. Wells naturally decline over time, and what you're seeing falls within expected patterns for this area.",
        evidence: { type: "production-chart" },
        actions: [
          { label: "View production details", to: "/app/explore/production" },
          { label: "Explore on map", to: "/app/explore/map" },
        ],
        followUpPrompts: ["What causes check amounts to change?", "Is this typical for my area?", "When might this stabilize?"],
      };
    }

    if (q.includes("do") && (q.includes("anything") || q.includes("need"))) {
      const attentionItems = ctx?.unreadReports.filter((r: { status: string; title: string; summary?: string; description?: string }) => r.status === "requires_attention") || [];
      if (attentionItems.length > 0) {
        return {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          modeLabel: "Based on your MineralView data.",
          content: `There ${attentionItems.length === 1 ? "is" : "are"} ${attentionItems.length} item${attentionItems.length > 1 ? "s" : ""} that may need your attention. ${attentionItems[0].title} — ${attentionItems[0].summary || attentionItems[0].description}`,
          actions: [
            { label: "Review reports", to: "/app/explore/reports" },
            { label: "Adjust alert settings", to: "/app/settings" },
          ],
          followUpPrompts: ["What does this report mean?", "Is this urgent?", "What should I do next?"],
        };
      }
      return {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        modeLabel: "Based on your MineralView data.",
        content: "Based on current activity near your minerals, there's nothing that requires your attention right now. I'll let you know if anything meaningful changes.",
        actions: [
          { label: "Review your interests", to: "/app/explore/minerals" },
          { label: "Adjust alert settings", to: "/app/settings" },
        ],
        followUpPrompts: ["What should I expect next?", "When should I check back?", "What would you alert me about?"],
      };
    }

    // Default calm response with context
    const mineralCount = ctx?.minerals.length || 0;
    return {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      modeLabel: "Based on your MineralView data.",
      content: `Your ${mineralCount} mineral interest${mineralCount !== 1 ? "s" : ""} appear${mineralCount === 1 ? "s" : ""} stable. No significant changes in the past 30 days. I'll let you know if anything meaningful changes.`,
      actions: [
        { label: "View your interests", to: "/app/explore/minerals" },
        { label: "See recent activity", to: "/app/explore/activity" },
      ],
      followUpPrompts: generalFollowUpPrompts,
    };
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] md:min-h-screen">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = "";
        }}
      />

      {/* Messages or Welcome State */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
            {/* Session continuity banner */}
            {memory?.hasHistory && (
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 max-w-md mx-auto mb-6">
                <History className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs text-primary">
                  Continuing from your last session
                  {memory.lastEntityLabel ? ` — last discussed ${memory.lastEntityLabel}` : ""}
                </p>
              </div>
            )}
            {/* Welcome Header */}
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl text-foreground mb-2">
                What would you like to understand today?
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {isEngaged 
                  ? "Ask about activity near your minerals, production changes, or anything you're wondering about."
                  : "You can ask about your minerals, recent activity, or how MineralView works."
                }
              </p>
            </div>

            {/* Text Input */}
            <div className="max-w-lg mx-auto mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your minerals..."
                  className="flex-1 h-12 px-4 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-12 w-12 rounded-xl flex-shrink-0"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>

            {/* Suggested Prompts */}
            <div className="max-w-lg mx-auto mb-8">
              <p className="text-xs text-muted-foreground mb-3 text-center">
                {isEngaged ? "Or try asking:" : "Try asking:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(isEngaged ? returningPrompts : firstTimePrompts).map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => handleSend(suggestion.text)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 text-left hover:border-primary/30 hover:bg-card/80 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                      <suggestion.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm text-foreground">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Context Mode Toggle */}
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">Response style:</span>
                <div className="flex rounded-full bg-secondary p-0.5">
                  <button
                    onClick={() => setContextMode("simple")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      contextMode === "simple"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setContextMode("detailed")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      contextMode === "detailed"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    More detail
                  </button>
                </div>
              </div>
            </div>

            {/* Quiet Status */}
            <div className="max-w-lg mx-auto">
              <div className="calm-card text-center">
                {statusSummary ? (
                  <>
                    <p className="text-sm text-foreground mb-1">
                      Tracking {statusSummary.totalInterests} interest{statusSummary.totalInterests !== 1 ? "s" : ""} in Texas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(statusSummary.lastChecked).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">
                        {statusSummary.statusMessage}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                  </div>
                )}
              </div>
            </div>

            {/* Statement Upload Prompt - trust-first design */}
            <div className="max-w-lg mx-auto mt-6">
              <StatementUploadPrompt onUploadClick={() => fileInputRef.current?.click()} />
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-muted-foreground mt-8 max-w-sm mx-auto">
              Informational only. Not legal, tax, or investment advice.
            </p>
          </div>
        ) : (
          <div className="px-5 py-6 md:px-8 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`animate-fade-in ${
                  message.role === "user" ? "flex justify-end" : ""
                }`}
              >
                {message.role === "user" ? (
                  <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md max-w-[85%]">
                    <p className="text-sm">{message.content}</p>
                  </div>
                ) : (
                  <div className="calm-card max-w-full">
                    {/* Mode label */}
                    {message.modeLabel && (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-medium mb-3 ${
                        message.modeLabel.includes("General")
                          ? "bg-accent text-accent-foreground"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {message.modeLabel}
                      </div>
                    )}
                    <p className="text-sm text-foreground leading-relaxed mb-4">
                      {message.content}
                    </p>

                    {/* Embedded Evidence */}
                    {message.evidence && (
                      <div className="mb-4">
                        {message.evidence.type === "production-chart" && (
                          <MiniProductionChart />
                        )}
                        {message.evidence.type === "activity-map" && (
                          <MiniActivityMap />
                        )}
                        {message.evidence.type === "statement-summary" && message.evidence.data && (
                          <StatementSummaryCard statement={message.evidence.data} />
                        )}
                      </div>
                    )}

                    {message.actions && (
                      <div className="flex flex-wrap gap-3 pt-3 border-t border-border/50">
                        {message.actions.map((action) => (
                          <Link
                            key={action.label}
                            href={action.to}
                            className="action-link"
                          >
                            {action.label}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Follow-up prompts */}
                    {message.followUpPrompts && message.followUpPrompts.length > 0 && (
                      <div className="pt-4 mt-2">
                        <p className="text-xs text-muted-foreground mb-2">You might also ask:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.followUpPrompts.slice(0, 3).map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => handleSend(prompt)}
                              className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="calm-card animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.15s" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}

            {isUploading && (
              <div className="calm-card animate-fade-in flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing statement...</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Conversation Input - Only shown when in conversation */}
      {messages.length > 0 && (
        <div className="sticky bottom-0 px-5 py-4 md:px-8 border-t border-border/50 bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-3 max-w-2xl mx-auto"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1 h-12 px-4 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-xl flex-shrink-0"
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

// Statement Summary Card Component
function StatementSummaryCard({ statement }: { statement: ParsedStatement }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{statement.period} Statement</span>
        </div>
        <span className="text-xs text-muted-foreground">{statement.operator}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Check Amount</p>
          <p className="text-sm font-medium text-foreground">${statement.summary.checkAmount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">NRI</p>
          <p className="text-sm font-medium text-foreground">{(statement.summary.nri * 100).toFixed(4)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Oil Production</p>
          <p className="text-sm font-medium text-foreground">{statement.summary.grossProduction.oil.toLocaleString()} BBL</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Gas Production</p>
          <p className="text-sm font-medium text-foreground">{statement.summary.grossProduction.gas.toLocaleString()} MCF</p>
        </div>
      </div>

      {statement.discrepancies && statement.discrepancies.length > 0 && (
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-warning flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            {statement.discrepancies.length} discrepancy found
          </p>
        </div>
      )}
    </div>
  );
}
