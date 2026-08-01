import { Temporal } from "@js-temporal/polyfill";
import type { Result } from "../../types/common";
import type {
  CalendarEvent,
  CalendarTask,
  CalendarTaskUnscheduled,
} from "../../types/models/calendarItem";
import { db } from "../db";
import { toEventDbModel } from "../modelMappers";

type CalendarItemWithoutId =
  | Omit<CalendarEvent, "id">
  | Omit<CalendarTask, "id">
  | Omit<CalendarTaskUnscheduled, "id">;

export const addEvent = async (
  event: CalendarItemWithoutId,
): Promise<Result<string, "INVALID_DATE_RANGE" | string>> => {
  if (
    event.startDate &&
    event.dueDate &&
    Temporal.PlainDateTime.compare(event.startDate, event.dueDate) === 1
  )
    return { ok: false, error: "INVALID_DATE_RANGE" };

  const newTask = {
    ...event,
    id: crypto.randomUUID(),
  };

  try {
    await db.events.add(toEventDbModel(newTask));
    return { ok: true, data: newTask.id };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
};
