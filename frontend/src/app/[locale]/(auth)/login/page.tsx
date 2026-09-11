import { getTranslations, setRequestLocale } from "next-intl/server";
import AuthCard from "@/features/auth/components/AuthCard";
import LoginForm from "@/features/auth/components/LoginForm";
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
    title: `${t("loginTitle")} | Hoyba`,
    description: t("loginSubtitle"),
  };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ reset?: string }>;
}) {
  const { locale } = await params;
  const { reset } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100">
      <AuthCard
        title={t("loginTitle")}
        subtitle={t("loginSubtitle")}
        locale={locale as SupportedLocale}
        backLabel={t("backToHome")}
      >
        <LoginForm
          locale={locale as SupportedLocale}
          messageFromQuery={reset === "success" ? "reset_success" : undefined}
        />
      </AuthCard>
    </main>
  );
}
