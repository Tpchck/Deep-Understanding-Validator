// XSS sanitize util
import DOMPurify from 'dompurify';
import type { Difficulty } from "@/types";

export const sanitizeHtml = (dirty: string) => {
  if (typeof window === 'undefined') {
    return dirty;
  }
  return DOMPurify.sanitize(dirty);
};

const MIN_CODE_LENGTH = 10;
const MAX_CODE_LENGTH = 10_000;

/**
 * Validate a code submission string.
 * Returns `{ valid: true }` or `{ valid: false, error: string }`.
 */
export function validateCodeSubmission(
  code: unknown
): { valid: true } | { valid: false; error: string } {
  if (typeof code !== "string" || code.trim().length === 0) {
    return { valid: false, error: "Code is required" };
  }
  if (code.trim().length < MIN_CODE_LENGTH) {
    return { valid: false, error: "Code is too short (minimum 10 characters)" };
  }
  if (code.length > MAX_CODE_LENGTH) {
    return { valid: false, error: "Code is too long (maximum 10 000 characters)" };
  }
  return { valid: true };
}

const CODE_PATTERNS = [
  /[{};]/,
  /\b(function|def|class|return|import|export|const|let|var|if|else|for|while|switch|try|catch|void|int|float|double|char|string|bool|public|private|static|new|this|self|print|console|include|using|namespace|struct|enum|interface|type|abstract|override|virtual|async|await)\b/i,
  /[=!<>]=|&&|\|\||=>|->|::/,
  /\/\/|#|\/\*|\*\//,
  /^\s*(\w+\s+)+\w+\s*\(/m,
  /[\[\]].*[;=]/,
];

const PROSE_PATTERNS = [
  /\b(explain|describe|how|why|what|could|would|should|please|discuss|analyze|compare)\b/gi,
  /[.!?]\s+[A-Z]/g,
  /\b(the|is|are|was|were|been|being|have|has|had|do|does|did|will|shall|may|might|can|could|would|should)\b/gi,
];

export function looksLikeCode(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < MIN_CODE_LENGTH) return false;

  let codeHits = 0;
  for (const pattern of CODE_PATTERNS) {
    if (pattern.test(trimmed)) codeHits++;
  }

  // Count prose indicators
  let proseWordCount = 0;
  for (const pattern of PROSE_PATTERNS) {
    const matches = trimmed.match(pattern);
    if (matches) proseWordCount += matches.length;
  }

  const words = trimmed.split(/\s+/).length;
  const proseRatio = proseWordCount / words;

  // High prose ratio = natural language, not code
  if (proseRatio > 0.3 && codeHits < 3) return false;

  // Code needs structural indicators, not just keyword mentions in prose
  const hasMultiLineStructure = trimmed.includes('\n') && /^\s+/m.test(trimmed);
  const hasBracesOrSemicolons = /[{};]/.test(trimmed);
  const hasAssignment = /\w\s*=\s*[^=]/.test(trimmed);

  if (codeHits >= 3) return true;
  if (codeHits >= 2 && (hasMultiLineStructure || hasBracesOrSemicolons || hasAssignment)) return true;

  return false;
}

/** Capitalize difficulty for display: "easy" → "Easy" */
export function formatDifficulty(d: Difficulty): string {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

// ── Language detection ─────────────────────────────────

interface LangRule {
  lang: string;
  patterns: RegExp[];
  weight?: number;
}

const LANG_RULES: LangRule[] = [
  { lang: 'Python',     patterns: [/\bdef\s+\w+\s*\(/, /\bimport\s+\w+/, /\bprint\s*\(/, /\belif\b/, /:\s*\n\s+/] },
  { lang: 'Java',       patterns: [/\bpublic\s+(class|static|void)\b/, /System\.(out|err)/, /\bString\s*\[/, /\bStringB(uffer|uilder)\b/, /\bimport\s+java\./] },
  { lang: 'JavaScript', patterns: [/\bconst\s+\w+\s*=/, /\bfunction\s+\w+\s*\(/, /=>\s*[{(]/, /console\.(log|error|warn)/, /\brequire\s*\(/, /\.addEventListener/] },
  { lang: 'TypeScript', patterns: [/:\s*(string|number|boolean|void)\b/, /\binterface\s+\w+/, /\btype\s+\w+\s*=/, /<\w+>/, /\bas\s+\w+/] },
  { lang: 'C++',        patterns: [/#include\s*</, /\bstd::/, /\bcout\b/, /\bcin\b/, /\bvector\s*</, /\busing\s+namespace\b/] },
  { lang: 'C',          patterns: [/#include\s*<stdio/, /\bprintf\s*\(/, /\bscanf\s*\(/, /\bmalloc\s*\(/, /\bvoid\s*\*/], weight: 0.8 },
  { lang: 'C#',         patterns: [/\busing\s+System/, /\bnamespace\s+\w+/, /\bConsole\.(Write|Read)/, /\bvar\s+\w+\s*=/] },
  { lang: 'Go',         patterns: [/\bfunc\s+\w+\s*\(/, /\bpackage\s+main\b/, /\bfmt\./, /\bgo\s+func\b/, /:=\s*/] },
  { lang: 'Rust',       patterns: [/\bfn\s+\w+\s*\(/, /\blet\s+mut\b/, /\bimpl\s+\w+/, /\bpub\s+fn\b/, /\b->/, /println!\s*\(/] },
  { lang: 'PHP',        patterns: [/<\?php/, /\$\w+\s*=/, /\$this->/, /\becho\s+/, /\bfunction\s+\w+\s*\(/], weight: 1 },
  { lang: 'Ruby',       patterns: [/\bdef\s+\w+/, /\bend\b/, /\bputs\s+/, /\battr_(reader|writer|accessor)\b/, /\bdo\s*\|/], weight: 0.9 },
  { lang: 'SQL',        patterns: [/\bSELECT\b.*\bFROM\b/i, /\bCREATE\s+TABLE\b/i, /\bINSERT\s+INTO\b/i, /\bALTER\s+TABLE\b/i] },
  { lang: 'Kotlin',     patterns: [/\bfun\s+\w+\s*\(/, /\bval\s+\w+/, /\bvar\s+\w+/, /\bprintln\s*\(/, /\bdata\s+class\b/] },
  { lang: 'Swift',      patterns: [/\bfunc\s+\w+\s*\(/, /\bvar\s+\w+\s*:/, /\blet\s+\w+\s*:/, /\bprint\s*\(/, /\bguard\s+let\b/] },
  { lang: 'HTML',       patterns: [/<!DOCTYPE\s+html>/i, /<html\b/i, /<head\b/i, /<body\b/i, /<div\b/, /<span\b/, /<\/.*?>/] },
  { lang: 'CSS',        patterns: [/[.#]\w+\s*\{/, /margin:\s*\d+/, /padding:\s*\d+/, /color:\s*#/, /display:\s*(flex|grid|block)/, /@media\b/] },
  { lang: 'TSX',        patterns: [/\bimport\s+.*from\s+['"]react['"]/, /<\w+.*>/, /className=/, /\binterface\s+\w+/, /\btype\s+\w+\s*=/], weight: 1.2 },
];

/**
 * Detect the programming language from code using keyword heuristics.
 * Returns a human-readable language name (e.g. "Java", "Python").
 */
export function detectLanguage(code: string): string {
  const scores: Record<string, number> = {};

  for (const rule of LANG_RULES) {
    let hits = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(code)) hits++;
    }
    if (hits > 0) {
      scores[rule.lang] = hits * (rule.weight ?? 1);
    }
  }

  const entries = Object.entries(scores);
  if (entries.length === 0) return 'Unknown';

  // Sort by score descending; if tied, prefer languages higher in the list
  entries.sort((a, b) => b[1] - a[1]);

  // Resolve TypeScript vs JavaScript: if both match, TS needs >= 2 unique TS patterns
  if (entries[0][0] === 'TypeScript' && scores['JavaScript'] && scores['TypeScript'] < 2) {
    return 'JavaScript';
  }
  // Resolve C vs C++: if both match, prefer C++
  if (entries[0][0] === 'C' && scores['C++']) {
    return 'C++';
  }
  // Resolve TSX vs HTML
  if (entries[0][0] === 'HTML' && scores['TSX']) {
    return 'TSX';
  }

  return entries[0][0];
}
