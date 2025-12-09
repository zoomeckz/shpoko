-- Create table to track daily game attempts
CREATE TABLE public.game_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  last_played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  high_score INTEGER NOT NULL DEFAULT 0,
  total_games INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.game_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own game attempts"
ON public.game_attempts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game attempts"
ON public.game_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game attempts"
ON public.game_attempts
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_game_attempts_updated_at
BEFORE UPDATE ON public.game_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();