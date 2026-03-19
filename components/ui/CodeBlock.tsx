import React from 'react';
import Prism from "prismjs";
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  // Use JS as a universal syntax highlighter if exact language is unknown
  // This provides styling for keywords, strings, etc. regardless of language
  const highlighted = Prism.highlight(code, Prism.languages.javascript, 'javascript');

  return (
    <div className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700 shadow-lg">
      <div className="bg-neutral-800/80 px-4 py-2 text-xs text-neutral-400 font-mono border-b border-neutral-700">
        {language.toLowerCase()}
      </div>
      <pre 
        className="p-4 overflow-x-auto text-sm font-mono leading-6"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
