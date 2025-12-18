-- Add category to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN category text DEFAULT 'general';

-- Add unique constraint for weekly rating (user can only rate once per week per quiz)
-- We'll handle this in the application logic by checking created_at

-- Create index for category filtering
CREATE INDEX idx_quizzes_category ON public.quizzes(category);

-- Create index for faster leaderboard queries
CREATE INDEX idx_quiz_feedback_quiz_rating ON public.quiz_feedback(quiz_id, rating);
CREATE INDEX idx_quiz_feedback_created_at ON public.quiz_feedback(created_at);

-- Add updated_at column to quiz_feedback to track rating updates
ALTER TABLE public.quiz_feedback 
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Function to calculate weekly top quiz
CREATE OR REPLACE FUNCTION public.get_weekly_top_quiz()
RETURNS TABLE(
  quiz_id uuid,
  quiz_title text,
  creator_id uuid,
  avg_rating numeric,
  rating_count bigint
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT 
    q.id as quiz_id,
    q.title as quiz_title,
    q.creator_id,
    ROUND(AVG(f.rating)::numeric, 2) as avg_rating,
    COUNT(f.id) as rating_count
  FROM public.quizzes q
  JOIN public.quiz_feedback f ON f.quiz_id = q.id
  WHERE q.is_public = true
    AND f.created_at >= date_trunc('week', now())
  GROUP BY q.id, q.title, q.creator_id
  HAVING COUNT(f.id) >= 3
  ORDER BY AVG(f.rating) DESC, COUNT(f.id) DESC
  LIMIT 1;
$$;