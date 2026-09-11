-- Migration: Add Dutch (nl), Russian (ru), Ukrainian (uk), and Polish (pl) support
-- Specifications:
-- - Update check_original_lang constraint on events table to support: es, en, fr, de, it, pt, nl, ru, uk, pl
-- - Update enqueue_event_translations trigger function to dispatch translation jobs for all 10 locales

-- 1. Update check_original_lang constraint on events table
ALTER TABLE public.events
    DROP CONSTRAINT IF EXISTS check_original_lang;

ALTER TABLE public.events
    ADD CONSTRAINT check_original_lang
    CHECK (original_lang IN ('es', 'en', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'uk', 'pl'));

-- 2. Update enqueue_event_translations trigger function with all 10 locales
CREATE OR REPLACE FUNCTION public.enqueue_event_translations()
RETURNS TRIGGER AS $$
DECLARE
    supported_langs text[] := ARRAY['es', 'en', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'uk', 'pl'];
    target text;
BEGIN
    FOREACH target IN ARRAY supported_langs
    LOOP
        -- Only enqueue if the target language is different from original_lang
        -- and not already provided in the title payload
        IF target <> NEW.original_lang AND NOT (NEW.title ? target) THEN
            INSERT INTO public.translation_jobs (
                event_id,
                source_lang,
                target_lang,
                status
            ) VALUES (
                NEW.id,
                NEW.original_lang,
                target,
                'pending'
            )
            ON CONFLICT (event_id, target_lang) DO NOTHING;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
