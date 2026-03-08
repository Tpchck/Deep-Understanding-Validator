export type Difficulty = "easy" | "medium" | "hard";
export interface Question {
    id: string;
    text: string;
    codeSnippet?:string;
    correctAnswer: string;
    explanation: string;
}

export interface AIResponse{
    language: string;
    difficulty: Difficulty;
    topics: string[];
    questions: Question[];
    rejected?: boolean;
    rejectionMessage?: string;
}

export interface EvaluationResult {
    score: number;           // 0-100 percentage
    feedback: string;
    weakSpots: string[];     // specific things the user got wrong or skipped
    understood: boolean;     // true if score >= 30
}

export interface FollowUpResult {
    question: string;
    targetWeakness: string;  // what this follow-up is probing
}

export interface QuizTurn {
    question: string;
    userAnswer: string;
    score: number;
    feedback: string;
    weakSpots: string[];
    isFollowUp: boolean;
}