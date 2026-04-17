/**
 * usePageTracking.ts
 *
 * Fires a page_view event on every route change within the authenticated shell.
 * Maps pathname prefixes to canonical SectionType values for eventTracker.
 *
 * Usage: call once inside a client component that mounts on every (main) route,
 * e.g. the SessionBootstrap component inside (main)/layout.tsx.
 */

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Events, type SectionType } from "@/lib/eventTracker";

function sectionFromPath(pathname: string): SectionType {
  if (pathname.startsWith("/app/intelligence")) return "intelligence";
  if (pathname.startsWith("/app/explore")) return "explore";
  if (pathname.startsWith("/app/advanced")) return "advanced";
  if (pathname.startsWith("/auth")) return "auth";
  if (pathname.startsWith("/onboarding")) return "onboarding";
  return null;
}

export function usePageTracking() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;
    Events.pageView(pathname, sectionFromPath(pathname));
  }, [pathname]);
}
