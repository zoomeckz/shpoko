-- Add explicit DELETE restriction on profiles table to prevent accidental deletion
CREATE POLICY "Users cannot delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);