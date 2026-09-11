-- Migration: Create events table with strict multilingual schema and generated search tsvector
-- Specifications:
-- - Multilingual title & description stored as JSONB with ISO 639-1 keys (es, en, fr, de, it, pt)
-- - original_lang strictly validated
-- - PostGIS geography point coordinates
-- - Generated tsvector indexing Spanish, English, and French
-- - Automatic updated_at trigger

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    title jsonb NOT NULL,
    description jsonb NOT NULL,
    original_lang varchar(5) NOT NULL,
    category text NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    location_name text NOT NULL,
    address text,
    coordinates extensions.geography(Point, 4326) NOT NULL,
    cover_image_url text,
    price numeric(10, 2) DEFAULT 0.00 NOT NULL,
    currency varchar(3) DEFAULT 'USD' NOT NULL,
    is_free boolean GENERATED ALWAYS AS (price = 0.00) STORED,
    ticket_url text,
    organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    is_published boolean DEFAULT true NOT NULL,
    search_document tsvector GENERATED ALWAYS AS (
        to_tsvector('spanish'::regconfig, coalesce(title->>'es', '') || ' ' || coalesce(description->>'es', '')) ||
        to_tsvector('english'::regconfig, coalesce(title->>'en', '') || ' ' || coalesce(description->>'en', '')) ||
        to_tsvector('french'::regconfig, coalesce(title->>'fr', '') || ' ' || coalesce(description->>'fr', ''))
    ) STORED,

    CONSTRAINT check_original_lang CHECK (original_lang IN ('es', 'en', 'fr', 'de', 'it', 'pt')),
    CONSTRAINT check_category CHECK (category IN (
        'agenda',
        'workshop',
        'wellness',
        'live_music',
        'gastronomy',
        'nightlife',
        'art_culture',
        'community'
    )),
    CONSTRAINT check_end_date CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT check_price_positive CHECK (price >= 0),
    CONSTRAINT check_title_is_object CHECK (jsonb_typeof(title) = 'object'),
    CONSTRAINT check_description_is_object CHECK (jsonb_typeof(description) = 'object'),
    CONSTRAINT check_title_has_original_lang CHECK (title ? original_lang),
    CONSTRAINT check_description_has_original_lang CHECK (description ? original_lang)
);

CREATE TRIGGER set_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.events IS 'Hyperlocal discovery events with PostGIS coordinates, multilingual JSONB, and generated search vectors.';
COMMENT ON COLUMN public.events.title IS 'Multilingual title object: {"es": "...", "en": "...", ...}';
COMMENT ON COLUMN public.events.description IS 'Multilingual description object: {"es": "...", "en": "...", ...}';
COMMENT ON COLUMN public.events.original_lang IS 'ISO 639-1 code of the original submission language.';
COMMENT ON COLUMN public.events.coordinates IS 'WGS84 PostGIS point: ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography';
COMMENT ON COLUMN public.events.cover_image_url IS 'Static optimized WebP image URL in Supabase Storage.';
