-- Add language column to quizzes table for filtering by language
ALTER TABLE public.quizzes 
ADD COLUMN language TEXT NOT NULL DEFAULT 'english';

-- Create index for language filtering
CREATE INDEX idx_quizzes_language ON public.quizzes(language);