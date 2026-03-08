'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { evaluateAnswer } from '@/actions/evaluate-answer';
import { generateFollowUp } from '@/actions/generate-followup';
import { saveTurns } from '@/actions/save-turns';
import type { QuizTurn } from '@/types';
import CodeBlock from '@/components/ui/CodeBlock';
import ConversationTurn from '@/components/ui/ConversationTurn';
import FinalVerdict from '@/components/ui/FinalVerdict';
import LoadingLogo from '@/components/ui/LoadingLogo';
import WordReveal from '@/components/ui/WordReveal';

export interface Props {
  sessionId: string;
  question: string;
  correctAnswer: string;
  explanation: string;
  codeSnippet: string;
  language: string;
  initialTurns: QuizTurn[];
  initialFinished: boolean;
  initialFollowUp: string | null;
}

const MAX_FOLLOWUPS = 3;
const MIN_SCORE_FOR_FOLLOWUP = 10;

export default function QuizInterface({ sessionId, question, correctAnswer, explanation, codeSnippet, language, initialTurns, initialFinished, initialFollowUp }: Props) {
  const [turns, setTurns] = useState<QuizTurn[]>(initialTurns);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [generatingFollowUp, setGeneratingFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(initialFollowUp);
  const [finished, setFinished] = useState(initialFinished);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [turns, followUpQuestion, finished, generatingFollowUp, scrollToBottom]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Current question is either the initial one or a follow-up
  const activeQuestion = followUpQuestion ?? question;
  const followUpCount = turns.filter(t => t.isFollowUp).length;

  const handleSubmit = async () => {
    const text = currentAnswer.trim();
    if (!text || evaluating || generatingFollowUp) return;

    setEvaluating(true);

    const result = await evaluateAnswer(
      activeQuestion,
      correctAnswer,
      text,
      codeSnippet
    );

    const turn: QuizTurn = {
      question: activeQuestion,
      userAnswer: text,
      score: result.score,
      feedback: result.feedback,
      weakSpots: result.weakSpots,
      isFollowUp: followUpQuestion !== null,
    };

    const newTurns = [...turns, turn];
    setTurns(newTurns);
    setCurrentAnswer('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setEvaluating(false);

    // Decide: understood, too weak, or probe further?
    if (result.understood || followUpCount >= MAX_FOLLOWUPS) {
      setFinished(true);
      setFollowUpQuestion(null);
      await saveTurns(sessionId, newTurns, true, null);
    } else if (result.score < MIN_SCORE_FOR_FOLLOWUP) {
      setFinished(true);
      setFollowUpQuestion(null);
      await saveTurns(sessionId, newTurns, true, null);
    } else if (result.weakSpots.length > 0) {
      await saveTurns(sessionId, newTurns, false, null);
      setGeneratingFollowUp(true);
      const followUp = await generateFollowUp(
        activeQuestion,
        correctAnswer,
        text,
        codeSnippet,
        result.weakSpots
      );
      setFollowUpQuestion(followUp.question);
      setGeneratingFollowUp(false);
      await saveTurns(sessionId, newTurns, false, followUp.question);
    } else {
      setFinished(true);
      await saveTurns(sessionId, newTurns, true, null);
    }
  };

  // Calculate overall understanding from all turns
  const bestScore = turns.length > 0 ? Math.max(...turns.map(t => t.score)) : 0;
  const finalVerdict = bestScore >= 80 ? 'strong' : bestScore >= 30 ? 'partial' : 'weak';
  const allWeakSpots = [...new Set(turns.flatMap(t => t.weakSpots))];

  const initialCount = initialTurns.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6">
      {/* header */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">Deep Understanding Check</span>
        <span className="text-xs font-mono text-purple-400">{language}</span>
      </div>

      <CodeBlock code={codeSnippet} language={language} />

      {turns.map((turn, i) => (
        <ConversationTurn key={i} turn={turn} finished={finished} animate={i >= initialCount} />
      ))}

      {/* generating follow-up indicator */}
      {generatingFollowUp && (
        <div className="flex gap-3">
          <LoadingLogo size={48} animated />
          <div className="bg-neutral-800 rounded-lg p-4 flex-1 flex items-center gap-3">
            <LoadingLogo size={24} animated />
            <span className="text-neutral-400 text-sm">Thinking...</span>
          </div>
        </div>
      )}

      {/* active question + input (if not finished) */}
      {!finished && !generatingFollowUp && (
        <>
          {/* show current question */}
          <div className="flex gap-3">
            <LoadingLogo size={48} animated />
            <div className="bg-neutral-800 rounded-lg p-4 flex-1">
              <WordReveal key={activeQuestion} text={activeQuestion} className="text-white" />
              {followUpQuestion && (
                <span className="text-xs text-yellow-500 mt-1 inline-block">Follow-up question</span>
              )}
            </div>
          </div>

          {/* answer input */}
          <div className="ml-[3.75rem] space-y-3">
            <label htmlFor="answer-input" className="sr-only">Your answer</label>
            <textarea
              ref={textareaRef}
              id="answer-input"
              rows={1}
              value={currentAnswer}
              onChange={handleTextareaChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="Explain your understanding..."
              disabled={evaluating}
              style={{ resize: 'none', overflow: 'hidden' }}
              className="w-full px-5 py-3 rounded-2xl bg-neutral-900/80 border border-neutral-700 text-neutral-100 font-sans text-base leading-7 shadow-sm focus:shadow-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:outline-none transition-all duration-200 placeholder:text-neutral-500 placeholder:italic disabled:opacity-60 disabled:cursor-not-allowed scrollbar-hide"
            />
            <button
              onClick={handleSubmit}
              disabled={!currentAnswer.trim() || evaluating}
              className="w-full py-3 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {evaluating ? <><LoadingLogo size={22} /> Evaluating</> : 'Submit Answer'}
            </button>
          </div>
        </>
      )}

      {finished && (
        <FinalVerdict
          verdict={finalVerdict}
          bestScore={bestScore}
          weakSpots={allWeakSpots}
          explanation={explanation}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}