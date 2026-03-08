'use client';

import { Fragment } from 'react';

interface WordRevealProps {
  text: string;
  className?: string;
  delayMs?: number;
}

export default function WordReveal({ text, className = '', delayMs = 30 }: WordRevealProps) {
  const words = text.split(/\s+/);

  return (
    <span className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span
            className="inline-block opacity-0 animate-word-reveal"
            style={{ animationDelay: `${i * delayMs}ms` }}
          >
            {word}
          </span>
          {' '}
        </Fragment>
      ))}
    </span>
  );
}
