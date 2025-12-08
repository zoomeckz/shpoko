-- First add the column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_picture text DEFAULT 'happy';

-- Drop and recreate the function
DROP FUNCTION IF EXISTS public.get_leaderboard(integer);

CREATE FUNCTION public.get_leaderboard(limit_count integer DEFAULT 50)
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
  ORDER BY p.xp DESC
  LIMIT limit_count;
$function$;