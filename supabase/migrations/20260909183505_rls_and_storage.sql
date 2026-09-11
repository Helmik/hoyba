-- Migration: Configure Row Level Security (RLS) and Supabase Storage for event-covers
-- Specifications:
-- - Public read access for published events
-- - Organizer-restricted mutating operations
-- - Dedicated public storage bucket 'event-covers' for optimized WebP image assets

-- 1. Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies on events table
CREATE POLICY "Public read published events"
    ON public.events
    FOR SELECT
    USING (is_published = true);

CREATE POLICY "Organizers view own events"
    ON public.events
    FOR SELECT
    TO authenticated
    USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers insert own events"
    ON public.events
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers update own events"
    ON public.events
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers delete own events"
    ON public.events
    FOR DELETE
    TO authenticated
    USING (auth.uid() = organizer_id);

-- 3. Storage Bucket: event-covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'event-covers',
    'event-covers',
    true,
    5242880, -- 5MB limit
    ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

-- 4. Storage Policies for event-covers bucket
CREATE POLICY "Public read event covers"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'event-covers');

CREATE POLICY "Authenticated users upload event covers"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'event-covers'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users update own event covers"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'event-covers'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users delete own event covers"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'event-covers'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
