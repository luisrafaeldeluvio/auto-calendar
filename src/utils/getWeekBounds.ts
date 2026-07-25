import { Temporal } from "@js-temporal/polyfill";

export function getWeekBounds(anchorDate = Temporal.Now.plainDateISO()) {
  const baseDate = anchorDate.toPlainDateTime({ hour: 0, minute: 0 });

  const start = baseDate.subtract({ days: baseDate.dayOfWeek - 1 });
  const end = baseDate.add({
    days: 7 - baseDate.dayOfWeek,
    hours: 23,
    minutes: 59,
  });

  return { start, end, baseDate };
}
