"use client";

import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";

interface BusinessEmptyStateProps {
  readonly locale: SupportedLocale;
}

export default function BusinessEmptyState({ locale }: BusinessEmptyStateProps) {
  const tHost = useTranslations("host");

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center sm:p-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
        <Building2 className="h-8 w-8 shrink-0" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-white">
        {tHost("emptyBusinessesTitle")}
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        {tHost("emptyBusinessesSubtitle")}
      </p>
      <Link
        href={ROUTES.HOST_BUSINESS_NEW(locale)}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
      >
        <Plus className="h-4 w-4 stroke-[3] shrink-0" />
        <span>{tHost("createFirstBusiness")}</span>
      </Link>
    </div>
  );
}
