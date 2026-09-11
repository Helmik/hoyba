"use client";

import { useTranslations } from "next-intl";
import { EventCategory, type EventCategoryType } from "@/types/events";
import { analytics } from "@/lib/analytics";

const CHIP_LIST: readonly EventCategoryType[] = [
  EventCategory.ALL,
  EventCategory.WELLNESS,
  EventCategory.MUSIC,
  EventCategory.ART,
  EventCategory.GASTRONOMY,
] as const;

interface CategoryChipsProps {
  readonly activeCategory: EventCategoryType;
  readonly onSelectCategory: (cat: EventCategoryType) => void;
}

export default function CategoryChips({
  activeCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  const tChips = useTranslations("chips");

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex gap-2 min-w-max px-0.5">
        {CHIP_LIST.map((chip) => {
          const isActive = activeCategory === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => {
                onSelectCategory(chip);
                analytics.categoryFilter(chip);
              }}
              className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 active:scale-[0.98] ${
                isActive
                  ? "bg-emerald-700 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/50 scale-[1.02]"
                  : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              {tChips(chip as any)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
