"use client";

import { useRouter } from "next/navigation";
import { Sparkles, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Business } from "@/types/host";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";

interface QuickBusinessSuccessProps {
  readonly business: Business;
  readonly locale: SupportedLocale;
}

export default function QuickBusinessSuccess({ business, locale }: QuickBusinessSuccessProps) {
  const router = useRouter();
  const tHost = useTranslations("host");

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 text-center sm:p-8 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-black text-white">{tHost("businessCreatedTitle")}</h2>
      <p className="mt-2 text-sm text-slate-400">
        {tHost("businessCreatedSubtitle", { name: business.name })}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push(`${ROUTES.HOST_POST_NEW(locale)}?businessId=${business.id}`)}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400"
        >
          <Sparkles className="h-4 w-4 stroke-[3]" />
          <span>{tHost("publishFirstEvent")}</span>
        </button>
        <button
          type="button"
          onClick={() => router.push(ROUTES.HOST_BUSINESS_EDIT(locale, business.id))}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
        >
          <UserCheck className="h-4 w-4" />
          <span>{tHost("completeProfile")}</span>
        </button>
      </div>
    </div>
  );
}
