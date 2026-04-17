"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Minimize2, MapPin, Clock, ShieldCheck, AlertTriangle, Info, History, Eye, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvidenceBlock } from "./intelligence/EvidenceBlock";
import { SourceLinkCard } from "./intelligence/SourceLinkCard";
import { useIntelligenceContext, type PageContext } from "@/hooks/useIntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSnapshot,
  composeExplainPage,
  composeWhatChanged,
  composeDeclineAnswer,
  composeGeneralAnswer,
  type IntelligenceSnapshot,
  type IntelligenceResponse,
} from "@/lib/domain";
import { getSessionMemory, saveExchange, type SessionMemory, type ConversationEntry } from "@/lib/conversationMemory";

// ─── Types ─────────────────────────────────────────────────────

interface UserMessage {
  id: string;
  role: "user";
  content: string;
}

type ChatEntry = UserMessage | IntelligenceResponse;

function isUserMessage(entry: ChatEntry): entry is UserMessage {
  return "role" in entry && (entry as UserMessage).role === "user";
}

function isResponse(entry: ChatEntry): entry is IntelligenceResponse {
  return "summary" in entry;
}

interface IntelligencePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { label: "Explain this page", query: "Explain this page", icon: Eye },
  { label: "What changed since last visit?", query: "What changed since last visit?", icon: RefreshCw },
];

const CONFIDENCE_ICON = {
  high: ShieldCheck,
  medium: Info,
  low: AlertTriangle,
};

const CONFIDENCE_COLOR = {
  high: "text-green-500",
  medium: "text-amber-500",
  low: "text-red-400",
};

// ─── Helpers ───────────────────────────────────────────────────

let _uid = 0;
function uid() { return `msg-${Date.now()}-${_uid++}`; }

function getPageLabel(ctx: PageContext): string {
  if (ctx.entity?.type === "mineral") return "Mineral Interest";
  if (ctx.entity?.type === "report") return "Report Detail";
  switch (ctx.subPage) {
    case "map": return "Map";
    case "production": return "Production";
    case "activity": return "Activity";
    case "reports": return "Reports";
    case "minerals": return "Minerals";
    default: break;
  }
  if (ctx.section === "explore") return "Explore";
  if (ctx.section === "advanced") return "Advanced";
  return "Intelligence";
}

function getContextDescription(ctx: PageContext): string {
  if (ctx.entity?.type === "mineral") return "Focused on a specific interest — I can explain what's happening here.";
  if (ctx.entity?.type === "report") return "Viewing a report — I can summarize the key points.";
  switch (ctx.subPage) {
    case "map": return "Wells, permits, and activity near your interests.";
    case "production": return "Production trends and decline patterns for your wells.";
    case "activity": return "Recent events that may affect your interests.";
    case "reports": return "Public filings and regulatory updates.";
    case "minerals": return "Your tracked mineral interests.";
    default: break;
  }
  if (ctx.section === "explore") return "Overview of your mineral data.";
  if (ctx.section === "advanced") return "Professional tools and analytics.";
  return "Ask me anything about your minerals.";
}

// ─── Component ─────────────────────────────────────────────────

export function IntelligencePanel({ isOpen, onClose }: IntelligencePanelProps) {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [snapshot, setSnapshot] = useState<IntelligenceSnapshot | null>(null);
  const [memory, setMemory] = useState<SessionMemory | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { context, getHistory } = useIntelligenceContext();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (isOpen && user && profile) {
      Promise.all([
        getSnapshot(user.id, profile.role as "owner" | "professional"),
        getSessionMemory(user.id),
      ]).then(([snap, mem]) => {
        setSnapshot(snap);
        setMemory(mem);
      }).catch(console.error);
    }
  }, [isOpen, user, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !snapshot) return;

    const userMsg: UserMessage = { id: uid(), role: "user", content: text };
    setEntries((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setTimeout(async () => {
      const q = text.toLowerCase();
      let response: IntelligenceResponse;

      if (q.includes("explain this page") || q.includes("explain this")) {
        response = composeExplainPage(context, snapshot);
      } else if (q.includes("changed since") || q.includes("last visit") || q.includes("what changed")) {
        response = composeWhatChanged(snapshot);
      } else if (q.includes("decline") || q.includes("normal") || q.includes("production")) {
        response = composeDeclineAnswer(snapshot);
      } else {
        response = composeGeneralAnswer(text, snapshot);
      }

      setEntries((prev) => [...prev, response]);
      setIsLoading(false);

      // Persist exchange to memory
      if (user) {
        saveExchange(user.id, {
          question: text,
          summary: response.summary,
          mode: response.modeLabel?.includes("General") ? "general" : "personalized",
          entityType: context.entity?.type ?? null,
          entityId: context.entity?.id ?? null,
          entityLabel: context.label,
          confidenceLevel: response.confidence.level,
        }).catch(console.error);
      }
    }, 800);
  };

  if (!isOpen) return null;

  const history = getHistory();

  return (
    <div
      className={`fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 transition-all duration-300 ${
        isMinimized ? "w-14 h-14" : "w-80 md:w-96 h-[28rem] md:h-[32rem]"
      }`}
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
          {/* Header — contextual */}
          <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Intelligence</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Contextual page label */}
            <p className="text-2xs text-muted-foreground ml-9">
              You&apos;re viewing: <span className="text-foreground font-medium">{getPageLabel(context)}</span>
              {" — "}{getContextDescription(context)}
            </p>
            {/* Context chip */}
            {context.entity && (
              <div className="ml-9 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-2xs font-medium text-primary">
                  <Layers className="w-3 h-3" />
                  {context.entity.type}: {context.entity.id.slice(0, 8)}
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {entries.length === 0 ? (
              <div className="space-y-3 animate-fade-in">
                {/* Session continuity + memory thread */}
                {memory?.hasHistory && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                      <History className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <p className="text-2xs text-primary">
                        Continuing from your last session
                        {memory.lastEntityLabel ? ` — ${memory.lastEntityLabel}` : ""}
                      </p>
                    </div>
                    {/* Recent exchanges thread */}
                    <div className="space-y-1.5 pl-1">
                      {memory.recentExchanges.slice(0, 5).reverse().map((ex) => (
                        <div key={ex.id} className="flex gap-2">
                          <div className="w-1 rounded-full bg-border flex-shrink-0 mt-1" style={{ minHeight: "1rem" }} />
                          <div className="min-w-0">
                            <p className="text-2xs text-muted-foreground truncate">
                              <span className="font-medium text-foreground/70">You:</span> {ex.question}
                            </p>
                            <p className="text-2xs text-muted-foreground/60 truncate">{ex.summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions — always first */}
                <div className="space-y-2 pt-1">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleSend(action.query)}
                      disabled={!snapshot}
                      className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 transition-colors disabled:opacity-50"
                    >
                      <action.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <p className="text-sm text-foreground">{action.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              entries.map((entry) => {
                if (isUserMessage(entry)) {
                  return (
                    <div key={entry.id} className="flex justify-end animate-fade-in">
                      <div className="bg-primary text-primary-foreground px-3 py-2 rounded-xl rounded-br-md max-w-[85%]">
                        <p className="text-sm">{entry.content}</p>
                      </div>
                    </div>
                  );
                }
                if (isResponse(entry)) {
                  const ConfIcon = CONFIDENCE_ICON[entry.confidence.level];
                  return (
                    <div key={entry.id} className="animate-fade-in">
                      <div className="bg-secondary/50 rounded-xl p-3 max-w-full space-y-2">
                        {/* Mode label */}
                        {entry.modeLabel && (
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-medium ${
                            entry.modeLabel.includes("General")
                              ? "bg-accent text-accent-foreground"
                              : "bg-primary/10 text-primary"
                          }`}>
                            {entry.modeLabel}
                          </div>
                        )}
                        {/* Summary */}
                        <p className="text-sm text-foreground leading-relaxed">{entry.summary}</p>

                        {/* What changed */}
                        {entry.whatChanged && (
                          <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-accent/30 border border-accent/20">
                            <AlertTriangle className="w-3 h-3 text-accent-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-2xs text-accent-foreground">{entry.whatChanged}</p>
                          </div>
                        )}

                        {/* Why it matters */}
                        <p className="text-2xs text-muted-foreground italic">{entry.whyItMatters}</p>

                        {/* Evidence blocks */}
                        {entry.evidence.map((ev, i) => (
                          <EvidenceBlock key={`${entry.id}-ev-${i}`} data={ev} />
                        ))}

                        {/* Confidence + Limitations */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className={`flex items-center gap-1 ${CONFIDENCE_COLOR[entry.confidence.level]}`}>
                            <ConfIcon className="w-3 h-3" />
                            <span className="text-2xs font-medium capitalize">{entry.confidence.level}</span>
                          </div>
                          <span className="text-2xs text-muted-foreground/50">·</span>
                          <span className="text-2xs text-muted-foreground/60">{entry.confidence.reason}</span>
                        </div>
                        <p className="text-2xs text-muted-foreground/50">{entry.limitations}</p>

                        {/* Source links + objects */}
                        <SourceLinkCard
                          sourceLinks={entry.sourceLinks}
                          objectsUsed={entry.objectsUsed}
                          onNavigate={onClose}
                        />

                        {/* Follow-ups */}
                        {entry.followUpPrompts && entry.followUpPrompts.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {entry.followUpPrompts.slice(0, 2).map((prompt) => (
                              <button
                                key={prompt}
                                onClick={() => handleSend(prompt)}
                                className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-2xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })
            )}
            {isLoading && (
              <div className="bg-secondary/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.15s" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 h-10 px-3 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" size="icon" className="h-10 w-10 rounded-lg flex-shrink-0" disabled={!input.trim() || isLoading || !snapshot}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
