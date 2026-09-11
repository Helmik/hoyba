import { getTranslations, setRequestLocale } from "next-intl/server";
import AuthCard from "@/features/auth/components/AuthCard";
import SignupForm from "@/features/auth/components/SignupForm";
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
    title: `${t("signupTitle")} | Hoyba`,
    description: t("signupSubtitle"),
  };
}

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  const { email } = (await searchParams) || {};
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100">
      <AuthCard
        title={t("signupTitle")}
        subtitle={t("signupSubtitle")}
        locale={locale as SupportedLocale}
        backLabel={t("backToHome")}
      >
        <SignupForm
          locale={locale as SupportedLocale}
          initialEmail={email}
        />
      </AuthCard>
    </main>
  );
}
