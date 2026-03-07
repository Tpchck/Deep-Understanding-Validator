export interface QuestionRow {
    id: string;
    created_at: string;
    question_text: string;
    code_snippet: string;
    options: string[];
    correct_option_index: number;
    explanation: string;
    difficulty: string;
    language: string;
}

export interface Database {
    public: {
        Tables: {
            questions: {
                Row: QuestionRow;
                Insert: Omit<QuestionRow, "id" | "created_at">;
                Update: Partial<Omit<QuestionRow, "id" | "created_at">>;
            };
        };
    };
}