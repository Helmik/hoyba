"use client";

import Link from "next/link";
import { Edit3, Plus, Sparkles, CheckCircle2, Phone, AtSign } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Business } from "@/types/host";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";
import { MAX_ACTIVE_EVENTS_PER_BUSINESS } from "@/constants/config";

interface BusinessCardProps {
  readonly business: Business;
  readonly locale: SupportedLocale;
}

export default function BusinessCard({ business, locale }: BusinessCardProps) {
  const tHost = useTranslations("host");
  const activeCount = business.active_events_count ?? 0;

  return (
    <div
      className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-slate-700"
      style={{ WebkitBackdropFilter: "blur(8px)" }}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{business.name}</h3>
              {business.is_verified && (
                <span title={tHost("verified")}>
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="rounded-md bg-slate-800 px-2 py-0.5 font-medium capitalize text-slate-300">
                {business.category}
              </span>
              <span>•</span>
              <span className="text-slate-400">{business.zone}</span>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${
              activeCount >= MAX_ACTIVE_EVENTS_PER_BUSINESS
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {tHost("activeLimitBadge", { count: activeCount })}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>{business.whatsapp_number}</span>
          </div>
          {business.instagram_handle && (
            <div className="flex items-center gap-1">
              <AtSign className="h-3.5 w-3.5 text-pink-400 shrink-0" />
              <span>@{business.instagram_handle}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
        <Link
          href={ROUTES.HOST_BUSINESS_EDIT(locale, business.id)}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Edit3 className="h-3.5 w-3.5 shrink-0" />
          <span>{tHost("edit")}</span>
        </Link>
        <Link
          href={`${ROUTES.HOST_POSTS(locale)}?businessId=${business.id}`}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>{tHost("posts")}</span>
        </Link>
        <Link
          href={`${ROUTES.HOST_POST_NEW(locale)}?businessId=${business.id}`}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3] shrink-0" />
          <span>{tHost("quickPost")}</span>
        </Link>
      </div>
    </div>
  );
}
