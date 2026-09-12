"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ChipProps {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  isSelected = false,
  onClick,
  icon,
  className,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none whitespace-nowrap",
        isSelected
          ? "bg-amber-500 text-slate-950 font-semibold shadow-sm"
          : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60",
        disabled && "opacity-50 pointer-events-none cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
