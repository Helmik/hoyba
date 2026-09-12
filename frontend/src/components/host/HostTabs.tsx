"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";

interface HostTabsProps {
  readonly locale: SupportedLocale;
}

export default function HostTabs({ locale }: HostTabsProps) {
  const tHost = useTranslations("host");
  const pathname = usePathname();

  const isBusinesses = pathname.includes("/host/businesses");
  const isPosts = pathname.includes("/host/posts");

  return (
    <nav
      role="tablist"
      aria-label={tHost("tabs.businesses")}
      className="flex items-center gap-2"
    >
      <Link
        href={ROUTES.HOST_BUSINESSES(locale)}
        role="tab"
        aria-selected={isBusinesses}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className={`flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors ${
          isBusinesses
            ? "bg-slate-800/90 text-amber-400 shadow-inner"
            : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
        }`}
      >
        <Building2 className="h-4 w-4 shrink-0" />
        <span>{tHost("tabs.businesses")}</span>
      </Link>
      <Link
        href={ROUTES.HOST_POSTS(locale)}
        role="tab"
        aria-selected={isPosts}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className={`flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors ${
          isPosts
            ? "bg-slate-800/90 text-amber-400 shadow-inner"
            : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
        }`}
      >
        <Sparkles className="h-4 w-4 shrink-0" />
        <span>{tHost("tabs.posts")}</span>
      </Link>
    </nav>
  );
}
