-- Migration: Create search_events RPC function
-- Implements:
-- - Full-Text Search on search_document tsvector
-- - Typo-tolerant fuzzy matching via pg_trgm similarity on primary title keys
-- - Geospatial radius filtering and distance calculation via PostGIS
-- - Flexible category, date, and pagination filtering

CREATE OR REPLACE FUNCTION public.search_events(
    search_query text DEFAULT NULL,
    filter_locale text DEFAULT 'en',
    filter_category text DEFAULT NULL,
    filter_date_from timestamptz DEFAULT NULL,
    filter_date_to timestamptz DEFAULT NULL,
    user_lat double precision DEFAULT NULL,
    user_lon double precision DEFAULT NULL,
    radius_meters double precision DEFAULT NULL,
    limit_val int DEFAULT 30,
    offset_val int DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    title jsonb,
    description jsonb,
    original_lang varchar(5),
    category text,
    start_date timestamptz,
    end_date timestamptz,
    location_name text,
    address text,
    coordinates extensions.geography,
    cover_image_url text,
    price numeric(10, 2),
    currency varchar(3),
    is_free boolean,
    ticket_url text,
    organizer_id uuid,
    is_published boolean,
    distance_meters double precision,
    relevance_score double precision
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    has_coords boolean := (user_lat IS NOT NULL AND user_lon IS NOT NULL);
    user_point extensions.geography := CASE
        WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL
        THEN ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::extensions.geography
        ELSE NULL
    END;
    trimmed_query text := NULLIF(trim(search_query), '');
    fts_query tsquery := CASE
        WHEN trimmed_query IS NOT NULL
        THEN plainto_tsquery('simple'::regconfig, trimmed_query)
        ELSE NULL
    END;
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.created_at,
        e.updated_at,
        e.title,
        e.description,
        e.original_lang,
        e.category,
        e.start_date,
        e.end_date,
        e.location_name,
        e.address,
        e.coordinates,
        e.cover_image_url,
        e.price,
        e.currency,
        e.is_free,
        e.ticket_url,
        e.organizer_id,
        e.is_published,
        CASE
            WHEN has_coords THEN ST_Distance(e.coordinates, user_point)
            ELSE NULL::double precision
        END AS distance_meters,
        CASE
            WHEN trimmed_query IS NOT NULL THEN (
                ts_rank(e.search_document, fts_query) +
                GREATEST(
                    extensions.similarity(coalesce(e.title->>filter_locale, ''), trimmed_query),
                    extensions.similarity(coalesce(e.title->>'es', ''), trimmed_query),
                    extensions.similarity(coalesce(e.title->>'en', ''), trimmed_query)
                ) * 2.0
            )::double precision
            ELSE 1.0::double precision
        END AS relevance_score
    FROM public.events e
    WHERE
        e.is_published = true
        AND (filter_category IS NULL OR e.category = filter_category)
        AND (
            filter_date_from IS NULL
            OR (e.end_date IS NOT NULL AND e.end_date >= filter_date_from)
            OR (e.start_date >= filter_date_from)
        )
        AND (filter_date_to IS NULL OR e.start_date <= filter_date_to)
        AND (
            radius_meters IS NULL
            OR NOT has_coords
            OR ST_DWithin(e.coordinates, user_point, radius_meters)
        )
        AND (
            trimmed_query IS NULL
            OR e.search_document @@ fts_query
            OR extensions.similarity(coalesce(e.title->>filter_locale, ''), trimmed_query) > 0.15
            OR extensions.similarity(coalesce(e.title->>'es', ''), trimmed_query) > 0.15
            OR extensions.similarity(coalesce(e.title->>'en', ''), trimmed_query) > 0.15
        )
    ORDER BY
        CASE WHEN trimmed_query IS NOT NULL THEN 1 END,
        relevance_score DESC,
        CASE WHEN has_coords AND trimmed_query IS NULL THEN distance_meters END ASC NULLS LAST,
        e.start_date ASC
    LIMIT limit_val
    OFFSET offset_val;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_events TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.search_events IS 'Hyperlocal search RPC combining tsvector full-text search, pg_trgm title similarity, and PostGIS distance/radius filtering.';
