"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import type { HostEvent } from "@/types/host";
import { toggleEventStatus, deleteEvent } from "@/app/actions/host";
import { captureAppError } from "@/lib/error";
import HostEventCardActions from "./HostEventCardActions";

interface HostEventCardProps {
  readonly event: HostEvent;
  readonly onStatusToggled?: (eventId: string, newStatus: boolean) => void;
  readonly onDeleted?: (eventId: string) => void;
}

export default function HostEventCard({
  event,
  onStatusToggled,
  onDeleted,
}: HostEventCardProps) {
  const format = useFormatter();
  const tHost = useTranslations("host");
  const [isActive, setIsActive] = useState(event.is_active);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      setErrorMsg(null);
      const nextStatus = !isActive;
      const res = await toggleEventStatus(event.id, nextStatus);
      if (!res.success) {
        setErrorMsg(res.error || tHost("toggleStatusError"));
        return;
      }
      setIsActive(nextStatus);
      onStatusToggled?.(event.id, nextStatus);
    } catch (err) {
      captureAppError(err, { section: "host-event-toggle" });
      setErrorMsg(tHost("connectionError"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(tHost("deleteConfirm"))) return;
    try {
      setIsUpdating(true);
      const res = await deleteEvent(event.id);
      if (!res.success) {
        setErrorMsg(res.error || tHost("deleteError"));
        return;
      }
      onDeleted?.(event.id);
    } catch (err) {
      captureAppError(err, { section: "host-event-delete" });
      setErrorMsg(tHost("deleteError"));
    } finally {
      setIsUpdating(false);
    }
  };

  const title = event.title?.["es"] || event.title?.["en"] || "Publicación";
  const formattedDate = event.start_time
    ? format.dateTime(new Date(event.start_time), {
        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      })
    : "";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm transition-all hover:border-slate-700">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <img src={event.cover_image_url} alt={title} className="h-full w-full object-cover" />
          <span className="absolute bottom-1 right-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
            {event.category}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${isActive ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-slate-600"}`} />
            <span className="text-[11px] font-semibold text-slate-400">
              {isActive ? tHost("activeLive") : tHost("paused")}
            </span>
          </div>
          <h3 className="truncate text-base font-bold text-white">{title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-400" />
                <span>{formattedDate}</span>
              </span>
            )}
            {event.location_name && (
              <span className="flex items-center gap-1 truncate max-w-[180px]">
                <MapPin className="h-3 w-3 text-slate-500" />
                <span className="truncate">{event.location_name}</span>
              </span>
            )}
            {event.price_range && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-emerald-400" />
                <span>{event.price_range}</span>
              </span>
            )}
          </div>
          {errorMsg && <p className="mt-1 text-xs text-rose-400">{errorMsg}</p>}
        </div>
      </div>

      <HostEventCardActions isActive={isActive} isUpdating={isUpdating} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
}
