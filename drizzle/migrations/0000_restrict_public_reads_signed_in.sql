DROP POLICY IF EXISTS "Hall of fame is viewable by everyone" ON public.hall_of_fame;
CREATE POLICY "Signed-in users can view hall of fame" ON public.hall_of_fame FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view leagues" ON public.leagues;
CREATE POLICY "Signed-in users can view leagues" ON public.leagues FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view categories" ON public.forum_categories;
CREATE POLICY "Signed-in users can view categories" ON public.forum_categories FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view cached audio" ON public.audio_cache;
CREATE POLICY "Signed-in users can view cached audio" ON public.audio_cache FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

REVOKE SELECT ON public.hall_of_fame, public.leagues, public.forum_categories, public.audio_cache FROM anon;
GRANT SELECT ON public.hall_of_fame, public.leagues, public.forum_categories, public.audio_cache TO authenticated;
GRANT ALL ON public.hall_of_fame, public.leagues, public.forum_categories, public.audio_cache TO service_role;