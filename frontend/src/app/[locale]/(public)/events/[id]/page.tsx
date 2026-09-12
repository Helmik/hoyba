import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, MapPin, DollarSign, Clock, Sparkles } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { SupportedLocale } from "@/types/i18n.types";
import EventCardAction from "@/components/features/events/card/EventCardAction";
import { formatEventTime } from "@/lib/date";
import { DEFAULT_WHATSAPP_PHONE } from "@/constants/config";
import type { Metadata } from "next";

interface EventDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, description")
    .eq("id", id)
    .single();

  const titles = (event?.title as Record<string, string>) || {};
  const title = titles[locale] || titles["en"] || titles["es"] || "Evento en Tulum";

  return {
    title: `${title} | Hoyba`,
    description: (event?.description as Record<string, string>)?.[locale] || "Descubre eventos en Tulum con Hoyba.",
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const typedLocale = locale as SupportedLocale;
  const tEvents = await getTranslations({ locale: typedLocale, namespace: "events" });
  const tCat = await getTranslations({ locale: typedLocale, namespace: "categories" });

  const titles = (event.title as Record<string, string>) || {};
  const title = titles[locale] || titles["en"] || titles["es"] || tEvents("untitled");
  const descriptions = (event.description as Record<string, string>) || {};
  const description = descriptions[locale] || descriptions["en"] || descriptions["es"] || "";

  return (
    <main className="min-h-dvh bg-slate-950 text-slate-100 pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a la agenda</span>
        </Link>

        <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl">
          {event.cover_image_url ? (
            <div className="relative aspect-[16/9] w-full bg-slate-950">
              <Image
                src={event.cover_image_url}
                alt={title}
                fill
                priority
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center bg-slate-900 text-slate-700">
              <Sparkles className="h-12 w-12 opacity-30" />
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                {tCat(event.category as any)}
              </span>
              {event.is_free ? (
                <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  {tEvents("free")}
                </span>
              ) : (
                <span className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-bold text-slate-200">
                  ${event.price} {event.currency}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-slate-800/80 text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{formatEventTime(event.start_date, typedLocale)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{event.location_name}</span>
              </div>
            </div>

            {description && (
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300">
                <p>{description}</p>
              </div>
            )}

            <div className="pt-4">
              <EventCardAction
                eventId={event.id}
                eventTitle={title}
                price={event.price}
                currency={event.currency}
                whatsappPhone={(event as any).whatsapp_phone || DEFAULT_WHATSAPP_PHONE}
              />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
