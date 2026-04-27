-- Add flag to track explicit username selection
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username_set BOOLEAN NOT NULL DEFAULT false;

-- Backfill: anyone whose username does NOT match the auto-generated pattern
-- "user_<8 hex chars>" has clearly chosen one already.
UPDATE public.profiles
SET username_set = true
WHERE username !~ '^user_[0-9a-f]{8}$';

-- Update signup trigger so email signups (with metadata username) are flagged as set,
-- while OAuth signups (no username in metadata) remain unset and get prompted.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta_username TEXT := NEW.raw_user_meta_data ->> 'username';
BEGIN
  INSERT INTO public.profiles (id, username, email, username_set)
  VALUES (
    NEW.id,
    COALESCE(meta_username, 'user_' || LEFT(NEW.id::text, 8)),
    NEW.email,
    meta_username IS NOT NULL
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$function$;