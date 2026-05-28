/**
 * In-memory session store for fallback/development use when Supabase is unavailable.
 *
 * Sessions are automatically evicted after TTL_MS to prevent unbounded memory growth
 * in long-running serverless instances.
 */

import type { QuizTurn } from "@/types";

/** Time-to-live for each session entry (2 hours). */
const TTL_MS = 2 * 60 * 60 * 1000;
/** How often to run the cleanup sweep (10 minutes). */
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

export interface TempSession {
  language: string;
  question: string;
  correctAnswer: string;
  explanation: string;
  codeSnippet: string;
  turns: QuizTurn[];
  finished: boolean;
  createdAt: string;
}

// Use globalThis to survive Next.js dev hot reloads
const globalStore = globalThis as typeof globalThis & {
  __tempSessionStore?: Map<string, TempSession>;
  __tempStoreCleanupTimer?: ReturnType<typeof setInterval>;
};

if (!globalStore.__tempSessionStore) {
  globalStore.__tempSessionStore = new Map();
}

const store = globalStore.__tempSessionStore;

// ── TTL-based cleanup ────────────────────────────────────
function evictExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of store) {
    const age = now - new Date(session.createdAt).getTime();
    if (age > TTL_MS) {
      store.delete(id);
    }
  }
}

// Start the cleanup timer once (idempotent across hot reloads)
if (!globalStore.__tempStoreCleanupTimer) {
  globalStore.__tempStoreCleanupTimer = setInterval(evictExpiredSessions, CLEANUP_INTERVAL_MS);
  // Allow the Node.js process to exit cleanly even if the timer is active
  if (typeof globalStore.__tempStoreCleanupTimer === 'object' && 'unref' in globalStore.__tempStoreCleanupTimer) {
    globalStore.__tempStoreCleanupTimer.unref();
  }
}

// ── Public API ───────────────────────────────────────────

export function saveTempSession(sessionId: string, session: Omit<TempSession, 'turns' | 'finished' | 'createdAt'>) {
  store.set(sessionId, { ...session, turns: [], finished: false, createdAt: new Date().toISOString() });
}

export function getTempSession(sessionId: string): TempSession | undefined {
  return store.get(sessionId);
}

export function updateTempSessionTurns(sessionId: string, turns: QuizTurn[], finished: boolean) {
  const session = store.get(sessionId);
  if (!session) return;
  session.turns = turns;
  session.finished = finished;
}

export function listTempSessions(): (TempSession & { id: string; created_at: string })[] {
  return Array.from(store.entries())
    .map(([id, s]) => ({ id, ...s, created_at: s.createdAt }))
    .reverse();
}
