"use client";

import { Trash2, Power, Loader2 } from "lucide-react";

interface HostEventCardActionsProps {
  readonly isActive: boolean;
  readonly isUpdating: boolean;
  readonly onToggle: () => void;
  readonly onDelete: () => void;
}

export default function HostEventCardActions({
  isActive,
  isUpdating,
  onToggle,
  onDelete,
}: HostEventCardActionsProps) {
  return (
    <div className="flex items-center gap-2 self-end sm:self-center">
      <button
        type="button"
        onClick={onToggle}
        disabled={isUpdating}
        title={isActive ? "Pausar" : "Activar"}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border p-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
          isActive
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
        }`}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Power className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={isUpdating}
        title="Eliminar"
        style={{ WebkitTapHighlightColor: "transparent" }}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
