"use client";

import { usePathname, useParams } from "next/navigation";
import { useMemo, useRef, useCallback, useEffect } from "react";
import { updateSessionContext } from "@/lib/dataService";

export interface PageContext {
  /** Human-readable label for the current page */
  label: string;
  /** The route path */
  path: string;
  /** Detected entity type, if any */
  entity?: {
    type: "mineral" | "well" | "report" | "county";
    id: string;
  };
  /** Section of the app */
  section: "intelligence" | "explore" | "advanced" | "settings";
  /** Sub-page within the section */
  subPage?: string;
  /** Timestamp when this context was captured */
  timestamp: number;
}

const MAX_HISTORY = 5;

// Session-level context history (persists across re-renders, resets on page reload)
let contextHistory: PageContext[] = [];

function resolveSection(path: string): PageContext["section"] {
  if (path.startsWith("/app/advanced")) return "advanced";
  if (path.startsWith("/app/explore")) return "explore";
  if (path.startsWith("/app/settings")) return "settings";
  return "intelligence";
}

function resolveLabel(path: string, params: Record<string, string | undefined>): string {
  if (path === "/app" || path === "/app/") return "Intelligence Home";
  if (path === "/app/explore") return "Explore";
  if (path.includes("/explore/map")) return "Map";
  if (path.includes("/explore/production")) return "Production";
  if (path.includes("/explore/activity")) return "Activity";
  if (path.includes("/explore/reports/") && params.id) return `Report ${params.id}`;
  if (path.includes("/explore/reports")) return "Reports";
  if (path.includes("/explore/minerals/add")) return "Add Mineral";
  if (path.includes("/explore/minerals/") && params.id) return `Mineral Detail`;
  if (path.includes("/explore/minerals")) return "My Minerals";
  if (path.includes("/advanced/owners")) return "Multi-Owner";
  if (path.includes("/advanced/workflows")) return "Bulk Workflows";
  if (path.includes("/advanced/reports")) return "Deep Reports";
  if (path.includes("/advanced")) return "Advanced View";
  if (path.includes("/settings")) return "Settings";
  return "MineralView";
}

function resolveEntity(
  path: string,
  params: Record<string, string | undefined>
): PageContext["entity"] | undefined {
  if (path.includes("/explore/minerals/") && params.id && params.id !== "add") {
    return { type: "mineral", id: params.id };
  }
  if (path.includes("/explore/reports/") && params.id) {
    return { type: "report", id: params.id };
  }
  return undefined;
}

function resolveSubPage(path: string): string | undefined {
  const segments = path.replace("/app/", "").split("/");
  return segments.length > 1 ? segments[segments.length - 1] : undefined;
}

/**
 * Hook that detects the current page context and maintains
 * a rolling history of the last 5 contexts per session.
 */
export function useIntelligenceContext() {
  const pathname = usePathname();
  const rawParams = useParams();
  const params: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(rawParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );
  const lastPathRef = useRef<string>("");

  const currentContext = useMemo<PageContext>(() => {
    const path = pathname ?? "";
    return {
      label: resolveLabel(path, params),
      path,
      entity: resolveEntity(path, params),
      section: resolveSection(path),
      subPage: resolveSubPage(path),
      timestamp: Date.now(),
    };
  }, [pathname, params]);

  // Push to history and persist to DB when path actually changes
  if (pathname !== lastPathRef.current) {
    lastPathRef.current = pathname ?? "";
    // Avoid duplicates at the head
    if (contextHistory.length === 0 || contextHistory[0].path !== pathname) {
      contextHistory = [currentContext, ...contextHistory].slice(0, MAX_HISTORY);
    }
  }

  // Persist session context to database (fire-and-forget)
  useEffect(() => {
    updateSessionContext({
      active_entity_id: currentContext.entity?.id ?? null,
      active_entity_type: currentContext.entity?.type ?? null,
      active_view: currentContext.section,
    });
  }, [currentContext.entity?.id, currentContext.entity?.type, currentContext.section]);

  const getHistory = useCallback(() => contextHistory, []);

  return { context: currentContext, getHistory };
}
