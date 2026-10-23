-- 1) Privacy. Nobody can read other people's data any more, apart from admins
--    (who go through the admin-accounts edge function or is_site_admin()).

-- The leaderboard view ran with its owner's rights, so any logged-in user could
-- read every profile through it. Now it follows the normal rules (own row only).
ALTER VIEW IF EXISTS public.leaderboard_view SET (security_invoker = true);

-- The leaderboard function is only for logged-in users, never for visitors.
REVOKE EXECUTE ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated;

-- Badges and league rows were readable by anyone, including people not logged in.
DROP POLICY IF EXISTS "Anyone can view badges for leaderboard" ON public.user_badges;
DROP POLICY IF EXISTS "Users can view all league participants" ON public.user_leagues;
DROP POLICY IF EXISTS "Users can view their own league data" ON public.user_leagues;
CREATE POLICY "Users can view their own league data"
ON public.user_leagues FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Hall of fame and the old forum: logged-in users only.
DROP POLICY IF EXISTS "Hall of fame is viewable by everyone" ON public.hall_of_fame;
CREATE POLICY "Hall of fame is viewable by everyone"
ON public.hall_of_fame FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view threads" ON public.forum_threads;
CREATE POLICY "Anyone can view threads" ON public.forum_threads FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Anyone can view posts" ON public.forum_posts;
CREATE POLICY "Anyone can view posts" ON public.forum_posts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Anyone can view votes" ON public.forum_votes;
CREATE POLICY "Anyone can view votes" ON public.forum_votes FOR SELECT TO authenticated USING (true);

-- True for the site owner and for users with the admin role.
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = 'sam.nowroozi@gmail.com'
      OR public.has_role(auth.uid(), 'admin')
$$;

-- 2) "Report a problem" from inside a lesson.
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  exercise_index INTEGER NOT NULL,
  -- The exercise exactly as it was shown, so the report still makes sense after edits.
  exercise JSONB NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('answer', 'bulgarian', 'unclear', 'typo', 'other')),
  message TEXT CHECK (char_length(message) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can send reports" ON public.content_reports;
CREATE POLICY "Users can send reports"
ON public.content_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'open' AND resolved_at IS NULL);

DROP POLICY IF EXISTS "Users can see their own reports" ON public.content_reports;
CREATE POLICY "Users can see their own reports"
ON public.content_reports FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read reports" ON public.content_reports;
CREATE POLICY "Admins can read reports"
ON public.content_reports FOR SELECT
TO authenticated
USING (public.is_site_admin());

DROP POLICY IF EXISTS "Admins can resolve reports" ON public.content_reports;
CREATE POLICY "Admins can resolve reports"
ON public.content_reports FOR UPDATE
TO authenticated
USING (public.is_site_admin())
WITH CHECK (public.is_site_admin());

DROP POLICY IF EXISTS "Admins can delete reports" ON public.content_reports;
CREATE POLICY "Admins can delete reports"
ON public.content_reports FOR DELETE
TO authenticated
USING (public.is_site_admin());

CREATE INDEX IF NOT EXISTS content_reports_status_idx ON public.content_reports (status, created_at DESC);

-- 3) Profile: daily goal, reminders, longest streak and XP per day.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_goal INTEGER NOT NULL DEFAULT 20 CHECK (daily_goal BETWEEN 1 AND 500),
  ADD COLUMN IF NOT EXISTS reminder_time TIME,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;

UPDATE public.profiles SET longest_streak = streak WHERE longest_streak < streak;

CREATE TABLE IF NOT EXISTS public.daily_xp (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The learner's own calendar day.
  day DATE NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  PRIMARY KEY (user_id, day)
);

ALTER TABLE public.daily_xp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily XP" ON public.daily_xp;
CREATE POLICY "Users can view their own daily XP"
ON public.daily_xp FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add their own daily XP" ON public.daily_xp;
CREATE POLICY "Users can add their own daily XP"
ON public.daily_xp FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.account_is_active(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own daily XP" ON public.daily_xp;
CREATE POLICY "Users can update their own daily XP"
ON public.daily_xp FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND public.account_is_active(auth.uid()));

-- Adds XP to one day in a single step (no lost updates when two saves overlap).
CREATE OR REPLACE FUNCTION public.add_daily_xp(_day DATE, _xp INTEGER)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  INSERT INTO public.daily_xp (user_id, day, xp)
  VALUES (auth.uid(), _day, greatest(_xp, 0))
  ON CONFLICT (user_id, day) DO UPDATE SET xp = public.daily_xp.xp + greatest(EXCLUDED.xp, 0)
$$;

REVOKE EXECUTE ON FUNCTION public.add_daily_xp(DATE, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_daily_xp(DATE, INTEGER) TO authenticated;

-- Achievements reuse user_badges (badge_id like "wildfire-2"). Only active accounts can earn them.
DROP POLICY IF EXISTS "Only active accounts can earn badges" ON public.user_badges;
CREATE POLICY "Only active accounts can earn badges"
ON public.user_badges AS RESTRICTIVE FOR INSERT
TO authenticated
WITH CHECK (public.account_is_active(auth.uid()));
