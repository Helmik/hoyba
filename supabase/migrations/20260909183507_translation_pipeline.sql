-- Migration: Asynchronous Multilingual Translation Pipeline
-- Specifications:
-- - Decoupled queue table for non-blocking Server Actions (avoids Vercel timeout)
-- - Automatic trigger on event insertion to enqueue target language translations
-- - Atomic claim function for background workers (Edge Functions / Cron) with SKIP LOCKED
-- - Helper RPC to commit translated JSONB keys back to the event

CREATE TABLE IF NOT EXISTS public.translation_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    source_lang varchar(5) NOT NULL,
    target_lang varchar(5) NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    attempts int DEFAULT 0 NOT NULL,
    error_message text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT check_translation_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    CONSTRAINT unique_event_target_lang UNIQUE (event_id, target_lang)
);

CREATE TRIGGER set_translation_jobs_updated_at
    BEFORE UPDATE ON public.translation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Fast lookup index for workers polling pending jobs
CREATE INDEX IF NOT EXISTS idx_translation_jobs_status_created
    ON public.translation_jobs (status, created_at ASC)
    WHERE status IN ('pending', 'failed');

-- Trigger function: Enqueue translation jobs for missing target locales
CREATE OR REPLACE FUNCTION public.enqueue_event_translations()
RETURNS TRIGGER AS $$
DECLARE
    supported_langs text[] := ARRAY['es', 'en', 'fr', 'de', 'it', 'pt'];
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

CREATE TRIGGER trigger_enqueue_event_translations
    AFTER INSERT ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.enqueue_event_translations();

-- RPC: Atomic claim for translation workers (Edge Functions / Background Workers)
CREATE OR REPLACE FUNCTION public.claim_translation_jobs(
    batch_size int DEFAULT 5,
    max_attempts int DEFAULT 3
)
RETURNS TABLE (
    job_id uuid,
    event_id uuid,
    source_lang varchar(5),
    target_lang varchar(5),
    title_to_translate text,
    desc_to_translate text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH selected_jobs AS (
        SELECT tj.id
        FROM public.translation_jobs tj
        WHERE (tj.status = 'pending' OR (tj.status = 'failed' AND tj.attempts < max_attempts))
        ORDER BY tj.created_at ASC
        LIMIT batch_size
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.translation_jobs tj
    SET
        status = 'processing',
        attempts = tj.attempts + 1,
        updated_at = now()
    FROM selected_jobs sj
    JOIN public.events e ON e.id = (SELECT event_id FROM public.translation_jobs WHERE id = sj.id)
    WHERE tj.id = sj.id
    RETURNING
        tj.id AS job_id,
        tj.event_id,
        tj.source_lang,
        tj.target_lang,
        (e.title->>tj.source_lang) AS title_to_translate,
        (e.description->>tj.source_lang) AS desc_to_translate;
END;
$$;

-- RPC: Commit translation result atomically back into events JSONB and mark job completed
CREATE OR REPLACE FUNCTION public.complete_translation_job(
    p_job_id uuid,
    p_translated_title text,
    p_translated_description text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_id uuid;
    v_target_lang varchar(5);
BEGIN
    -- Retrieve job information
    SELECT event_id, target_lang INTO v_event_id, v_target_lang
    FROM public.translation_jobs
    WHERE id = p_job_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Update events JSONB columns atomically
    UPDATE public.events
    SET
        title = jsonb_set(title, ARRAY[v_target_lang], to_jsonb(p_translated_title)),
        description = jsonb_set(description, ARRAY[v_target_lang], to_jsonb(p_translated_description)),
        updated_at = now()
    WHERE id = v_event_id;

    -- Mark job as completed
    UPDATE public.translation_jobs
    SET
        status = 'completed',
        error_message = NULL,
        updated_at = now()
    WHERE id = p_job_id;

    RETURN true;
END;
$$;

-- Enable RLS
ALTER TABLE public.translation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers view own event translation jobs"
    ON public.translation_jobs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = translation_jobs.event_id
            AND events.organizer_id = auth.uid()
        )
    );

GRANT EXECUTE ON FUNCTION public.claim_translation_jobs TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_translation_job TO service_role;

COMMENT ON TABLE public.translation_jobs IS 'Asynchronous queue table for LLM translation tasks into supported locales.';
