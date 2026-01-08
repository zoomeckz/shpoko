-- Create user vocabulary table for LingQ-style word tracking
CREATE TABLE public.user_vocabulary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  word TEXT NOT NULL,
  translation TEXT,
  romanization TEXT,
  notes TEXT,
  status INTEGER NOT NULL DEFAULT 1 CHECK (status >= 1 AND status <= 5),
  -- Status: 1 = New, 2 = Recognized, 3 = Familiar, 4 = Learned, 5 = Known
  times_seen INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, word)
);

-- Enable Row Level Security
ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own vocabulary" 
ON public.user_vocabulary 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vocabulary" 
ON public.user_vocabulary 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary" 
ON public.user_vocabulary 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary" 
ON public.user_vocabulary 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_vocabulary_user_word ON public.user_vocabulary(user_id, word);
CREATE INDEX idx_user_vocabulary_status ON public.user_vocabulary(user_id, status);
CREATE INDEX idx_user_vocabulary_next_review ON public.user_vocabulary(user_id, next_review_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_vocabulary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_vocabulary_updated_at
BEFORE UPDATE ON public.user_vocabulary
FOR EACH ROW
EXECUTE FUNCTION public.update_vocabulary_updated_at();