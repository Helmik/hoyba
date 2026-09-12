"use client";

import Link from "next/link";
import { Plus, Sparkles, Building2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";
import type { SupportedLocale } from "@/types/i18n";

interface BottomNavHostSheetProps {
  readonly isOpen: boolean;
  readonly locale: SupportedLocale;
  readonly onClose: () => void;
}

export default function BottomNavHostSheet({
  isOpen,
  locale,
  onClose,
}: BottomNavHostSheetProps) {
  const tHost = useTranslations("host");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm sm:hidden animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl border-t border-slate-800 bg-[#0B1218] p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-800" />
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-bold text-white">{tHost("actions")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-slate-400 hover:text-white"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Link
            href={ROUTES.HOST_POST_NEW(locale)}
            onClick={onClose}
            className="flex min-h-[48px] flex-col justify-center rounded-2xl bg-amber-500 p-3 text-slate-950 shadow-md transition-all active:scale-95"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span className="mt-1 text-xs font-black">{tHost("newPost")}</span>
          </Link>

          <Link
            href={ROUTES.HOST_BUSINESS_NEW(locale)}
            onClick={onClose}
            className="flex min-h-[48px] flex-col justify-center rounded-2xl border border-slate-700 bg-slate-900/90 p-3 text-slate-200 shadow-md transition-all active:scale-95 hover:border-amber-500/40"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Building2 className="h-4 w-4 text-amber-400" />
            <span className="mt-1 text-xs font-bold">{tHost("newBusiness")}</span>
          </Link>

          <Link
            href={ROUTES.HOST_POSTS(locale)}
            onClick={onClose}
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{tHost("tabs.posts")}</span>
          </Link>

          <Link
            href={ROUTES.HOST_BUSINESSES(locale)}
            onClick={onClose}
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            <span>{tHost("tabs.businesses")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
