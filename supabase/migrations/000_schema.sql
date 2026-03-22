DROP TABLE IF EXISTS public.questions CASCADE;

CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  question_text text NOT NULL,
  code_snippet text,
  options text[] NOT NULL,
  correct_option_index smallint NOT NULL,
  explanation text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'pending')),
  difficulty_level text DEFAULT 'pending',
  language text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid,
  turns jsonb NOT NULL DEFAULT '[]'::jsonb,
  finished boolean NOT NULL DEFAULT false,
  follow_up_question text DEFAULT null,
  CONSTRAINT questions_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_questions_user ON public.questions(user_id);
CREATE INDEX idx_questions_session ON public.questions(session_id);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own questions"
  ON public.questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
  ON public.questions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions"
  ON public.questions FOR DELETE
  USING (auth.uid() = user_id);
