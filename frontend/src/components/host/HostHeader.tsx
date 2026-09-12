"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";
import HostTabs from "./HostTabs";

interface HostHeaderProps {
  readonly locale: SupportedLocale;
  readonly userEmail?: string;
  readonly hasBusinesses?: boolean;
}

export default function HostHeader({
  locale,
  userEmail,
  hasBusinesses = false,
}: HostHeaderProps) {
  const tHost = useTranslations("host");

  const pathname = usePathname();
  const isCreatingPost = pathname.includes("/host/posts/new");

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md"
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 md:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.HOME(locale)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 transition-colors hover:border-amber-500/40 hover:text-white"
            title={tHost("backToHome")}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-amber-400">HOYBA</span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                {tHost("hostBadge")}
              </span>
            </div>
            {userEmail && (
              <p className="text-[11px] text-slate-400 truncate max-w-[160px] sm:max-w-[240px]">
                {userEmail}
              </p>
            )}
          </div>
        </div>

        {/* Quick Action: Only show + Publicar when host has businesses and not already on new post */}
        {hasBusinesses && !isCreatingPost && (
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.HOST_POST_NEW(locale)}
              style={{ WebkitTapHighlightColor: "transparent" }}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[3] shrink-0" />
              <span>{tHost("header.newPost")}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mx-auto flex w-full max-w-5xl px-4 pb-2 pt-1 sm:px-6 md:px-8 lg:px-12">
        <HostTabs locale={locale} />
      </div>
    </header>
  );
}
