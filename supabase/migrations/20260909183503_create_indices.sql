-- Migration: Create spatial, full-text search, and trigram indices for events
-- Specifications:
-- - GiST spatial index on PostGIS coordinates
-- - GIN index on search_document tsvector
-- - GIN indices with pg_trgm for typo-tolerant title searching in primary locales (es, en)
-- - Partial indices for published events and date range ordering

CREATE INDEX IF NOT EXISTS idx_events_coordinates
    ON public.events
    USING gist (coordinates);

CREATE INDEX IF NOT EXISTS idx_events_search_document
    ON public.events
    USING gin (search_document);

CREATE INDEX IF NOT EXISTS idx_events_title_es_trgm
    ON public.events
    USING gin (((title->>'es')) extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_events_title_en_trgm
    ON public.events
    USING gin (((title->>'en')) extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_events_published_start_date
    ON public.events (start_date ASC)
    WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_events_category
    ON public.events (category)
    WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_events_organizer
    ON public.events (organizer_id)
    WHERE organizer_id IS NOT NULL;
