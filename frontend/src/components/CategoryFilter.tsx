"use client";

import { useTranslations } from "next-intl";
import {
  Calendar,
  Sparkles,
  Flame,
  Music,
  Utensils,
  Moon,
  Palette,
  Users,
  Grid,
} from "lucide-react";

export const CATEGORIES = [
  { id: "all", icon: Grid },
  { id: "agenda", icon: Calendar },
  { id: "workshop", icon: Sparkles },
  { id: "wellness", icon: Flame },
  { id: "live_music", icon: Music },
  { id: "gastronomy", icon: Utensils },
  { id: "nightlife", icon: Moon },
  { id: "art_culture", icon: Palette },
  { id: "community", icon: Users },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function CategoryFilter({
  activeCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const t = useTranslations("categories");

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex gap-2 min-w-max px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]"
                  : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t(cat.id as any)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
