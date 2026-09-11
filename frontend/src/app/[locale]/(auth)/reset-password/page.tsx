import { getTranslations, setRequestLocale } from "next-intl/server";
import AuthCard from "@/features/auth/components/AuthCard";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
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
    title: `${t("resetPasswordTitle")} | Hoyba`,
    description: t("resetPasswordSubtitle"),
  };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100">
      <AuthCard
        title={t("resetPasswordTitle")}
        subtitle={t("resetPasswordSubtitle")}
        locale={locale as SupportedLocale}
        backLabel={t("backToHome")}
      >
        <ResetPasswordForm locale={locale as SupportedLocale} />
      </AuthCard>
    </main>
  );
}
