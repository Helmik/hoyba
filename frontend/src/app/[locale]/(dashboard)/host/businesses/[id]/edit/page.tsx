import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getBusinessById } from "@/app/actions/host";
import { ROUTES } from "@/constants/routes";
import type { SupportedLocale } from "@/types/i18n";
import EditBusinessForm from "@/components/host/EditBusinessForm";

interface EditBusinessPageProps {
  readonly params: Promise<{ locale: string; id: string }>;
}

export default async function EditBusinessPage({ params }: EditBusinessPageProps) {
  const { locale, id } = await params;
  const typedLocale = locale as SupportedLocale;
  const tHost = await getTranslations({ locale: typedLocale, namespace: "host" });

  const result = await getBusinessById(id);
  if (!result.success || !result.data) {
    notFound();
  }

  const business = result.data;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.HOST_BUSINESSES(typedLocale)}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white sm:text-2xl">
            {tHost("editProfile")} — {business.name}
          </h1>
          <p className="text-xs text-slate-400">
            {tHost("editBusinessSubtitle")}
          </p>
        </div>
      </div>

      <EditBusinessForm business={business} locale={typedLocale} />
    </div>
  );
}
