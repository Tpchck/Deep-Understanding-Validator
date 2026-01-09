export type Difficulty = "easy" | "medium" | "hard";
export interface Question {
    id: string;
    text: string;
    codeSnippet?:string;
    options: string[];
    correctAnswer:number;
    explanation: string;
}

export interface AIResponse{
    language: string;
    difficulty: Difficulty;
    topics: string[];
    questions: Question[];
}