-- Drop tables if they exist (clean slate)
DROP TABLE IF EXISTS public.roguelike_completed_nodes CASCADE;
DROP TABLE IF EXISTS public.roguelike_progress CASCADE;
DROP TABLE IF EXISTS public.roguelike_questions CASCADE;
DROP TABLE IF EXISTS public.roguelike_lessons CASCADE;
DROP TABLE IF EXISTS public.roguelike_nodes CASCADE;
DROP TABLE IF EXISTS public.roguelike_maps CASCADE;
DROP TABLE IF EXISTS public.roguelike_music CASCADE;

-- Roguelike game maps table
CREATE TABLE public.roguelike_maps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  background_image TEXT,
  is_boss_map BOOLEAN DEFAULT false,
  next_map_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Map nodes with types and positions
CREATE TABLE public.roguelike_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id TEXT NOT NULL REFERENCES public.roguelike_maps(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL CHECK (node_type IN ('normal', 'skull', 'heart', 'empty', 'boss', 'locked', 'treasure')),
  x_position INTEGER NOT NULL,
  y_position INTEGER NOT NULL,
  connected_nodes UUID[] DEFAULT '{}',
  lesson_id UUID,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Game-specific lessons (separate from website lessons)
CREATE TABLE public.roguelike_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  time_limit_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Questions for roguelike lessons
CREATE TABLE public.roguelike_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.roguelike_lessons(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('choose', 'fill_blank', 'reading')),
  question_text TEXT NOT NULL,
  question_text_bg TEXT,
  correct_answer TEXT NOT NULL,
  options TEXT[] DEFAULT '{}',
  reading_text TEXT,
  word_translations JSONB DEFAULT '{}',
  time_bonus_seconds INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Player roguelike progress
CREATE TABLE public.roguelike_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  current_map_id TEXT REFERENCES public.roguelike_maps(id),
  current_node_id UUID,
  lives INTEGER DEFAULT 3,
  moves_today INTEGER DEFAULT 5,
  last_move_reset TIMESTAMPTZ DEFAULT now(),
  total_nodes_completed INTEGER DEFAULT 0,
  maps_completed TEXT[] DEFAULT '{}',
  is_backtracking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Completed nodes tracking
CREATE TABLE public.roguelike_completed_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  node_id UUID NOT NULL REFERENCES public.roguelike_nodes(id) ON DELETE CASCADE,
  map_id TEXT NOT NULL REFERENCES public.roguelike_maps(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_during_backtrack BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, node_id)
);

-- Music tracks for the radio
CREATE TABLE public.roguelike_music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT,
  file_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.roguelike_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roguelike_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roguelike_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roguelike_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roguelike_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roguelike_completed_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roguelike_music ENABLE ROW LEVEL SECURITY;

-- Public read for maps, nodes, lessons, questions, music
CREATE POLICY "Anyone can read maps" ON public.roguelike_maps FOR SELECT USING (true);
CREATE POLICY "Anyone can read nodes" ON public.roguelike_nodes FOR SELECT USING (true);
CREATE POLICY "Anyone can read lessons" ON public.roguelike_lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can read questions" ON public.roguelike_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can read music" ON public.roguelike_music FOR SELECT USING (true);

-- User-specific progress policies
CREATE POLICY "Users can read own progress" ON public.roguelike_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.roguelike_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.roguelike_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own completed nodes" ON public.roguelike_completed_nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completed nodes" ON public.roguelike_completed_nodes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert initial map data
INSERT INTO public.roguelike_maps (id, name, order_index, is_boss_map, next_map_ids) VALUES
('map_01', 'Гората на началото', 1, false, ARRAY['map_02']);

-- Insert map_01 nodes based on the image coordinates
INSERT INTO public.roguelike_nodes (map_id, node_type, x_position, y_position, order_index) VALUES
('map_01', 'treasure', 85, 400, 1),
('map_01', 'locked', 280, 340, 2),
('map_01', 'empty', 340, 450, 3),
('map_01', 'treasure', 480, 410, 4),
('map_01', 'skull', 640, 400, 5),
('map_01', 'skull', 760, 320, 6),
('map_01', 'normal', 200, 250, 7),
('map_01', 'heart', 90, 220, 8),
('map_01', 'locked', 560, 240, 9),
('map_01', 'treasure', 450, 260, 10),
('map_01', 'boss', 680, 120, 11);

-- Create sample lessons with accurate Bulgarian content
INSERT INTO public.roguelike_lessons (id, title, category, difficulty, time_limit_seconds) VALUES
('00000000-0000-0000-0000-000000000001', 'Основни поздрави', 'greetings', 1, 45),
('00000000-0000-0000-0000-000000000002', 'Числа 1-10', 'numbers', 1, 40),
('00000000-0000-0000-0000-000000000003', 'Цветове', 'colors', 1, 40),
('00000000-0000-0000-0000-000000000004', 'Семейство', 'family', 2, 50),
('00000000-0000-0000-0000-000000000005', 'Храна и напитки', 'food', 2, 50);

-- Greetings lesson questions
INSERT INTO public.roguelike_questions (lesson_id, question_type, question_text, correct_answer, options, order_index) VALUES
('00000000-0000-0000-0000-000000000001', 'choose', 'How do you say "Hello" in Bulgarian?', 'Здравей', ARRAY['Здравей', 'Довиждане', 'Благодаря', 'Моля'], 1),
('00000000-0000-0000-0000-000000000001', 'choose', 'What does "Добър ден" mean?', 'Good day', ARRAY['Good day', 'Good night', 'Goodbye', 'Thank you'], 2),
('00000000-0000-0000-0000-000000000001', 'fill_blank', 'Complete: Добро ___ (morning)', 'утро', ARRAY[]::TEXT[], 3),
('00000000-0000-0000-0000-000000000001', 'choose', 'How do you say "Goodbye"?', 'Довиждане', ARRAY['Довиждане', 'Здравей', 'Добре', 'Лека нощ'], 4),
('00000000-0000-0000-0000-000000000001', 'choose', 'What is "Good night" in Bulgarian?', 'Лека нощ', ARRAY['Лека нощ', 'Добра нощ', 'Добър ден', 'Добро утро'], 5),
('00000000-0000-0000-0000-000000000001', 'fill_blank', 'Complete: ___ благодаря (Thank you very much)', 'Много', ARRAY[]::TEXT[], 6);

-- Numbers lesson questions
INSERT INTO public.roguelike_questions (lesson_id, question_type, question_text, correct_answer, options, order_index) VALUES
('00000000-0000-0000-0000-000000000002', 'choose', 'What is "едно" in English?', 'one', ARRAY['one', 'two', 'three', 'ten'], 1),
('00000000-0000-0000-0000-000000000002', 'choose', 'How do you say "5" in Bulgarian?', 'пет', ARRAY['пет', 'шест', 'седем', 'четири'], 2),
('00000000-0000-0000-0000-000000000002', 'fill_blank', 'Write the Bulgarian word for 3:', 'три', ARRAY[]::TEXT[], 3),
('00000000-0000-0000-0000-000000000002', 'choose', 'What number is "десет"?', '10', ARRAY['10', '9', '8', '7'], 4),
('00000000-0000-0000-0000-000000000002', 'choose', 'How do you say "7" in Bulgarian?', 'седем', ARRAY['седем', 'осем', 'девет', 'шест'], 5),
('00000000-0000-0000-0000-000000000002', 'fill_blank', 'две + три = ___ (in Bulgarian)', 'пет', ARRAY[]::TEXT[], 6),
('00000000-0000-0000-0000-000000000002', 'choose', 'What is "осем" in English?', 'eight', ARRAY['eight', 'nine', 'seven', 'six'], 7);

-- Colors lesson questions  
INSERT INTO public.roguelike_questions (lesson_id, question_type, question_text, correct_answer, options, order_index) VALUES
('00000000-0000-0000-0000-000000000003', 'choose', 'What color is "червен"?', 'red', ARRAY['red', 'blue', 'green', 'yellow'], 1),
('00000000-0000-0000-0000-000000000003', 'choose', 'How do you say "blue" in Bulgarian?', 'син', ARRAY['син', 'зелен', 'жълт', 'бял'], 2),
('00000000-0000-0000-0000-000000000003', 'fill_blank', 'The sky is ___ (blue in Bulgarian)', 'син', ARRAY[]::TEXT[], 3),
('00000000-0000-0000-0000-000000000003', 'choose', 'What is "зелен"?', 'green', ARRAY['green', 'red', 'black', 'white'], 4),
('00000000-0000-0000-0000-000000000003', 'choose', 'How do you say "black" in Bulgarian?', 'черен', ARRAY['черен', 'бял', 'сив', 'кафяв'], 5),
('00000000-0000-0000-0000-000000000003', 'fill_blank', 'Snow is ___ (white in Bulgarian)', 'бял', ARRAY[]::TEXT[], 6),
('00000000-0000-0000-0000-000000000003', 'choose', 'What is "жълт"?', 'yellow', ARRAY['yellow', 'orange', 'pink', 'purple'], 7);

-- Family lesson questions
INSERT INTO public.roguelike_questions (lesson_id, question_type, question_text, correct_answer, options, order_index) VALUES
('00000000-0000-0000-0000-000000000004', 'choose', 'What is "майка" in English?', 'mother', ARRAY['mother', 'father', 'sister', 'brother'], 1),
('00000000-0000-0000-0000-000000000004', 'choose', 'How do you say "father" in Bulgarian?', 'баща', ARRAY['баща', 'брат', 'сестра', 'дядо'], 2),
('00000000-0000-0000-0000-000000000004', 'fill_blank', 'My ___ is kind (sister)', 'сестра', ARRAY[]::TEXT[], 3),
('00000000-0000-0000-0000-000000000004', 'choose', 'What is "брат"?', 'brother', ARRAY['brother', 'uncle', 'cousin', 'nephew'], 4),
('00000000-0000-0000-0000-000000000004', 'choose', 'How do you say "grandmother" in Bulgarian?', 'баба', ARRAY['баба', 'дядо', 'леля', 'чичо'], 5),
('00000000-0000-0000-0000-000000000004', 'fill_blank', 'Grandfather in Bulgarian is ___', 'дядо', ARRAY[]::TEXT[], 6),
('00000000-0000-0000-0000-000000000004', 'choose', 'What is "дете"?', 'child', ARRAY['child', 'adult', 'baby', 'teenager'], 7);

-- Food lesson questions
INSERT INTO public.roguelike_questions (lesson_id, question_type, question_text, correct_answer, options, order_index) VALUES
('00000000-0000-0000-0000-000000000005', 'choose', 'What is "хляб" in English?', 'bread', ARRAY['bread', 'water', 'milk', 'cheese'], 1),
('00000000-0000-0000-0000-000000000005', 'choose', 'How do you say "water" in Bulgarian?', 'вода', ARRAY['вода', 'мляко', 'сок', 'кафе'], 2),
('00000000-0000-0000-0000-000000000005', 'fill_blank', 'I drink ___ (milk)', 'мляко', ARRAY[]::TEXT[], 3),
('00000000-0000-0000-0000-000000000005', 'choose', 'What is "ябълка"?', 'apple', ARRAY['apple', 'banana', 'orange', 'grape'], 4),
('00000000-0000-0000-0000-000000000005', 'choose', 'How do you say "cheese" in Bulgarian?', 'сирене', ARRAY['сирене', 'кашкавал', 'масло', 'яйце'], 5),
('00000000-0000-0000-0000-000000000005', 'fill_blank', 'Bulgarian yogurt is called ___', 'кисело мляко', ARRAY[]::TEXT[], 6),
('00000000-0000-0000-0000-000000000005', 'choose', 'What is "месо"?', 'meat', ARRAY['meat', 'fish', 'chicken', 'vegetables'], 7);