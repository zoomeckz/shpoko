-- Create quests table for daily/weekly quests
CREATE TABLE public.quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
  xp_reward INTEGER NOT NULL DEFAULT 10,
  target_count INTEGER NOT NULL DEFAULT 1,
  action_type TEXT NOT NULL, -- e.g., 'complete_lesson', 'earn_xp', 'streak', 'perfect_score'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user quest progress table
CREATE TABLE public.user_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leagues table
CREATE TABLE public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier INTEGER NOT NULL UNIQUE, -- 1 = Bronze, 2 = Silver, etc.
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  min_xp_to_promote INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user league participation table
CREATE TABLE public.user_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  week_xp INTEGER NOT NULL DEFAULT 0,
  week_start TIMESTAMP WITH TIME ZONE NOT NULL,
  position INTEGER,
  promoted BOOLEAN DEFAULT false,
  demoted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_leagues ENABLE ROW LEVEL SECURITY;

-- Quests are readable by all authenticated users
CREATE POLICY "Anyone can view active quests" ON public.quests
  FOR SELECT USING (is_active = true);

-- User quests policies
CREATE POLICY "Users can view their own quests" ON public.user_quests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests" ON public.user_quests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quests" ON public.user_quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leagues are readable by all
CREATE POLICY "Anyone can view leagues" ON public.leagues
  FOR SELECT USING (true);

-- User leagues policies
CREATE POLICY "Users can view all league participants" ON public.user_leagues
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own league data" ON public.user_leagues
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own league data" ON public.user_leagues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default leagues
INSERT INTO public.leagues (name, tier, icon, color, min_xp_to_promote) VALUES
  ('Bronze', 1, '🥉', '#CD7F32', 0),
  ('Silver', 2, '🥈', '#C0C0C0', 100),
  ('Gold', 3, '🥇', '#FFD700', 250),
  ('Sapphire', 4, '💎', '#0F52BA', 500),
  ('Ruby', 5, '❤️', '#E0115F', 750),
  ('Emerald', 6, '💚', '#50C878', 1000),
  ('Amethyst', 7, '💜', '#9966CC', 1500),
  ('Pearl', 8, '🤍', '#F0EAD6', 2000),
  ('Obsidian', 9, '🖤', '#0B0B0B', 3000),
  ('Diamond', 10, '💠', '#B9F2FF', 5000);

-- Insert default quests
INSERT INTO public.quests (title, description, type, xp_reward, target_count, action_type) VALUES
  ('Early Bird', 'Complete 1 lesson today', 'daily', 10, 1, 'complete_lesson'),
  ('Scholar', 'Complete 3 lessons today', 'daily', 25, 3, 'complete_lesson'),
  ('XP Hunter', 'Earn 50 XP today', 'daily', 15, 50, 'earn_xp'),
  ('Perfect Round', 'Get 100% on any lesson', 'daily', 20, 1, 'perfect_score'),
  ('Weekly Warrior', 'Complete 15 lessons this week', 'weekly', 100, 15, 'complete_lesson'),
  ('XP Champion', 'Earn 500 XP this week', 'weekly', 150, 500, 'earn_xp'),
  ('Streak Master', 'Maintain a 7-day streak', 'weekly', 200, 7, 'streak');