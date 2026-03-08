import type { Difficulty, QuizTurn } from "./index";

/** Row shape returned by `supabase.from("questions").select("*")` */
export interface QuestionRow {
  id: string;
  question_text: string;
  code_snippet: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  difficulty: Difficulty;
  language: string;
  created_at: string;
  user_id: string | null;
  session_id: string | null;
  turns: QuizTurn[];
  finished: boolean;
  follow_up_question: string | null;
}

/** Minimal Supabase-style Database type used for client generics */
export interface Database {
  public: {
    Tables: {
      questions: {
        Row: QuestionRow;
        Insert: Omit<QuestionRow, "id" | "created_at">;
        Update: Partial<Omit<QuestionRow, "id">>;
      };
    };
  };
}
