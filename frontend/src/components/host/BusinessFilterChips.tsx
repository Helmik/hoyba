"use client";

import { Building2 } from "lucide-react";
import type { Business } from "@/types/host";

interface BusinessFilterChipsProps {
  readonly businesses: Business[];
  readonly totalEventsCount: number;
  readonly selectedBusinessId: string;
  readonly onSelect: (businessId: string) => void;
  readonly allLabel: string;
}

export default function BusinessFilterChips({
  businesses,
  totalEventsCount,
  selectedBusinessId,
  onSelect,
  allLabel,
}: BusinessFilterChipsProps) {
  if (businesses.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
      <button
        type="button"
        onClick={() => onSelect("all")}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className={`min-h-[44px] rounded-xl px-4 text-xs font-semibold transition-colors ${
          selectedBusinessId === "all"
            ? "bg-amber-500 text-slate-950 font-bold"
            : "bg-slate-900 text-slate-400 hover:text-white"
        }`}
      >
        {allLabel} ({totalEventsCount})
      </button>
      {businesses.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onSelect(b.id)}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className={`flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 text-xs font-semibold transition-colors ${
            selectedBusinessId === b.id
              ? "bg-amber-500 text-slate-950 font-bold"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>{b.name}</span>
        </button>
      ))}
    </div>
  );
}
