export type Difficulty = "easy" | "medium" | "hard";

export interface EvaluationResult {
    score: number;           // 0-100 percentage
    feedback: string;
    weakSpots: string[];     // specific things the user got wrong or skipped
    understood: boolean;     // true if score >= 80
}


export interface QuizTurn {
    question: string;
    userAnswer: string;
    score: number;
    feedback: string;
    weakSpots: string[];
    isFollowUp: boolean;
}