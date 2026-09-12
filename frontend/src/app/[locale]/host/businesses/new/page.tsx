import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import QuickBusinessForm from "@/components/host/QuickBusinessForm";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";

interface NewBusinessPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function NewBusinessPage({ params }: NewBusinessPageProps) {
  const { locale } = await params;
  const typedLocale = locale as SupportedLocale;
  const tHost = await getTranslations({ locale: typedLocale, namespace: "host" });

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
            {tHost("newBusiness")}
          </h1>
          <p className="text-xs text-slate-400">
            {tHost("newBusinessSubtitle")}
          </p>
        </div>
      </div>

      <QuickBusinessForm locale={typedLocale} />
    </div>
  );
}
