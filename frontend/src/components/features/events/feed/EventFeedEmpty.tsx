"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Compass, RefreshCw } from "lucide-react";

export interface EventFeedEmptyProps {
  onClearFilters?: () => void;
}

export default function EventFeedEmpty({ onClearFilters }: EventFeedEmptyProps) {
  const tHome = useTranslations("home");

  return (
    <div className="my-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-8 sm:p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
        <Compass className="h-8 w-8 stroke-[1.5]" />
      </div>
      <h3 className="mb-2 text-lg font-extrabold text-white">
        {tHome("emptyTitle")}
      </h3>
      <p className="max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
        {tHome("emptySubtitle")}
      </p>
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98]"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          <span>{tHome("clearFilters")}</span>
        </button>
      )}
    </div>
  );
}
