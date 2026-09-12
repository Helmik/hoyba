import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import type { SupportedLocale } from "@/types/i18n";
import HostHeader from "@/components/host/HostHeader";

interface HostLayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
}

export default async function HostLayout({ children, params }: HostLayoutProps) {
  const { locale } = await params;
  const typedLocale = locale as SupportedLocale;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `${ROUTES.LOGIN(typedLocale)}?next=${encodeURIComponent(
        ROUTES.HOST_BUSINESSES(typedLocale)
      )}`
    );
  }

  const { count } = await (supabase as any)
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const hasBusinesses = (count ?? 0) > 0;

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-[#0a0e1a] text-slate-100">
      <HostHeader locale={typedLocale} userEmail={user.email} hasBusinesses={hasBusinesses} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 md:px-8 lg:px-12 sm:py-8">
        {children}
      </main>
    </div>
  );
}
