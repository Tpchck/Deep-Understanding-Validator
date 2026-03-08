import { sanitizeHtml } from '../../lib/utils';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 font-mono border-b border-gray-700">
        {language.toLowerCase()}
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-green-400">
        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(code) }} />
      </pre>
    </div>
  );
}
