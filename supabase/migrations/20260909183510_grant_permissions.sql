-- Migration: Grant schema and table permissions to anon and authenticated roles
-- Ensures PostgREST API can query public tables governed by Row Level Security (RLS)

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated;

-- Grant SELECT to anon and authenticated on public tables
GRANT SELECT ON TABLE public.events TO anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO anon, authenticated;
GRANT SELECT ON TABLE public.curated_stories TO anon, authenticated;
GRANT ALL ON TABLE public.saved_events TO authenticated;

-- Ensure execute on public functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Set default privileges for any future tables created in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
