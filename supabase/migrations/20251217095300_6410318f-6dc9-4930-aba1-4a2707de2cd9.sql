-- Create enum for question types
CREATE TYPE public.quiz_question_type AS ENUM ('choose_word', 'fill_blank');

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_timed BOOLEAN NOT NULL DEFAULT false,
  time_limit_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type quiz_question_type NOT NULL DEFAULT 'choose_word',
  correct_answer TEXT NOT NULL,
  options TEXT[] DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz feedback table
CREATE TABLE public.quiz_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, user_id)
);

-- Create quiz attempts table to track who played
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
CREATE POLICY "Users can view their own quizzes"
ON public.quizzes FOR SELECT
USING (auth.uid() = creator_id);

CREATE POLICY "Users can view public quizzes"
ON public.quizzes FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can create their own quizzes"
ON public.quizzes FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own quizzes"
ON public.quizzes FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own quizzes"
ON public.quizzes FOR DELETE
USING (auth.uid() = creator_id);

-- Quiz questions policies
CREATE POLICY "Users can view questions of their own quizzes"
ON public.quiz_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_questions.quiz_id 
    AND quizzes.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can view questions of public quizzes"
ON public.quiz_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_questions.quiz_id 
    AND quizzes.is_public = true
  )
);

CREATE POLICY "Users can create questions for their own quizzes"
ON public.quiz_questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_questions.quiz_id 
    AND quizzes.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can update questions for their own quizzes"
ON public.quiz_questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_questions.quiz_id 
    AND quizzes.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can delete questions for their own quizzes"
ON public.quiz_questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_questions.quiz_id 
    AND quizzes.creator_id = auth.uid()
  )
);

-- Quiz feedback policies
CREATE POLICY "Users can view feedback on their own quizzes"
ON public.quiz_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_feedback.quiz_id 
    AND quizzes.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own feedback"
ON public.quiz_feedback FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave feedback on public quizzes"
ON public.quiz_feedback FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_feedback.quiz_id 
    AND quizzes.is_public = true
  )
);

CREATE POLICY "Users can update their own feedback"
ON public.quiz_feedback FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
ON public.quiz_feedback FOR DELETE
USING (auth.uid() = user_id);

-- Quiz attempts policies
CREATE POLICY "Users can view their own attempts"
ON public.quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Quiz creators can view attempts on their quizzes"
ON public.quiz_attempts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_attempts.quiz_id 
    AND quizzes.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can record their own attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger for quizzes
CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();