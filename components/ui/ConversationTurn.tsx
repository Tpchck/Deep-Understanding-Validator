import { sanitizeHtml } from '../../lib/utils';
import type { QuizTurn } from '@/types';
import LoadingLogo from '@/components/ui/LoadingLogo';
import WordReveal from '@/components/ui/WordReveal';

interface ConversationTurnProps {
  turn: QuizTurn;
  finished: boolean;
  animate?: boolean;
}

function scoreColor(score: number) {
  if (score >= 80) return { bg: 'bg-green-900/20 border-green-800', text: '#4ade80' };
  if (score >= 30) return { bg: 'bg-yellow-900/20 border-yellow-700', text: '#facc15' };
  return { bg: 'bg-red-900/20 border-red-800', text: '#f87171' };
}

export default function ConversationTurn({ turn, finished, animate = false }: ConversationTurnProps) {
  const colors = scoreColor(turn.score);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <LoadingLogo size={48} animated />
        <div className="bg-neutral-800 rounded-lg p-4 flex-1">
          {animate
            ? <WordReveal text={turn.question} className="text-white" />
            : <p className="text-white" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: sanitizeHtml(turn.question) }} />
          }
          {turn.isFollowUp && (
            <span className="text-xs text-yellow-500 mt-1 inline-block">Follow-up question</span>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <div className="bg-purple-900/30 border border-purple-800 rounded-lg p-4 max-w-[85%]">
          <span className="text-purple-100" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: sanitizeHtml(turn.userAnswer) }} />
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center text-xs font-bold shrink-0">
          You
        </div>
      </div>

      <div className={`p-4 rounded-lg border ml-[3.75rem] ${colors.bg}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl font-bold" style={{ color: colors.text }}>
            {turn.score}%
          </div>
          <div className="text-sm text-neutral-400">understanding</div>
        </div>
        {animate
          ? <WordReveal text={turn.feedback} className="text-gray-300 text-sm leading-relaxed" />
          : <p className="text-gray-300 text-sm leading-relaxed">{turn.feedback}</p>
        }
        {turn.weakSpots.length > 0 && !finished && (
          <div className="mt-3 pt-3 border-t border-neutral-700">
            <p className="text-xs text-neutral-500 mb-1">Gaps detected:</p>
            <ul className="text-xs text-neutral-400 space-y-1">
              {turn.weakSpots.map((spot, j) => (
                <li key={j} className="flex gap-1.5">
                  <span className="text-red-400">-</span> {spot}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
