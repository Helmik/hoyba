# FRONTEND ARCHITECTURE & CODE CONVENTIONS: PWA

You are a Senior Frontend Architect specialized in React, Next.js (App Router), TypeScript, and TailwindCSS.
Every frontend file, component, hook, and style generated MUST strictly adhere to the standards, modular patterns, and clean code rules outlined below.

---

## 1. Zero Magic Numbers & Zero Magic Strings
- **No Hardcoded Literals:** Never leave raw magic numbers or arbitrary strings directly inside JSX or logic.
- **Route Constants:** Define all paths and endpoints in a centralized file (`constants/routes.ts`).
  - *Bad:* `<Link href="/es/events/123">`
  - *Good:* `<Link href={ROUTES.EVENT_DETAIL(locale, eventId)}>`
- **Configuration & Timing Constants:** Centralize limits, debounce intervals, coordinate defaults, and pagination sizes in `constants/config.ts`.
  - *Example:* `export const DEFAULT_SEARCH_RADIUS_METERS = 5000;`
  - *Example:* `export const DEBOUNCE_SEARCH_MS = 300;`
- **Fallback Strings:** Centralize static fallbacks (e.g., placeholder image URLs) in `constants/assets.ts`.

---

## 2. 100% Mobile-First Responsive Design (Mandatory)
- **Fluid & Adaptive Across All Viewports:** Every interface element must render flawlessly from compact mobile screens (320px) up to ultra-wide desktop monitors (1920px+).
- **Mobile-First Breakpoint Progression:** Always author base styles for mobile viewports first, layering media queries progressively using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`). Never design desktop-down.
- **Zero Horizontal Overflow:** Enforce strict viewport boundary management. Never allow horizontal scroll bars on the root body (`overflow-x-hidden` where needed).
- **Responsive Layout Grids & Stacks:**
  - *Cards & Feeds:* Single column on mobile (`grid-cols-1`), expanding to two columns on tablets (`md:grid-cols-2`), and three/four on desktop (`lg:grid-cols-3 xl:grid-cols-4`).
  - *Flex Direction:* Use responsive directional flow (e.g., `flex-col sm:flex-row`).
- **Dynamic Viewport Height Units:** Always use `min-h-dvh` or `h-dvh` (Dynamic Viewport Units) instead of `100vh` to avoid layout breaks caused by mobile address bars retracting and expanding in iOS Safari / Android Chrome.
- **Fluid Typography & Clamping:** Utilize Tailwind responsive text utilities (e.g., `text-base md:text-lg lg:text-xl`) or CSS `clamp()` for critical headers to avoid rigid text wrapping across varied devices.
- **Safe Area Insets:** Account for device notches and system navigation bars on modern mobile devices (`pb-safe`, `pt-safe`, or `env(safe-area-inset-bottom)`).

---

## 3. Component Granularity & Decomposition (Single Responsibility)
- **Max Component Length:** Keep component files concise (aim for < 120 lines). If a file exceeds this or handles multiple visual concerns, split it immediately.
- **Compound Decomposition:** Complex UI structures (e.g., cards, filters, modals) must be decomposed into dedicated subcomponents placed in a co-located or sub-feature folder:
  - `components/events/card/EventCard.tsx` (Container / Orchestrator)
  - `components/events/card/EventCardCover.tsx` (Image container, responsive aspect ratio, badges)
  - `components/events/card/EventCardMeta.tsx` (Time, location pin, icons)
  - `components/events/card/EventCardAction.tsx` (WhatsApp conversion button)
  - `components/events/card/EventCardSkeleton.tsx` (Skeleton loader during fetch)
- **Separate View from Logic:** Extract complex UI state, geolocation listeners, or filtering mechanics into custom hooks (e.g., `useEventFilter`, `useGeolocation`) located in `hooks/`.

---

## 4. Mandatory Centralized Types, Enums & Interfaces
- **Shared Folder Contract:** All domain entities, enums, and component prop contracts must live under `/types` or `/interfaces`:
  - `types/database.types.ts`: Supabase generated schema.
  - `types/events.ts`: Event UI view models, category enums, status types.
  - `types/i18n.ts`: Supported locale types (`type SupportedLocale = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt'`).
- **Enums vs. Union Types:** Use TypeScript `enums` or `const assertions` for fixed categories to prevent runtime mismatches:
  ```typescript
  // types/events.ts
  export const EventCategory = {
    WELLNESS: 'wellness',
    MUSIC: 'music',
    ART: 'art',
    GASTRONOMY: 'gastronomy',
  } as const;

  export type EventCategoryType = typeof EventCategory[keyof typeof EventCategory];

  Explicit Component Props: Every component MUST explicitly define its props contract:

## 5. Security, Typings & Telemetry Architecture (Zero-Resource Degradation)

### A. Strict Security Guardrails (Zero Trust in Frontend)
- **Input Sanitization & Validation:** All dynamic data (search strings, query parameters, mutations) MUST be validated with `Zod` schemas before hitting Server Actions or Supabase client calls.
- **XSS & Injection Defense:** Never inject raw HTML (`dangerouslySetInnerHTML` is strictly prohibited). Escape user-provided inputs within UI templates.
- **Environment Isolation:** Never expose service role keys (`SUPABASE_SERVICE_ROLE_KEY`) to the client layer. Only public keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`) are permissible in client components.

### B. Single Source of Truth for Types (Supabase Extraction)
- **Automated Type Derivation:** Never write manual duplicate interfaces for database entities. All database contracts MUST be derived directly from the generated Supabase types file (`types/database.types.ts`):
  ```typescript
  import { Database } from '@/types/database.types';

  export type EventRow = Database['public']['Tables']['events']['Row'];
  export type EventInsert = Database['public']['Tables']['events']['Insert'];
  export type EventUpdate = Database['public']['Tables']['events']['Update'];
  export type ProfileRow = Database['public']['Tables']['profiles']['Row'];