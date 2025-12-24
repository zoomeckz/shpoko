-- Create forum_categories table
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT 'message-square',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_threads table
CREATE TABLE public.forum_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  last_reply_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_posts table (replies)
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_votes table
CREATE TABLE public.forum_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT vote_target_check CHECK (
    (thread_id IS NOT NULL AND post_id IS NULL) OR
    (thread_id IS NULL AND post_id IS NOT NULL)
  ),
  CONSTRAINT unique_thread_vote UNIQUE (user_id, thread_id),
  CONSTRAINT unique_post_vote UNIQUE (user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_categories (public read)
CREATE POLICY "Anyone can view categories"
ON public.forum_categories FOR SELECT
USING (true);

-- Admins only can manage categories (using has_role function)
CREATE POLICY "Admins can manage categories"
ON public.forum_categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for forum_threads
CREATE POLICY "Anyone can view threads"
ON public.forum_threads FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create threads"
ON public.forum_threads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads"
ON public.forum_threads FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads"
ON public.forum_threads FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for forum_posts
CREATE POLICY "Anyone can view posts"
ON public.forum_posts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.forum_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.forum_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.forum_posts FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for forum_votes
CREATE POLICY "Anyone can view votes"
ON public.forum_votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.forum_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their own votes"
ON public.forum_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
ON public.forum_votes FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_forum_threads_updated_at
  BEFORE UPDATE ON public.forum_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.forum_categories (name, description, language, icon, display_order) VALUES
  ('General Discussion', 'General topics and community chat', 'general', 'message-square', 1),
  ('Bulgarian Learning', 'Discuss Bulgarian language learning', 'bulgarian', 'book-open', 2),
  ('Spanish Learning', 'Discuss Spanish language learning', 'spanish', 'book-open', 3),
  ('Tips & Resources', 'Share learning tips and resources', 'general', 'lightbulb', 4),
  ('Feedback & Suggestions', 'Share your feedback about the app', 'general', 'message-circle', 5);