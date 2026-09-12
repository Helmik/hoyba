"use client";

import React from "react";
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
import { Chip } from "@/components/ui/chip/Chip";
import { ChipGroup } from "@/components/ui/chip/ChipGroup";

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

export interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function CategoryFilter({
  activeCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const t = useTranslations("categories");

  return (
    <div className="w-full">
      <ChipGroup>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <Chip
              key={cat.id}
              label={t(cat.id as any)}
              isSelected={isActive}
              onClick={() => onSelectCategory(cat.id)}
              icon={<Icon className="h-3.5 w-3.5" />}
            />
          );
        })}
      </ChipGroup>
    </div>
  );
}
