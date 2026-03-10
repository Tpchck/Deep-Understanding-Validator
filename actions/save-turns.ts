'use server';

import type { QuizTurn } from '@/types';
import { updateTempSessionTurns } from '@/lib/temp-store';
import { createClient } from '@/lib/supabase/server';

const isTempStoreMode = () => process.env.STORAGE_MODE === 'temp';

export async function saveTurns(
  sessionId: string,
  turns: QuizTurn[],
  finished: boolean,
  followUpQuestion: string | null = null,
  initialQuestionText: string | null = null
) {
  if (isTempStoreMode()) {
    updateTempSessionTurns(sessionId, turns, finished);
    return;
  }

  const supabase = await createClient();
  const updateData: Record<string, unknown> = {
    turns: turns as unknown as Record<string, unknown>[],
    finished,
    follow_up_question: followUpQuestion,
  };

  if (initialQuestionText) {
    updateData.question_text = initialQuestionText;
  }

  const { error, data } = await supabase
    .from('questions')
    .update(updateData)
    .eq('id', sessionId)
    .select('id');

  if (error) {
    console.error('[save-turns] DB update error:', error);
  } else if (!data || data.length === 0) {
    console.error('[save-turns] No rows updated — check RLS UPDATE policy for session:', sessionId);
  }
}
