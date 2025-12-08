-- Add unique constraint on user_progress for upsert to work
ALTER TABLE public.user_progress 
ADD CONSTRAINT user_progress_user_lesson_unique UNIQUE (user_id, lesson_id);

-- Enable realtime for profiles table so leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;