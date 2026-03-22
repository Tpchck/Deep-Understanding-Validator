-- Add dynamic difficulty level column
-- Run this in Supabase SQL Editor

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT null;
