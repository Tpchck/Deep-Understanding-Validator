// XSS sanitize util
import DOMPurify from 'isomorphic-dompurify';
import type { Difficulty } from "@/types";

export const sanitizeHtml = (dirty: string) => DOMPurify.sanitize(dirty);

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
