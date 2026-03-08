// ⚠️ TEMPORARY: in-memory store while Supabase is down
// TODO: Remove this file once Supabase is back up

import type { QuizTurn } from "@/types";

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
};

if (!globalStore.__tempSessionStore) {
  globalStore.__tempSessionStore = new Map();
}

const store = globalStore.__tempSessionStore;

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
