-- Migration: Create businesses and posts/events schema with 1:N architecture,
-- 3 active events constraint, RLS, spatial indices, and covers storage bucket.

-- 1. Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    instagram_handle VARCHAR(50),
    cover_image_url TEXT,
    bio JSONB DEFAULT '{}'::jsonb,
    address_details TEXT,
    coordinates extensions.geometry(Point, 4326),
    opening_hours JSONB DEFAULT '{}'::jsonb,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT check_business_category CHECK (category IN ('wellness', 'music', 'art', 'gastronomy')),
    CONSTRAINT check_business_zone CHECK (zone IN ('La Veleta', 'Aldea Zama', 'Centro', 'Zona Costera', 'Region 15'))
);

-- Updated at trigger for businesses
CREATE TRIGGER set_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 2. Alter events table to link to businesses and support host portal
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price_range VARCHAR(50);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS custom_whatsapp_msg TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Synchronize start_date <-> start_time, end_date <-> end_time, and is_published <-> is_active
CREATE OR REPLACE FUNCTION public.sync_event_host_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync start timestamps
    IF NEW.start_time IS NOT NULL AND NEW.start_date IS NULL THEN
        NEW.start_date := NEW.start_time;
    ELSIF NEW.start_date IS NOT NULL AND NEW.start_time IS NULL THEN
        NEW.start_time := NEW.start_date;
    END IF;

    -- Sync end timestamps
    IF NEW.end_time IS NOT NULL AND NEW.end_date IS NULL THEN
        NEW.end_date := NEW.end_time;
    ELSIF NEW.end_date IS NOT NULL AND NEW.end_time IS NULL THEN
        NEW.end_time := NEW.end_date;
    END IF;

    -- Sync active / published status
    IF NEW.is_active IS NOT NULL THEN
        NEW.is_published := NEW.is_active;
    ELSIF NEW.is_published IS NOT NULL THEN
        NEW.is_active := NEW.is_published;
    END IF;

    -- If organizer_id is missing but business_id exists, associate organizer_id with business owner
    IF NEW.organizer_id IS NULL AND NEW.business_id IS NOT NULL THEN
        SELECT owner_id INTO NEW.organizer_id
        FROM public.businesses
        WHERE id = NEW.business_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_event_host_fields ON public.events;
CREATE TRIGGER trg_sync_event_host_fields
    BEFORE INSERT OR UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_event_host_fields();

-- 4. Constraint: Maximum 3 active events per business simultaneously
CREATE OR REPLACE FUNCTION public.check_max_active_events_per_business()
RETURNS TRIGGER AS $$
DECLARE
    active_count INT;
BEGIN
    -- Only check if the event is marked active and is tied to a business
    IF NEW.business_id IS NOT NULL AND (NEW.is_active = true OR NEW.is_published = true) THEN
        SELECT COUNT(*)
        INTO active_count
        FROM public.events
        WHERE business_id = NEW.business_id
          AND (is_active = true OR is_published = true)
          AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

        IF active_count >= 3 THEN
            RAISE EXCEPTION 'A business cannot have more than 3 active events simultaneously (current: %)', active_count
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_max_active_events ON public.events;
CREATE TRIGGER trg_check_max_active_events
    BEFORE INSERT OR UPDATE OF is_active, is_published, business_id ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.check_max_active_events_per_business();

-- 5. Relational and Spatial Indices
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_zone ON public.businesses(zone);
CREATE INDEX IF NOT EXISTS idx_businesses_coordinates ON public.businesses USING gist(coordinates);

CREATE INDEX IF NOT EXISTS idx_events_business_id ON public.events(business_id);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);

-- 6. Row Level Security on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read verified businesses or own" ON public.businesses;
    DROP POLICY IF EXISTS "Users insert own businesses" ON public.businesses;
    DROP POLICY IF EXISTS "Users update own businesses" ON public.businesses;
    DROP POLICY IF EXISTS "Users delete own businesses" ON public.businesses;
END $$;

CREATE POLICY "Public read verified businesses or own"
    ON public.businesses
    FOR SELECT
    USING (is_verified = true OR auth.uid() = owner_id);

CREATE POLICY "Users insert own businesses"
    ON public.businesses
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users update own businesses"
    ON public.businesses
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users delete own businesses"
    ON public.businesses
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- 7. Row Level Security on events for business owners
DO $$ BEGIN
    DROP POLICY IF EXISTS "Business owners view own events" ON public.events;
    DROP POLICY IF EXISTS "Business owners insert own events" ON public.events;
    DROP POLICY IF EXISTS "Business owners update own events" ON public.events;
    DROP POLICY IF EXISTS "Business owners delete own events" ON public.events;
END $$;

CREATE POLICY "Business owners view own events"
    ON public.events
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = organizer_id
        OR (
            business_id IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM public.businesses b
                WHERE b.id = events.business_id AND b.owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Business owners insert own events"
    ON public.events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = organizer_id
        OR (
            business_id IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM public.businesses b
                WHERE b.id = events.business_id AND b.owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Business owners update own events"
    ON public.events
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = organizer_id
        OR (
            business_id IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM public.businesses b
                WHERE b.id = events.business_id AND b.owner_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        auth.uid() = organizer_id
        OR (
            business_id IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM public.businesses b
                WHERE b.id = events.business_id AND b.owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Business owners delete own events"
    ON public.events
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = organizer_id
        OR (
            business_id IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM public.businesses b
                WHERE b.id = events.business_id AND b.owner_id = auth.uid()
            )
        )
    );

-- 8. Storage bucket 'covers' and policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'covers',
    'covers',
    true,
    5242880, -- 5MB limit
    ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read covers" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users upload covers" ON storage.objects;
    DROP POLICY IF EXISTS "Users update own covers" ON storage.objects;
    DROP POLICY IF EXISTS "Users delete own covers" ON storage.objects;
END $$;

CREATE POLICY "Public read covers"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users upload covers"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'covers'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users update own covers"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'covers'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users delete own covers"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'covers'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
