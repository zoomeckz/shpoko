-- Hall of Fame table to track monthly winners
CREATE TABLE public.hall_of_fame (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  place INTEGER NOT NULL CHECK (place >= 1 AND place <= 3),
  xp_at_win INTEGER NOT NULL DEFAULT 0,
  stars INTEGER NOT NULL DEFAULT 1, -- Accumulates each consecutive win
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;

-- Everyone can view hall of fame (it's public)
CREATE POLICY "Hall of fame is viewable by everyone" 
ON public.hall_of_fame 
FOR SELECT 
USING (true);

-- Only service role can insert/update (via edge function or backend)
CREATE POLICY "No user inserts to hall of fame" 
ON public.hall_of_fame 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "No user updates to hall of fame" 
ON public.hall_of_fame 
FOR UPDATE 
USING (false);

CREATE POLICY "No user deletes from hall of fame" 
ON public.hall_of_fame 
FOR DELETE 
USING (false);

-- Lower XP requirements for levels
-- We'll update this through the app code by adjusting the level thresholds

-- Wipe the leaderboard by resetting all XP and levels
UPDATE public.profiles SET xp = 0, level = 1;

-- Add index for hall of fame queries
CREATE INDEX idx_hall_of_fame_user_month ON public.hall_of_fame(user_id, month_year);
CREATE INDEX idx_hall_of_fame_month ON public.hall_of_fame(month_year);