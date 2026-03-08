import { Link } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";

interface FollowUpPromptsProps {
  prompts: string[];
  context?: string;
  className?: string;
}

export function FollowUpPrompts({ prompts, context, className = "" }: FollowUpPromptsProps) {
  if (prompts.length === 0) return null;

  // Build the query URL with context if provided
  const buildUrl = (prompt: string) => {
    const params = new URLSearchParams();
    params.set("q", prompt);
    if (context) {
      params.set("context", context);
    }
    return `/app?${params.toString()}`;
  };

  return (
    <div className={`pt-4 ${className}`}>
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        Ask Intelligence
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.slice(0, 3).map((prompt) => (
          <Link
            key={prompt}
            to={buildUrl(prompt)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          >
            {prompt}
            <ChevronRight className="w-3 h-3" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// Predefined prompt sets for different contexts
export const activityPrompts = [
  "Does this usually matter?",
  "Is this common in my area?",
  "Should I keep an eye on this?",
];

export const productionPrompts = [
  "Is this decline normal?",
  "How does this compare to similar wells?",
  "What would cause this change?",
];

export const mapPrompts = [
  "Is this close enough to affect me?",
  "Does proximity usually mean anything?",
  "What's happening in this area?",
];

export const reportPrompts = [
  "What is this report telling me?",
  "Is anything unusual here?",
  "Is this routine or something to watch?",
];

export const uploadPrompts = [
  "Is anything missing or unusual?",
  "Does this look typical?",
  "How does this compare to others?",
];

export const emptyStatePrompts = [
  "Is it normal for nothing to happen?",
  "What should I expect next?",
  "When should I check back?",
];

export const generalFollowUpPrompts = [
  "Is this normal?",
  "What usually happens next?",
  "Does this affect my checks?",
];
