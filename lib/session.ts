/**
 * session.ts
 *
 * Manages session creation and session_id tracking for MView-Platform.
 * All behavioral events carry the session_id and anonymous_id from this module.
 *
 * Storage:
 *   sessionStorage — session_id, session_start, entry_path (tab-scoped, cleared on close)
 *   localStorage   — anonymous_id (device-persistent, survives tab close)
 *
 * Constraints:
 *   - SSR-safe: all storage access is guarded behind typeof window checks.
 *   - Never throws: safe to call at any point in the React lifecycle.
 *   - session_id is a UUID generated once per browser tab session.
 *   - anonymous_id is a UUID generated once per device (survives sessions).
 *
 * Consumed by:
 *   eventTracker.ts — attaches session_id and anonymous_id to every event.
 *   entryContext.ts — reads entry_path to capture the session's first URL.
 */

// ─── Storage keys ──────────────────────────────────────────────────────────────

const SESSION_ID_KEY = "mv_session_id";
const SESSION_START_KEY = "mv_session_start";
const ENTRY_PATH_KEY = "mv_entry_path";
const ANONYMOUS_ID_KEY = "mv_anonymous_id";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionData {
  /** UUID for the current browser tab session. Cleared when the tab closes. */
  session_id: string;
  /** UUID persisted to localStorage. Identifies the device across sessions. */
  anonymous_id: string;
  /** ISO timestamp when this session was first created. */
  session_start: string;
  /** The pathname of the first page the user visited in this session. */
  entry_path: string;
  /** True when session_id was created fresh (not read from existing storage). */
  is_new_session: boolean;
}

// ─── Anonymous ID (device-persistent) ────────────────────────────────────────

/**
 * Returns the device-persistent anonymous ID.
 * Creates and persists a new UUID on first call.
 */
export function getAnonymousId(): string {
  if (typeof window === "undefined") return "ssr";
  let aid = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (!aid) {
    aid = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_ID_KEY, aid);
  }
  return aid;
}

// ─── Session ID (tab-scoped) ──────────────────────────────────────────────────

/**
 * Returns the current tab session ID.
 * Does NOT create a new session — use getOrCreateSession() for that.
 * Safe to call for read-only access (e.g. inside event payloads).
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  return sessionStorage.getItem(SESSION_ID_KEY) ?? "uninitialized";
}

// ─── Session lifecycle ────────────────────────────────────────────────────────

/**
 * Returns the current session data, creating a new session if one does not exist.
 *
 * Call once on app boot (inside SessionBootstrap or equivalent).
 * Subsequent calls return the same session data for the tab's lifetime.
 *
 * @returns SessionData with is_new_session=true only on first creation.
 */
export function getOrCreateSession(): SessionData {
  if (typeof window === "undefined") {
    return {
      session_id: "ssr",
      anonymous_id: "ssr",
      session_start: new Date().toISOString(),
      entry_path: "/",
      is_new_session: false,
    };
  }

  const existingId = sessionStorage.getItem(SESSION_ID_KEY);

  if (existingId) {
    return {
      session_id: existingId,
      anonymous_id: getAnonymousId(),
      session_start: sessionStorage.getItem(SESSION_START_KEY) ?? new Date().toISOString(),
      entry_path: sessionStorage.getItem(ENTRY_PATH_KEY) ?? window.location.pathname,
      is_new_session: false,
    };
  }

  // First visit in this tab — create a new session
  const session_id = crypto.randomUUID();
  const session_start = new Date().toISOString();
  const entry_path = window.location.pathname;

  sessionStorage.setItem(SESSION_ID_KEY, session_id);
  sessionStorage.setItem(SESSION_START_KEY, session_start);
  sessionStorage.setItem(ENTRY_PATH_KEY, entry_path);

  return {
    session_id,
    anonymous_id: getAnonymousId(),
    session_start,
    entry_path,
    is_new_session: true,
  };
}
