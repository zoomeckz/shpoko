-- Add column to track last username change
ALTER TABLE public.profiles 
ADD COLUMN last_username_change timestamp with time zone DEFAULT NULL;