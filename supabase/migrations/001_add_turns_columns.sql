-- Add chat history columns to questions table
-- Run this in Supabase SQL Editor

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS turns jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS finished boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_question text DEFAULT null;
