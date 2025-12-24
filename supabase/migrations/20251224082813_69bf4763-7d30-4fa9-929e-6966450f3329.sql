-- Adventure nodes table (defines the roadmap)
CREATE TABLE public.adventure_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_number INTEGER NOT NULL UNIQUE,
  lesson_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 20,
  is_dungeon BOOLEAN NOT NULL DEFAULT false,
  week_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User adventure progress
CREATE TABLE public.adventure_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  node_id UUID NOT NULL REFERENCES public.adventure_nodes(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER NOT NULL DEFAULT 0,
  best_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, node_id)
);

-- Dungeon runs (for dungeon-crawler gameplay)
CREATE TABLE public.dungeon_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dungeon_node_id UUID NOT NULL REFERENCES public.adventure_nodes(id) ON DELETE CASCADE,
  current_room INTEGER NOT NULL DEFAULT 1,
  total_rooms INTEGER NOT NULL DEFAULT 5,
  lives_remaining INTEGER NOT NULL DEFAULT 3,
  max_lives INTEGER NOT NULL DEFAULT 3,
  free_skips INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  failed BOOLEAN NOT NULL DEFAULT false,
  powerups_collected TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audio cache for TTS (Duolingo-style pre-generated clips)
CREATE TABLE public.audio_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text_hash TEXT NOT NULL UNIQUE,
  text_content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'bg',
  audio_base64 TEXT NOT NULL,
  voice TEXT NOT NULL DEFAULT 'alloy',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adventure_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adventure_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dungeon_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for adventure_nodes (public read)
CREATE POLICY "Anyone can view adventure nodes"
ON public.adventure_nodes FOR SELECT
USING (true);

-- RLS policies for adventure_progress
CREATE POLICY "Users can view their own progress"
ON public.adventure_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.adventure_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.adventure_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for dungeon_runs
CREATE POLICY "Users can view their own dungeon runs"
ON public.dungeon_runs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dungeon runs"
ON public.dungeon_runs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dungeon runs"
ON public.dungeon_runs FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for audio_cache (public read, no user writes)
CREATE POLICY "Anyone can view cached audio"
ON public.audio_cache FOR SELECT
USING (true);

-- Insert initial adventure nodes (Week 1: 10 nodes + 1 dungeon)
INSERT INTO public.adventure_nodes (node_number, lesson_id, title, description, xp_reward, is_dungeon, week_number) VALUES
(1, 'cyrillic-alphabet', 'Cyrillic Basics', 'Learn the Bulgarian alphabet', 20, false, 1),
(2, 'basic-greetings', 'Hello World', 'Master essential greetings', 25, false, 1),
(3, 'numbers-1-20', 'Counting Stars', 'Numbers from 1 to 20', 25, false, 1),
(4, 'pronouns-topic', 'Who Am I?', 'Personal pronouns', 30, false, 1),
(5, 'colors-topic', 'Rainbow Road', 'Learn all the colors', 25, false, 1),
(6, 'survival-phrases-topic', 'Survival Kit', 'Essential phrases', 30, false, 1),
(7, 'food-drinks-starter-topic', 'Hungry?', 'Food vocabulary basics', 25, false, 1),
(8, 'animals-topic', 'Animal Kingdom', 'Learn animal names', 30, false, 1),
(9, 'weekdays-topic', 'Days Go By', 'Days of the week', 25, false, 1),
(10, 'family-topic', 'Family Matters', 'Family vocabulary', 30, false, 1),
(11, 'dungeon-1', 'Crystal Cavern', 'Your first dungeon challenge!', 100, true, 1),
-- Week 2
(12, 'adjectives-topic', 'Describe It', 'Basic adjectives', 30, false, 2),
(13, 'verbs-topic', 'Action!', 'Common verbs', 35, false, 2),
(14, 'directions-beginner', 'Find Your Way', 'Basic directions', 30, false, 2),
(15, 'weather-topic', 'Weather Talk', 'Weather vocabulary', 30, false, 2),
(16, 'jobs-topic', 'Career Path', 'Occupation names', 35, false, 2),
(17, 'restaurant-topic', 'Dining Out', 'Restaurant phrases', 35, false, 2),
(18, 'essential-verbs-topic', 'Verb Power', 'More essential verbs', 35, false, 2),
(19, 'shapes-topic', 'Shape Up', 'Shape vocabulary', 25, false, 2),
(20, 'adjectives-2-topic', 'More Descriptions', 'Advanced adjectives', 35, false, 2),
(21, 'numbers-topic', 'Big Numbers', 'Extended counting', 35, false, 2),
(22, 'dungeon-2', 'Shadow Temple', 'A darker challenge awaits', 150, true, 2);

-- Trigger for dungeon_runs updated_at
CREATE TRIGGER update_dungeon_runs_updated_at
  BEFORE UPDATE ON public.dungeon_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for audio cache lookups
CREATE INDEX idx_audio_cache_hash ON public.audio_cache(text_hash);