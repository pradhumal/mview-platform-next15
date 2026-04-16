/**
 * SessionBootstrap.tsx
 *
 * Client component mounted once inside the (main) layout.
 * Responsibilities:
 *   1. Fire session_started once per browser session (sessionStorage-guarded)
 *   2. Run usePageTracking on every route change (fires page_view)
 *
 * Does not render any UI — returns null.
 */

"use client";

import { useEffect } from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { Events } from "@/lib/eventTracker";

export function SessionBootstrap() {
  usePageTracking();

  useEffect(() => {
    const key = "mv_session_started";
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    Events.sessionStarted();
  }, []);

  return null;
}
