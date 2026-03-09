'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { evaluateAnswer } from '@/actions/evaluate-answer';
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
  explanation: string;
  codeSnippet: string;
  language: string;
  initialTurns: QuizTurn[];
  initialFinished: boolean;
  initialFollowUp: string | null;
}

const MAX_FOLLOWUPS = 3;
const MIN_SCORE_FOR_FOLLOWUP = 20;

export default function QuizInterface({ sessionId, question, explanation, codeSnippet, language, initialTurns, initialFinished, initialFollowUp }: Props) {
  const [turns, setTurns] = useState<QuizTurn[]>(initialTurns);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(initialFollowUp);
  const [finished, setFinished] = useState(initialFinished);
  const [activeQuestionState, setActiveQuestionState] = useState(question);
  const [isRejected, setIsRejected] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { complete: completeInitial, completion: initialCompletion, isLoading: generatingInitial } = useCompletion({
    api: '/api/generate-question',
    id: 'initial_question',
    streamProtocol: 'text',
    body: { sessionId }, // Pass sessionId so server saves the question to DB
    onFinish: async (_prompt, result) => {
      if (result.startsWith("REJECTED:")) {
        setIsRejected(true);
      } else {
        setActiveQuestionState(result);
        // Question is now persisted server-side via onFinish in the route
      }
    }
  });

  const hasRequestedInitial = useRef(false);

  useEffect(() => {
    if (!question && !activeQuestionState && !hasRequestedInitial.current && !isRejected) {
      hasRequestedInitial.current = true;
      completeInitial(codeSnippet);
    }
  }, [question, activeQuestionState, isRejected, codeSnippet, completeInitial]);

  const turnsRef = useRef(turns);
  useEffect(() => { turnsRef.current = turns; }, [turns]);

  const { complete, completion, isLoading: generatingFollowUp, setCompletion } = useCompletion({
    api: '/api/followup',
    id: 'followup_question',
    streamProtocol: 'text',
    onFinish: async (prompt, result) => {
      setFollowUpQuestion(result);
      await saveTurns(sessionId, turnsRef.current, false, result);
    },
    onError: async (err) => {
      console.error(err);
      const fallback = "A network error occurred. Could you explain that in more detail?";
      setFollowUpQuestion(fallback);
      await saveTurns(sessionId, turnsRef.current, false, fallback);
    }
  });

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [turns, followUpQuestion, finished, generatingFollowUp, completion, scrollToBottom]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Current question is either the initial one or a follow-up
  const activeQuestion = followUpQuestion ?? activeQuestionState ?? initialCompletion;
  const followUpCount = turns.filter(t => t.isFollowUp).length;

  const handleSubmit = async () => {
    const text = currentAnswer.trim();
    if (!text || evaluating || generatingFollowUp) return;

    setEvaluating(true);

    const result = await evaluateAnswer(
      activeQuestion,
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
    const saveQuestionText = turns.length === 0 ? activeQuestionState : null;

    if (result.understood || followUpCount >= MAX_FOLLOWUPS) {
      // Clearly understood or ran out of follow-ups
      setFinished(true);
      setFollowUpQuestion(null);
      await saveTurns(sessionId, newTurns, true, null, saveQuestionText);
    } else if (result.score < MIN_SCORE_FOR_FOLLOWUP) {
      // Score too low — student doesn't know enough for a meaningful follow-up
      setFinished(true);
      setFollowUpQuestion(null);
      await saveTurns(sessionId, newTurns, true, null, saveQuestionText);
    } else {
      // Score 20-79: partial understanding — always probe further
      const spots = result.weakSpots.length > 0
        ? result.weakSpots
        : ['Partial understanding — needs deeper explanation'];
      setFollowUpQuestion(null);
      setCompletion('');
      await saveTurns(sessionId, newTurns, false, null, saveQuestionText);
      complete(JSON.stringify({
        originalQuestion: activeQuestion,
        userAnswer: text,
        codeSnippet,
        weakSpots: spots
      }));
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

      {/* generating follow-up indicator or streaming text */}
      {generatingFollowUp && (
        <div className="flex gap-3">
          <LoadingLogo size={48} animated />
          <div className="bg-neutral-800 rounded-lg p-4 flex-1">
            {completion ? (
              <>
                <p className="text-white">{completion}</p>
                <span className="text-xs text-yellow-500 mt-1 inline-block">Follow-up question</span>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <LoadingLogo size={24} animated />
                <span className="text-neutral-400 text-sm">Thinking...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* active question + input (if not finished) */}
      {!finished && !generatingFollowUp && !isRejected && (
        <>
          {/* show current question */}
          <div className="flex gap-3">
            <LoadingLogo size={48} animated={generatingInitial} />
            <div className="bg-neutral-800 rounded-lg p-4 flex-1">
              {activeQuestion ? (
                <WordReveal key={turns.length} text={activeQuestion} className="text-white" />
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400 text-sm">Analyzing code and generating question...</span>
                </div>
              )}
              {followUpQuestion && (
                <span className="text-xs text-yellow-500 mt-1 inline-block">Follow-up question</span>
              )}
            </div>
          </div>

          {/* answer input */}
          {!generatingInitial && activeQuestion && (
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
          )}
        </>
      )}

      {isRejected && (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-700 text-red-400 text-sm">
          {activeQuestionState || initialCompletion || "This doesn't look like code. Please go back and paste a valid code snippet."}
        </div>
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