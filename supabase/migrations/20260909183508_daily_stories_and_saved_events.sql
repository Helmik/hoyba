-- Migration: Curated Daily Stories (8:00 AM & 4:00 PM editions) and Saved Events (Favorites)
-- Specifications:
-- - curated_stories: Tracks morning (8:00 AM) and afternoon (4:00 PM) Instagram story compilations
-- - Dedicated public storage bucket 'curated-stories' for 1080x1920 WebP static assets
-- - saved_events: Allows authenticated visitors to bookmark events to 'My Day'
-- - Helper RPC to fetch candidate events for story compilation

-- 1. Table: curated_stories
CREATE TABLE IF NOT EXISTS public.curated_stories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    target_date date DEFAULT CURRENT_DATE NOT NULL,
    edition text NOT NULL,
    title text NOT NULL,
    story_image_url text,
    event_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    compiled_at timestamptz DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,

    CONSTRAINT check_edition CHECK (edition IN ('morning', 'afternoon')),
    CONSTRAINT unique_daily_edition UNIQUE (target_date, edition)
);

CREATE TRIGGER set_curated_stories_updated_at
    BEFORE UPDATE ON public.curated_stories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_curated_stories_target_date
    ON public.curated_stories (target_date DESC, edition);

-- 2. Table: saved_events (User Bookmarks / My Day)
CREATE TABLE IF NOT EXISTS public.saved_events (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,

    PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_events_user
    ON public.saved_events (user_id, created_at DESC);

-- 3. Storage Bucket: curated-stories
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'curated-stories',
    'curated-stories',
    true,
    10485760, -- 10MB limit
    ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

-- 4. Storage Policies for curated-stories
CREATE POLICY "Public read curated stories"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'curated-stories');

CREATE POLICY "Service role manages curated stories assets"
    ON storage.objects
    FOR ALL
    TO service_role
    USING (bucket_id = 'curated-stories')
    WITH CHECK (bucket_id = 'curated-stories');

-- 5. Row Level Security
ALTER TABLE public.curated_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;

-- curated_stories policies
CREATE POLICY "Public read published curated stories"
    ON public.curated_stories
    FOR SELECT
    USING (is_published = true);

-- saved_events policies
CREATE POLICY "Users view own saved events"
    ON public.saved_events
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own saved events"
    ON public.saved_events
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own saved events"
    ON public.saved_events
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Helper RPC: Query candidate events for morning/afternoon cron editions
-- Morning edition (8:00 AM): Highlights daytime agenda, workshops, wellness, live music starting today
-- Afternoon edition (4:00 PM): Highlights sunset, gastronomy, live music, and nightlife tonight
CREATE OR REPLACE FUNCTION public.get_story_candidates(
    p_date date DEFAULT CURRENT_DATE,
    p_edition text DEFAULT 'morning',
    p_limit int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    title text,
    category text,
    start_date timestamptz,
    location_name text,
    cover_image_url text,
    price numeric(10, 2),
    currency varchar(3),
    is_free boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        e.id,
        coalesce(e.title->>'en', e.title->>'es') AS title,
        e.category,
        e.start_date,
        e.location_name,
        e.cover_image_url,
        e.price,
        e.currency,
        e.is_free
    FROM public.events e
    WHERE
        e.is_published = true
        AND (e.start_date AT TIME ZONE 'UTC')::date = p_date
        AND (
            CASE
                WHEN p_edition = 'morning' THEN
                    e.category IN ('agenda', 'workshop', 'wellness', 'live_music', 'gastronomy', 'art_culture', 'community')
                WHEN p_edition = 'afternoon' THEN
                    e.category IN ('gastronomy', 'live_music', 'nightlife', 'art_culture', 'agenda')
                ELSE true
            END
        )
    ORDER BY
        e.start_date ASC
    LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_story_candidates TO anon, authenticated, service_role;

COMMENT ON TABLE public.curated_stories IS 'Daily Instagram Story compilations executed at 8:00 AM and 4:00 PM.';
COMMENT ON TABLE public.saved_events IS 'User-specific bookmarked events (My Day agenda).';
