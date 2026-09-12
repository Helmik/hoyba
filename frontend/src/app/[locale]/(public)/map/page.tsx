import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import LeafletMap from "@/components/features/map/LeafletMap";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa Interactivo | Hoyba",
  description: "Explora todos los eventos activos en el mapa interactivo de Tulum.",
};

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: rawEvents } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true);

  const events = (rawEvents || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    originalLang: e.original_lang || "es",
    category: e.category,
    startDate: e.start_date,
    endDate: e.end_date,
    locationName: e.location_name,
    address: e.address,
    coordinates: e.coordinates,
    coverImageUrl: e.cover_image_url,
    price: e.price,
    currency: e.currency,
    isFree: e.is_free,
    ticketUrl: e.ticket_url,
    whatsappPhone: e.whatsapp_phone,
  }));

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6">
        <LeafletMap events={events} className="h-[calc(100dvh-10rem)] w-full rounded-3xl border border-slate-800" />
      </main>
      <BottomNav activeTab="map" onSelectTab={() => {}} />
    </div>
  );
}
