import type { ReactNode } from "react";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";

interface AuthCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly locale: SupportedLocale;
  readonly children: ReactNode;
  readonly backHref?: string;
  readonly backLabel?: string;
}

export default function AuthCard({
  title,
  subtitle,
  locale,
  children,
  backHref,
  backLabel,
}: AuthCardProps) {
  const homeHref = backHref || ROUTES.HOME(locale);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back to Home Link */}
      <div className="mb-6">
        <Link
          href={homeHref}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel || "Hoyba"}</span>
        </Link>
      </div>

      {/* Card Container */}
      <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Brand Icon & Header */}
        <div className="relative mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Compass className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Main Content */}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
