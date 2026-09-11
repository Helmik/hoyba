import { setRequestLocale } from "next-intl/server";
import { createPublicClient } from "@/lib/supabase/public";
import HomeClientContainer from "@/components/home/HomeClientContainer";
import type { EventViewModel } from "@/types/events";
import type { SupportedLocale } from "@/types/i18n";
import { captureAppError } from "@/lib/error";
import {
  ISR_REVALIDATE_SECONDS,
  DEFAULT_PAGE_SIZE,
  DEFAULT_WHATSAPP_PHONE,
} from "@/constants/config";

// Enforce 1-hour ISR cache on Vercel Edge Network (Next.js requires numeric literal for AST extraction)
export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let viewModels: EventViewModel[] = [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("start_date", { ascending: true })
      .limit(DEFAULT_PAGE_SIZE);

    if (!error && data && data.length > 0) {
      viewModels = data.map((ev) => ({
        id: ev.id,
        title: (ev.title as Record<string, string>) || {},
        description: (ev.description as Record<string, string>) || {},
        originalLang: ev.original_lang,
        category: ev.category,
        startDate: ev.start_date,
        endDate: ev.end_date,
        locationName: ev.location_name,
        address: ev.address,
        coordinates: (ev.coordinates as any) || null,
        coverImageUrl: ev.cover_image_url,
        price: Number(ev.price) || 0,
        currency: ev.currency,
        isFree: Boolean(ev.is_free),
        ticketUrl: ev.ticket_url,
        whatsappPhone: DEFAULT_WHATSAPP_PHONE,
      }));
    }
  } catch (err) {
    console.error("Error fetching events from Supabase in RSC HomePage:", err);
    captureAppError(err, { section: "home_events_fetch", tags: { locale } });
  }

  // Fallback high-fidelity mock events for initial empty state or offline dev
  if (viewModels.length === 0) {
    viewModels = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        title: {
          es: "Ceremonia de Cacao & Sound Healing al Atardecer",
          en: "Sunset Cacao Ceremony & Sound Healing",
        },
        description: {
          es: "Conecta con la medicina del cacao sagrado y frecuencias sonoras en un santuario íntimo de la selva maya.",
          en: "Connect with sacred cacao medicine and sound frequencies in an intimate Mayan jungle sanctuary.",
        },
        originalLang: "es",
        category: "wellness",
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
        locationName: "Holistika Sanctuary",
        address: "Av. 10 Sur, La Veleta, Tulum",
        coordinates: { type: "Point", coordinates: [-87.4725, 20.2089] },
        coverImageUrl:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1080&q=80",
        price: 35,
        currency: "USD",
        isFree: false,
        ticketUrl: null,
        whatsappPhone: DEFAULT_WHATSAPP_PHONE,
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        title: {
          es: "Afro-House Sunset Session & Live Percussion",
          en: "Afro-House Sunset Session & Live Percussion",
        },
        description: {
          es: "Música electrónica orgánica y percusiones en vivo frente al mar caribeño durante la puesta de sol.",
          en: "Organic afro-house rhythms and live percussion facing the Caribbean sea during sunset.",
        },
        originalLang: "en",
        category: "live_music",
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 9).toISOString(),
        locationName: "Papaya Playa Project",
        address: "Km 4.5 Carr. Tulum-Boca Paila, Zona Costera, Tulum",
        coordinates: { type: "Point", coordinates: [-87.4398, 20.1798] },
        coverImageUrl:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&q=80",
        price: 0,
        currency: "USD",
        isFree: true,
        ticketUrl: null,
        whatsappPhone: DEFAULT_WHATSAPP_PHONE,
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        title: {
          es: "Taller de Barro y Escultura Ancestral",
          en: "Mayan Clay & Ancestral Sculpting Workshop",
        },
        description: {
          es: "Aprende las técnicas tradicionales de modelado con barro local y pigmentos naturales.",
          en: "Learn traditional clay sculpting with local materials and natural earth pigments.",
        },
        originalLang: "es",
        category: "workshop",
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 1).toISOString(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
        locationName: "Kanan Arts Hub",
        address: "Av. Kukulkan, Aldea Zamá, Tulum",
        coordinates: { type: "Point", coordinates: [-87.4601, 20.1982] },
        coverImageUrl:
          "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1080&q=80",
        price: 25,
        currency: "USD",
        isFree: false,
        ticketUrl: null,
        whatsappPhone: DEFAULT_WHATSAPP_PHONE,
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        title: {
          es: "Cata de Mezcales Oaxaqueños & Cocina de Humo",
          en: "Artisanal Mezcal Tasting & Fire Pit Dinner",
        },
        description: {
          es: "Degustación guiada de 5 agaves silvestres maridados con bocados de temporada cocinados a la leña.",
          en: "Guided tasting of 5 wild agave mezcals paired with seasonal fire-cooked Mexican bites.",
        },
        originalLang: "es",
        category: "gastronomy",
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        locationName: "Arca Jungle Restaurant",
        address: "Av. Tulum Centro s/n, Centro, Tulum",
        coordinates: { type: "Point", coordinates: [-87.4645, 20.2114] },
        coverImageUrl:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1080&q=80",
        price: 45,
        currency: "USD",
        isFree: false,
        ticketUrl: null,
        whatsappPhone: DEFAULT_WHATSAPP_PHONE,
      },
    ];
  }

  // Generate JSON-LD Schema for Technical SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: viewModels.map((ev, index) => {
      const title =
        ev.title?.[locale] || ev.title?.[ev.originalLang] || "Event";

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Event",
          name: title,
          startDate: ev.startDate,
          endDate: ev.endDate || ev.startDate,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: ev.locationName,
            address: ev.address || ev.locationName,
          },
          image: ev.coverImageUrl ? [ev.coverImageUrl] : [],
          offers: {
            "@type": "Offer",
            price: ev.price,
            priceCurrency: ev.currency,
            availability: "https://schema.org/InStock",
            url: ev.ticketUrl || undefined,
          },
        },
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClientContainer initialEvents={viewModels} />
    </>
  );
}
