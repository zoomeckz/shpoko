
-- Reset all user progress
UPDATE public.profiles
SET xp = 0,
    level = 1,
    streak = 0,
    last_activity_date = NULL,
    streak_freeze_used_at = NULL;

-- Clear lesson progress
DELETE FROM public.user_progress;

-- Clear deep-dive progress
DELETE FROM public.deep_dive_progress;

-- Reset weekly league XP
UPDATE public.user_leagues
SET week_xp = 0;

-- Update leaderboard function to exclude users with 0 XP
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count integer DEFAULT 50)
 RETURNS TABLE(id uuid, username text, xp integer, level integer, streak integer, is_premium boolean, profile_picture text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.xp,
    p.level,
    p.streak,
    p.is_premium,
    p.profile_picture
  FROM public.profiles p
  WHERE p.xp > 0
  ORDER BY p.xp DESC
  LIMIT limit_count;
$function$;
