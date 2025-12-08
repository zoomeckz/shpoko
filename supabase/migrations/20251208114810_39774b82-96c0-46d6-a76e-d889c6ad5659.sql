-- Add restrictive policies to prevent users from modifying their own roles
-- Only the service role (via triggers) should be able to write to this table

CREATE POLICY "No user inserts to roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "No user updates to roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "No user deletes from roles" ON public.user_roles
FOR DELETE TO authenticated
USING (false);