-- 1) "Practice your mistakes": which exercises each learner got wrong.
-- An exercise is identified by its lesson and its position in that lesson.
CREATE TABLE IF NOT EXISTS public.user_mistakes (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  exercise_index INTEGER NOT NULL,
  misses INTEGER NOT NULL DEFAULT 1,
  last_missed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id, exercise_index)
);

ALTER TABLE public.user_mistakes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mistakes" ON public.user_mistakes;
CREATE POLICY "Users can view their own mistakes"
ON public.user_mistakes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add their own mistakes" ON public.user_mistakes;
CREATE POLICY "Users can add their own mistakes"
ON public.user_mistakes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.account_is_active(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own mistakes" ON public.user_mistakes;
CREATE POLICY "Users can update their own mistakes"
ON public.user_mistakes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND public.account_is_active(auth.uid()));

DROP POLICY IF EXISTS "Users can clear their own mistakes" ON public.user_mistakes;
CREATE POLICY "Users can clear their own mistakes"
ON public.user_mistakes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Counts a miss in one step (a second miss of the same exercise adds 1).
CREATE OR REPLACE FUNCTION public.record_mistake(_lesson_id TEXT, _exercise_index INTEGER)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  INSERT INTO public.user_mistakes (user_id, lesson_id, exercise_index)
  VALUES (auth.uid(), _lesson_id, _exercise_index)
  ON CONFLICT (user_id, lesson_id, exercise_index)
  DO UPDATE SET misses = public.user_mistakes.misses + 1, last_missed_at = now()
$$;

REVOKE EXECUTE ON FUNCTION public.record_mistake(TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_mistake(TEXT, INTEGER) TO authenticated;

-- 2) Admin overview: admins can read everyone's XP per day for the activity chart.
DROP POLICY IF EXISTS "Admins can read daily XP" ON public.daily_xp;
CREATE POLICY "Admins can read daily XP"
ON public.daily_xp FOR SELECT
TO authenticated
USING (public.is_site_admin());
