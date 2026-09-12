import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import type { SupportedLocale } from "@/types/i18n";

export default async function HostIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(ROUTES.HOST_BUSINESSES(locale as SupportedLocale));
}
