import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getUserBusinesses, getHostEvents } from "@/app/actions/host";
import { ROUTES } from "@/constants/routes";
import type { SupportedLocale } from "@/types/i18n";
import HostEventsList from "@/components/host/HostEventsList";

interface PostsPageProps {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ businessId?: string }>;
}

export default async function PostsPage({ params, searchParams }: PostsPageProps) {
  const { locale } = await params;
  const { businessId } = await searchParams;
  const typedLocale = locale as SupportedLocale;
  const tHost = await getTranslations({ locale: typedLocale, namespace: "host" });

  const [businessesRes, eventsRes] = await Promise.all([
    getUserBusinesses(),
    getHostEvents(),
  ]);

  const businesses = businessesRes.data || [];
  const events = eventsRes.data || [];

  if (businesses.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Building2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-white">{tHost("mustRegisterBusinessTitle")}</h2>
        <p className="mt-2 text-xs text-slate-400">
          {tHost("mustRegisterBusinessSubtitle")}
        </p>
        <Link
          href={ROUTES.HOST_BUSINESS_NEW(typedLocale)}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>{tHost("newBusiness")}</span>
        </Link>
      </div>
    );
  }

  return (
    <HostEventsList
      businesses={businesses}
      initialEvents={events}
      initialBusinessId={businessId}
      locale={typedLocale}
    />
  );
}
