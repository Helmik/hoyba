"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { forgotPasswordAction, type AuthActionResult } from "../actions/auth.actions";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";

interface ForgotPasswordFormProps {
  readonly locale: SupportedLocale;
}

export default function ForgotPasswordForm({
  locale,
}: ForgotPasswordFormProps) {
  const t = useTranslations("auth");

  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(forgotPasswordAction, null);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-white">
          {t("forgotPasswordSuccess")}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Revisa tu bandeja de entrada o carpeta de spam y haz clic en el enlace para restablecer tu contraseña.
        </p>
        <div className="pt-4">
          <Link
            href={ROUTES.LOGIN(locale)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("rememberPassword")}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />

      {/* Error Message */}
      {state?.error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="forgot-email"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          {t("emailLabel")}
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="forgot-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-4 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("sendingEmail")}</span>
          </>
        ) : (
          <span>{t("submitForgotPassword")}</span>
        )}
      </button>

      {/* Back to Login Link */}
      <div className="pt-2 text-center text-xs text-slate-400">
        <Link
          href={ROUTES.LOGIN(locale)}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("rememberPassword")}</span>
        </Link>
      </div>
    </form>
  );
}
