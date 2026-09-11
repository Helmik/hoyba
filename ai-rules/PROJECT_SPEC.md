# AGENT INSTRUCTION SPECIFICATION: LOCAL DISCOVERY PWA

## 1. System Overview & Core Philosophy
You are building an AI-first, zero-infrastructure-cost ($0 USD during validation) Progressive Web App (PWA) for hyperlocal experience discovery in high-turnover tourist destinations.
Target Audience: International travelers seeking immediate plans (today's agenda, workshops, wellness, live music) without account creation or app installation friction.
Operational Rule: Zero manual content entry bottleneck. All heavy or asynchronous jobs (visual compilation, multilingual translation) must be strictly decoupled from user-facing HTTP request-response cycles.

## 2. Technical Stack & Invariant Constraints
- **Frontend / PWA:** Next.js 14+ (App Router), React Server Components (RSC), TypeScript (Strict Mode), TailwindCSS.
- **Static i18n:** `next-intl` localized routing (`/[locale]/...`) supporting `es`, `en`, `fr`, `de`, `it`, `pt`.
- **Mapping:** Lightweight Leaflet.js with Carto/OSM vector tiles. Strictly avoid heavy mapping SDKs like Google Maps.
- **Database, Auth & Storage:** Supabase (PostgreSQL 15, PostGIS extension, Supabase Auth via Magic Links, Supabase Storage).
- **Database Migrations:** Supabase CLI exclusively (`/supabase/migrations/*.sql`). Strictly avoid ORMs (Prisma, Drizzle) to retain native PostGIS and JSONB query control.
- **Search Engine:** PostgreSQL native Full-Text Search (`tsvector`) with `pg_trgm` extension. Do not introduce external SaaS search clusters.
- **Image Compilation:** `@vercel/og` (Satori/Resvg) generating 1080x1920 px static assets.
- **Deployment & Edge Execution:** Vercel (Hobby Tier). Single daily cron job scheduled at 8:00 AM local time.

## 3. Multilingual Data & Translation Rules (Dynamic i18n)
1. **Database Representation:**
   - Content fields (`title`, `description`) must be stored as PostgreSQL `JSONB`:
     Example: `{"es": "...", "en": "...", "fr": "...", "de": "...", "it": "...", "pt": "..."}`
   - `original_lang` stores the submission language code (ISO 639-1).
2. **Asynchronous Translation Pipeline:**
   - Server Actions mutating events MUST NOT await multi-language translations synchronously (to prevent Vercel 10-second timeout violations).
   - Initial insert stores only the original language key inside the JSONB payload.
   - An asynchronous Database Webhook or Supabase Edge Function triggers background translation via a lightweight LLM API into target locales and updates the JSONB columns.
3. **Search Ingestion:**
   - `search_document` must be a generated `tsvector` column indexing keys across Spanish, English, and French, combined with `pg_trgm` GIN indices on primary title keys to support typo-tolerant lookups via the `search_events` RPC function.

## 4. Technical SEO, Strict Edge Caching & AI Bot Defense
1. **AI Scraper Blocking (`public/robots.txt`):**
   - Standard web search engines (Googlebot, Bingbot) MUST be allowed for organic discovery.
   - Generative AI scrapers and training crawlers MUST be explicitly blocked to protect proprietary hyperlocal data:
     `GPTBot`, `ChatGPT-User`, `Google-Extended`, `CCBot`, `ClaudeBot`, `PerplexityBot`, `Bytespider`, `Diffbot`.
2. **Serverless Execution Protection (Edge CDN Caching):**
   - To prevent web crawlers from exhausting the monthly Vercel Serverless Function limit (100k invocations), public discovery pages (`/[locale]`, `/[locale]/events/[id]`) MUST enforce **Incremental Static Regeneration (ISR)**:
     `export const revalidate = 3600;` (1-hour cache on Vercel Edge Network).
   - Dynamic sitemap (`app/sitemap.ts`) must enforce `export const revalidate = 21600;` (6 hours) to prevent database flooding on crawler hits.
   - OpenGraph images for events must point directly to static, optimized WebP URLs in **Supabase Storage** (`event.cover_image_url`). Do NOT render `@vercel/og` images dynamically per event request.
3. **Structured Data & Canonical Routing:**
   - Detail views must inject valid JSON-LD schemas (`@type: "Event"`) with ISO timestamps and location data.
   - Multilingual alternate URLs (`hreflang` tags) must be declared via Next.js `generateMetadata` for `es`, `en`, `fr`, `de`, `it`, `pt`.

## 5. Architectural Boundaries for the Agent
- **Type Safety:** Always generate TypeScript interfaces directly from Supabase schemas (`supabase gen types typescript --local`). Never write ad-hoc database types.
- **Input Validation:** Every Server Action mutating data must enforce runtime schema validation using `Zod` before touching the database.
- **Instagram Story Generation:** Compile the daily story asset exclusively in English (the universal lingua franca for international tourists) and execute it only once per day via the 8:00 AM Cron Handler.

## 6. Observability, Telemetry & Exception Handling ($0 Operational Overhead)
1. **Product Analytics & Telemetry (Vercel Web Analytics):**
   - Track client navigation, Core Web Vitals, and user conversions strictly through `@vercel/analytics`.
   - Never write analytic traces or high-frequency telemetry events to PostgreSQL/Supabase to avoid connection pool exhaustion and disk saturation.
   - Instrument lightweight custom events for conversion tracking:
     * WhatsApp CTA conversions: `va.track('whatsapp_lead_click', { event_id: id, category: cat, zone: zone })`
     * Locale switching: `va.track('locale_changed', { to_locale: targetLocale })`[cite: 1]
     * Search execution: `va.track('search_executed', { query_term: term })`

2. **Technical Error Tracking & Stability (Sentry):**
   - Integrate `@sentry/nextjs` (Free Tier) to monitor runtime exceptions across client, Edge Middleware, and Server Actions without database overhead.
   - Sentry configuration rules:
     * `tracesSampleRate`: Set to `0.1` (10% sampling) to stay strictly within Sentry Free Tier quotas.
     * Mask sensitive environment variables and redact user phone numbers or session tokens before event dispatch.
     * Wrap top-level React Error Boundaries with Sentry error capture (`Sentry.captureException(error)`).
     * Server Actions and database operations must catch and forward critical exceptions to Sentry while returning safe, sanitized error payloads to the user.