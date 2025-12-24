-- Create flashcard_decks table
CREATE TABLE public.flashcard_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_language TEXT NOT NULL DEFAULT 'english',
  target_language TEXT NOT NULL DEFAULT 'bulgarian',
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_lesson_based BOOLEAN NOT NULL DEFAULT false,
  lesson_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcards table
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  pronunciation TEXT,
  times_reviewed INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- RLS policies for flashcard_decks
CREATE POLICY "Users can view their own decks"
ON public.flashcard_decks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public decks"
ON public.flashcard_decks FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can create their own decks"
ON public.flashcard_decks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
ON public.flashcard_decks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
ON public.flashcard_decks FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for flashcards
CREATE POLICY "Users can view flashcards in their decks"
ON public.flashcards FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.flashcard_decks
  WHERE flashcard_decks.id = flashcards.deck_id
  AND flashcard_decks.user_id = auth.uid()
));

CREATE POLICY "Anyone can view flashcards in public decks"
ON public.flashcards FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.flashcard_decks
  WHERE flashcard_decks.id = flashcards.deck_id
  AND flashcard_decks.is_public = true
));

CREATE POLICY "Users can create flashcards in their decks"
ON public.flashcards FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.flashcard_decks
  WHERE flashcard_decks.id = flashcards.deck_id
  AND flashcard_decks.user_id = auth.uid()
));

CREATE POLICY "Users can update flashcards in their decks"
ON public.flashcards FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.flashcard_decks
  WHERE flashcard_decks.id = flashcards.deck_id
  AND flashcard_decks.user_id = auth.uid()
));

CREATE POLICY "Users can delete flashcards in their decks"
ON public.flashcards FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.flashcard_decks
  WHERE flashcard_decks.id = flashcards.deck_id
  AND flashcard_decks.user_id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_flashcard_decks_updated_at
  BEFORE UPDATE ON public.flashcard_decks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();