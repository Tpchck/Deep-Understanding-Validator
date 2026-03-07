/**
 * Minimum number of characters required for a valid code submission.
 */
export const MIN_CODE_LENGTH = 10;

/**
 * Languages supported by the AI analysis engine.
 */
export const SUPPORTED_LANGUAGES = ["C++", "Python", "Java"] as const;

/**
 * Validates that the submitted code meets minimum requirements.
 * Returns an error message if invalid, or null if valid.
 */
export function validateCodeSubmission(code: string | null): string | null {
    if (!code || code.trim().length === 0) {
        return "Code cannot be empty";
    }
    if (code.trim().length < MIN_CODE_LENGTH) {
        return `Code must be at least ${MIN_CODE_LENGTH} characters`;
    }
    return null;
}

/**
 * Formats a difficulty string for display (capitalizes first letter).
 */
export function formatDifficulty(difficulty: string): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
}