-- Remove the vulnerable INSERT policy that allows users to self-assign roles
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- Update profiles SELECT policy to only show public leaderboard data
-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles (for leaderboard)" ON public.profiles;

-- Create a policy that allows users to see their own full profile
CREATE POLICY "Users can view their own full profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a view for the leaderboard with only non-sensitive data
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  id,
  username,
  xp,
  level,
  streak,
  is_premium
FROM public.profiles
ORDER BY xp DESC;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.leaderboard_view TO authenticated;

-- Also create a security definer function to get leaderboard data safely
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  username TEXT,
  xp INTEGER,
  level INTEGER,
  streak INTEGER,
  is_premium BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.xp,
    p.level,
    p.streak,
    p.is_premium
  FROM public.profiles p
  ORDER BY p.xp DESC
  LIMIT limit_count;
$$;