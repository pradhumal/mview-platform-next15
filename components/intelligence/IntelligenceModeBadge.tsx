/**
 * IntelligenceModeBadge.tsx
 *
 * Required trust signal on every intelligence response (Shaun Requirement 4).
 * Every AI response carries exactly one of two mode labels:
 *
 *   "Based on your MineralView data."
 *   → sage green pill
 *   → rendered when the response is grounded in the user's specific portfolio data
 *
 *   "General explanation — not account-specific."
 *   → slate blue pill
 *   → rendered when explaining a general concept or industry pattern
 *
 * These map to the validate_compliance() mode labels enforced in MView-Intelligence.
 * Never render an intelligence response without this badge.
 */

import React from "react";

export type IntelligenceMode = "account" | "general";

interface IntelligenceModeBadgeProps {
  mode: IntelligenceMode;
  className?: string;
}

const config: Record<
  IntelligenceMode,
  { label: string; className: string }
> = {
  account: {
    label: "Based on your MineralView data.",
    className:
      "bg-success/15 text-success border border-success/20",
  },
  general: {
    label: "General explanation — not account-specific.",
    className:
      "bg-accent text-accent-foreground border border-accent-foreground/10",
  },
};

export function IntelligenceModeBadge({
  mode,
  className = "",
}: IntelligenceModeBadgeProps) {
  const { label, badgeClass } = {
    label: config[mode].label,
    badgeClass: config[mode].className,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass} ${className}`}
    >
      {label}
    </span>
  );
}
