-- Per-account access rules, set by admins in the admin panel.
-- Only the admin-accounts edge function (service role) writes to this table.
CREATE TABLE IF NOT EXISTS public.account_access (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Created by an admin with a username + password (no email).
  managed BOOLEAN NOT NULL DEFAULT false,
  -- When the account stops working. NULL = never.
  expires_at TIMESTAMP WITH TIME ZONE,
  -- Units the account can see (course unit ids). NULL = all units.
  units TEXT[],
  -- Every lesson in the allowed units is open, regardless of progress.
  unlock_all BOOLEAN NOT NULL DEFAULT false,
  -- Switched off by an admin.
  disabled BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.account_access ENABLE ROW LEVEL SECURITY;

-- People can read their own rules (the app uses them to show the right units).
-- There are deliberately no insert/update/delete policies for users.
CREATE POLICY "Users can read their own access rules"
ON public.account_access FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_account_access_updated_at
  BEFORE UPDATE ON public.account_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- True unless the account has been disabled or has expired.
CREATE OR REPLACE FUNCTION public.account_is_active(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.account_access a
    WHERE a.user_id = _user_id
      AND (a.disabled OR (a.expires_at IS NOT NULL AND a.expires_at < now()))
  )
$$;

-- Expired or disabled accounts can't save anything, even outside the website.
CREATE POLICY "Only active accounts can save progress"
ON public.user_progress AS RESTRICTIVE FOR INSERT
TO authenticated
WITH CHECK (public.account_is_active(auth.uid()));

CREATE POLICY "Only active accounts can change progress"
ON public.user_progress AS RESTRICTIVE FOR UPDATE
TO authenticated
USING (public.account_is_active(auth.uid()));

CREATE POLICY "Only active accounts can change their profile"
ON public.profiles AS RESTRICTIVE FOR UPDATE
TO authenticated
USING (public.account_is_active(auth.uid()));
