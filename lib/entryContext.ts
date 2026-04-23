/**
 * entryContext.ts
 *
 * Captures the initial persona signals available at session entry.
 * Called once per session on first page load — signals are stored in
 * sessionStorage and reused for the session's lifetime.
 *
 * Entry signals captured:
 *   - entry_path: first pathname visited
 *   - referrer: document.referrer (null if direct)
 *   - utm_source / utm_medium / utm_campaign: standard UTM parameters
 *   - device_type: inferred from window.innerWidth (mobile / tablet / desktop)
 *
 * These signals are attached to the session_started event metadata and are
 * available to the persona engine for initial persona inference before any
 * behavioral events have been recorded.
 *
 * Constraints:
 *   - SSR-safe: all browser API access is guarded.
 *   - Capture is idempotent — calling captureEntryContext() multiple times
 *     only writes to storage once per session.
 *   - Frontend reads entry context but does NOT write persona state.
 *     Persona classification happens server-side via the behavior event stream.
 *
 * Consumed by:
 *   SessionBootstrap — passes EntryContext as metadata on session_started event.
 *   eventTracker.ts  — may include device_type in event metadata.
 */

// ─── Storage key ──────────────────────────────────────────────────────────────

const ENTRY_CONTEXT_KEY = "mv_entry_context";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface EntryContext {
  /** The pathname of the first page the user visited in this session. */
  entry_path: string;
  /** document.referrer at session start, or null if direct / not available. */
  referrer: string | null;
  /** UTM parameters from the landing URL, null if absent. */
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  /** Inferred device type based on viewport width. */
  device_type: DeviceType;
}

// ─── Device type inference ────────────────────────────────────────────────────

function inferDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// ─── UTM extraction ───────────────────────────────────────────────────────────

function getUtmParam(params: URLSearchParams, key: string): string | null {
  return params.get(key) || null;
}

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * Captures entry context from the current browser environment and stores it
 * in sessionStorage. Idempotent — subsequent calls return the stored value
 * without overwriting it.
 *
 * Call once at session start (inside SessionBootstrap).
 */
export function captureEntryContext(): EntryContext {
  if (typeof window === "undefined") {
    return {
      entry_path: "/",
      referrer: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      device_type: "desktop",
    };
  }

  // Return cached value if already captured for this session
  const cached = sessionStorage.getItem(ENTRY_CONTEXT_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as EntryContext;
    } catch {
      // Corrupted value — fall through to re-capture
    }
  }

  const params = new URLSearchParams(window.location.search);

  const context: EntryContext = {
    entry_path: window.location.pathname,
    referrer: document.referrer || null,
    utm_source: getUtmParam(params, "utm_source"),
    utm_medium: getUtmParam(params, "utm_medium"),
    utm_campaign: getUtmParam(params, "utm_campaign"),
    device_type: inferDeviceType(),
  };

  sessionStorage.setItem(ENTRY_CONTEXT_KEY, JSON.stringify(context));

  return context;
}

/**
 * Returns the stored entry context for the current session, or null if
 * captureEntryContext() has not yet been called.
 *
 * Use this for read-only access after session boot.
 */
export function getEntryContext(): EntryContext | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(ENTRY_CONTEXT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as EntryContext;
  } catch {
    return null;
  }
}
