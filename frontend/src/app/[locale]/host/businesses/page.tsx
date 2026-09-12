import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getUserBusinesses } from "@/app/actions/host";
import { ROUTES } from "@/constants/routes";
import type { SupportedLocale } from "@/types/i18n";
import BusinessCard from "@/components/host/BusinessCard";
import BusinessEmptyState from "@/components/host/BusinessEmptyState";

interface BusinessesPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function BusinessesPage({ params }: BusinessesPageProps) {
  const { locale } = await params;
  const typedLocale = locale as SupportedLocale;
  const tHost = await getTranslations({ locale: typedLocale, namespace: "host" });

  const result = await getUserBusinesses();
  const businesses = result.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {tHost("businesses.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {tHost("businesses.subtitle")}
          </p>
        </div>

        {businesses.length > 0 && (
          <Link
            href={ROUTES.HOST_BUSINESS_NEW(typedLocale)}
            style={{ WebkitTapHighlightColor: "transparent" }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm transition-all hover:bg-amber-400 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5] shrink-0" />
            <span>{tHost("newBusiness")}</span>
          </Link>
        )}
      </div>

      {businesses.length === 0 ? (
        <BusinessEmptyState locale={typedLocale} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              locale={typedLocale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
