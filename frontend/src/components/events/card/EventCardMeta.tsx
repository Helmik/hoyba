import { Clock, MapPin } from "lucide-react";
import type { SupportedLocale } from "@/types/i18n";
import { formatEventTime } from "@/lib/date";

interface EventCardMetaProps {
  readonly startDate: string;
  readonly locationName: string;
  readonly locale: SupportedLocale;
}

export default function EventCardMeta({
  startDate,
  locationName,
  locale,
}: EventCardMetaProps) {
  const timeString = formatEventTime(startDate, locale);

  return (
    <div className="mb-2 flex items-center justify-between text-xs font-medium">
      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span suppressHydrationWarning>{timeString}</span>
      </div>
      <div className="flex items-center gap-1 max-w-[55%] truncate text-slate-400">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <span className="truncate">{locationName}</span>
      </div>
    </div>
  );
}
