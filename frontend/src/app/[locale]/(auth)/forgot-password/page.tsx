import { getTranslations, setRequestLocale } from "next-intl/server";
import AuthCard from "@/features/auth/components/AuthCard";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import type { SupportedLocale } from "@/types/i18n";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return {
    title: `${t("forgotPasswordTitle")} | Hoyba`,
    description: t("forgotPasswordSubtitle"),
  };
}

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  const { email } = (await searchParams) || {};
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100">
      <AuthCard
        title={t("forgotPasswordTitle")}
        subtitle={t("forgotPasswordSubtitle")}
        locale={locale as SupportedLocale}
        backLabel={t("backToHome")}
      >
        <ForgotPasswordForm locale={locale as SupportedLocale} initialEmail={email} />
      </AuthCard>
    </main>
  );
}
