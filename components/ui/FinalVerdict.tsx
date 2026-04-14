'use client';

import { useState } from 'react';
import Link from 'next/link';

type Verdict = 'strong' | 'partial' | 'weak';

interface FinalVerdictProps {
  verdict: Verdict;
  bestScore: number;
  weakSpots: string[];
  explanation: string;
}

export default function FinalVerdict({ verdict, bestScore, weakSpots, explanation }: FinalVerdictProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const borderColor = verdict === 'strong' ? 'border-green-700'
    : verdict === 'partial' ? 'border-yellow-700'
    : 'border-red-700';

  const bgColor = verdict === 'strong' ? 'bg-green-900/20'
    : verdict === 'partial' ? 'bg-yellow-900/20'
    : 'bg-red-900/20';

  return (
    <div className={`p-6 rounded-lg border ${bgColor} ${borderColor}`}>
      <h3 className="text-xl font-bold mb-1">
        {verdict === 'strong' ? 'You understand this code well.'
          : verdict === 'partial' ? 'You have a partial understanding.'
          : 'Your understanding needs work.'}
      </h3>
      <p className="text-sm text-neutral-400 mb-4">Best score: {bestScore}%</p>

      {verdict === 'weak' && weakSpots.length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-red-950/40 border border-red-900">
          <p className="text-sm font-semibold text-red-300 mb-2">
            You should review these topics before trying again:
          </p>
          <ul className="space-y-1.5">
            {weakSpots.map((spot, i) => (
              <li key={i} className="flex gap-2 text-sm text-red-200">
                <span className="text-red-400 shrink-0">→</span>
                {spot}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!showExplanation ? (
        <button
          onClick={() => setShowExplanation(true)}
          className="text-purple-400 hover:underline text-sm"
        >
          Show full explanation
        </button>
      ) : (
        <div className="border-t border-neutral-700 pt-4 mt-2">
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Full Explanation</p>
          <p className="text-gray-300 leading-relaxed text-sm">{explanation}</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-neutral-700">
        <Link href="/dashboard/new" className="text-purple-400 hover:underline text-sm">
          ← Try another snippet
        </Link>
      </div>
    </div>
  );
}
