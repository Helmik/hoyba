import React from "react";
import { cn } from "@/lib/utils";

export interface ChipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1",
        className
      )}
    >
      {children}
    </div>
  );
};
