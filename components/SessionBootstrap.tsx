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
import { getOrCreateSession } from "@/lib/session";
import { captureEntryContext } from "@/lib/entryContext";

export function SessionBootstrap() {
  usePageTracking();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = getOrCreateSession();
    if (!session.is_new_session) return;

    // Capture entry context on new session creation
    const entryCtx = captureEntryContext();

    Events.sessionStarted({
      entry_path: session.entry_path,
      session_start: session.session_start,
      referrer: entryCtx.referrer,
      utm_source: entryCtx.utm_source,
      utm_medium: entryCtx.utm_medium,
      utm_campaign: entryCtx.utm_campaign,
      device_type: entryCtx.device_type,
    });
  }, []);

  return null;
}
