import { getTranslations, setRequestLocale } from "next-intl/server";
import AuthCard from "@/features/auth/components/AuthCard";
import RecoverPasswordForm from "@/features/auth/components/RecoverPasswordForm";
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
    description: t("resetPasswordSubtitle"),
  };
}

export default async function RecuperarContrasenaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = (await searchParams) || {};
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100">
      <AuthCard
        title={locale === "es" ? "Recuperar Contraseña" : t("resetPasswordTitle")}
        subtitle={
          locale === "es"
            ? "Crea una nueva contraseña segura para acceder a tu cuenta"
            : t("resetPasswordSubtitle")
        }
        locale={locale as SupportedLocale}
        backLabel={t("backToHome")}
      >
        <RecoverPasswordForm
          locale={locale as SupportedLocale}
          errorCode={error}
        />
      </AuthCard>
    </main>
  );
}
