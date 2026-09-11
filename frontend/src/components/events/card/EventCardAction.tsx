import { useTranslations } from "next-intl";
import { DEFAULT_WHATSAPP_PHONE } from "@/constants/config";

interface EventCardActionProps {
  readonly eventTitle: string;
  readonly whatsappPhone?: string;
}

export default function EventCardAction({
  eventTitle,
  whatsappPhone = DEFAULT_WHATSAPP_PHONE,
}: EventCardActionProps) {
  const tEvents = useTranslations("events");

  const message = tEvents("whatsappDefaultText", { eventTitle });
  const waUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="mt-auto pt-3 border-t border-slate-800/80">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-[#25D366]/25 transition-transform duration-100"
      >
        <svg
          className="h-4 w-4 fill-current shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.101-.477-.15-.678.15-.201.3-.778.978-.954 1.179-.176.201-.352.226-.653.076-.301-.15-1.272-.469-2.423-1.496-.897-.8-1.503-1.788-1.68-2.089-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.376-.025-.526-.075-.15-.678-1.633-.929-2.238-.244-.589-.493-.51-.678-.519-.176-.008-.377-.01-.578-.01s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.513s1.079 2.915 1.23 3.116c.15.201 2.123 3.242 5.143 4.547.718.311 1.278.497 1.716.636.722.23 1.378.198 1.898.12.579-.087 1.78-.727 2.031-1.429.251-.702.251-1.304.176-1.429-.075-.125-.276-.201-.577-.351z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.548 4.103 1.511 5.836L.071 23.473l5.807-1.428A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.578-.506-5.064-1.385l-.363-.215-3.447.849.855-3.364-.236-.376A9.957 9.957 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
        </svg>
        <span>{tEvents("bookNow")}</span>
      </a>
    </div>
  );
}
