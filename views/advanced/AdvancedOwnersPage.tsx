"use client";

import { useState } from "react";
import { Users, Check, ChevronRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockMinerals } from "@/lib/mock";

interface Owner {
  id: string;
  name: string;
  role: "primary" | "managed";
  interestCount: number;
  verificationStatus: "verified" | "claimed" | "unverified";
  lastSeen: string;
}

const mockOwners: Owner[] = [
  { id: "o-1", name: "Johnson Family Trust", role: "primary", interestCount: 2, verificationStatus: "verified", lastSeen: "Today" },
  { id: "o-2", name: "Sarah Mitchell", role: "managed", interestCount: 1, verificationStatus: "claimed", lastSeen: "3 days ago" },
  { id: "o-3", name: "Davis Estate", role: "managed", interestCount: 1, verificationStatus: "unverified", lastSeen: "1 week ago" },
];

const VERIFICATION_STYLES = {
  verified: "bg-success/15 text-success",
  claimed: "bg-warning/15 text-warning",
  unverified: "bg-muted text-muted-foreground",
} as const;

export default function AdvancedOwnersPage() {
  const [activeOwnerId, setActiveOwnerId] = useState("o-1");

  return (
    <div className="px-4 py-6 md:px-8 animate-fade-in">
      <h1 className="text-xl font-medium text-foreground mb-1">Manage Owners</h1>
      <p className="text-sm text-muted-foreground mb-6">Switch active owner to view their portfolio and data.</p>

      <div className="space-y-2">
        {mockOwners.map((owner) => {
          const isActive = owner.id === activeOwnerId;
          return (
            <button
              key={owner.id}
              onClick={() => setActiveOwnerId(owner.id)}
              className={`w-full text-left calm-card !p-4 transition-all ${
                isActive ? "ring-2 ring-primary/30 bg-primary/5" : "hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{owner.name}</p>
                    {isActive && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xs text-muted-foreground">{owner.interestCount} interest{owner.interestCount !== 1 ? "s" : ""}</span>
                    <span className="text-2xs text-muted-foreground/40">┬╖</span>
                    <span className="text-2xs text-muted-foreground">{owner.lastSeen}</span>
                  </div>
                </div>
                <span className={`status-badge text-2xs ${VERIFICATION_STYLES[owner.verificationStatus]}`}>
                  {owner.verificationStatus}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active owner detail */}
      <div className="mt-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Active: {mockOwners.find((o) => o.id === activeOwnerId)?.name}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {mockMinerals.slice(0, 2).map((m) => (
            <div key={m.id} className="calm-card !p-3">
              <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
              <p className="text-2xs text-muted-foreground">{m.county}</p>
              <span className={`status-badge text-2xs mt-2 ${
                m.status === "producing" ? "status-producing" : m.status === "permitted" ? "status-permitted" : "status-inactive"
              }`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
