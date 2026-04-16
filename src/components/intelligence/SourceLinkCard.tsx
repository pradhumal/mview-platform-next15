"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { SourceLink, ObjectUsed } from "@/lib/domain/responseSchema";

interface SourceLinkCardProps {
  sourceLinks: SourceLink[];
  objectsUsed: ObjectUsed[];
  onNavigate?: () => void;
}

export function SourceLinkCard({ sourceLinks, objectsUsed, onNavigate }: SourceLinkCardProps) {
  if (sourceLinks.length === 0 && objectsUsed.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-border/40 bg-secondary/10 px-3 py-2 space-y-2">
      {sourceLinks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sourceLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onNavigate}
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              {link.label}
              <ChevronRight className="w-3 h-3" />
            </Link>
          ))}
        </div>
      )}
      {objectsUsed.length > 0 && (
        <p className="text-2xs text-muted-foreground/60">
          Objects: {objectsUsed.map((o) => `${o.type}:${o.id}`).join(", ")}
        </p>
      )}
    </div>
  );
}
