"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { captureAppError } from "@/lib/error";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureAppError(error, {
      section: "app_boundary",
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 mb-4">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">
        Algo no salió como esperábamos
      </h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        Hemos registrado este incidente en nuestro sistema de monitoreo para solucionarlo a la brevedad.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-amber-400 active:scale-[0.98]"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reintentar</span>
      </button>
    </div>
  );
}
