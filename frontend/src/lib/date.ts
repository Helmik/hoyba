import { DEFAULT_LANGUAGE, DEFAULT_TIMEZONE } from "@/constants/config";

/**
 * Formats an event ISO start time into destination local time (America/Cancun, UTC-5),
 * using the format of the currently selected language in the header dropdown.
 * Normalizes Unicode non-breaking spaces (\u202F, \u00A0) to standard ASCII spaces
 * to guarantee identical string matching between SSR and client hydration.
 */
export function formatEventTime(
  isoString: string,
  locale: string = DEFAULT_LANGUAGE
): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const dtf = new Intl.DateTimeFormat(locale, {
      timeZone: DEFAULT_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
    });

    const formatted = dtf.format(date);
    return formatted.replace(/[\s\u00A0\u202F]+/g, " ");
  } catch {
    return "";
  }
}

/**
 * Formats a Date object in destination timezone, normalizing non-breaking spaces.
 */
export function formatContextualDate(
  date: Date,
  locale: string,
  todayLabel: string
): string {
  try {
    const dtfWeekday = new Intl.DateTimeFormat(locale, {
      timeZone: DEFAULT_TIMEZONE,
      weekday: "short",
    });
    const dtfDay = new Intl.DateTimeFormat(locale, {
      timeZone: DEFAULT_TIMEZONE,
      day: "numeric",
    });
    const dtfMonth = new Intl.DateTimeFormat(locale, {
      timeZone: DEFAULT_TIMEZONE,
      month: "short",
    });

    const rawWeekday = dtfWeekday.format(date).replace(/\./g, "");
    const capitalizedWeekday =
      rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1);
    const dayNum = dtfDay.format(date);
    const rawMonth = dtfMonth.format(date).replace(/\./g, "");

    const full = `${todayLabel} • ${capitalizedWeekday}, ${dayNum} ${rawMonth}`;
    return full.replace(/[\s\u00A0\u202F]+/g, " ");
  } catch {
    return todayLabel;
  }
}
