GRANT SELECT ON public.number_stories TO anon;
GRANT SELECT ON public.audio_episodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.number_stories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_episodes TO authenticated;
GRANT ALL ON public.number_stories TO service_role;
GRANT ALL ON public.audio_episodes TO service_role;