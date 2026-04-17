import { Upload, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface StatementUploadPromptProps {
  onUploadClick?: () => void;
}

export function StatementUploadPrompt({ onUploadClick }: StatementUploadPromptProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <div className="flex flex-col gap-4">
        {/* Primary CTA */}
        <Button 
          onClick={onUploadClick}
          variant="outline"
          className="w-full h-12 gap-2.5 text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload a royalty statement to get clarity
        </Button>

        {/* Supporting copy with tooltip */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <p className="flex-1 leading-relaxed">
            We already track your interests — statements help us deliver more meaningful insight into what the data means for you.
          </p>
          
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <button 
                className="flex-shrink-0 p-1 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground/70 hover:text-muted-foreground"
                aria-label="Why this helps"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent 
              align="end" 
              side="top"
              className="w-80 p-4"
            >
              <div className="space-y-3">
                <h4 className="font-medium text-foreground text-sm">
                  Why this helps
                </h4>
                
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    We use public data to track wells, operators, and activity tied to your interests.
                  </p>
                  
                  <p>
                    Royalty statements add context — they let us connect those trends to your actual payments, so we can explain not just what changed, but why.
                  </p>
                  
                  <div className="pt-1">
                    <p className="mb-2">With a statement, we can:</p>
                    <ul className="space-y-1.5 pl-1">
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground/70">•</span>
                        <span>Provide deeper insight into royalty changes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground/70">•</span>
                        <span>Explain variability, timing differences, and adjustments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground/70">•</span>
                        <span>Help you understand what&apos;s normal and what may deserve attention</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground/70 pt-1 border-t border-border/50">
                  Statements are used only to improve interpretation. No actions are taken on your behalf.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </div>
  );
}
