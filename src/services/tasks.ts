import type { Event, Result } from "../core/types";
import { Temporal } from "@js-temporal/polyfill";
import { insertEvent } from "../db/db";

export const createTask = (
  event: Omit<Event, "id" | "isDone" | "isSorted" | "isSortable">,
): Result<Event, "INVALID_DATE_RANGE"> => {
  if (
    event.startDate &&
    event.dueDate &&
    Temporal.PlainDateTime.compare(event.startDate, event.dueDate) === 1
  )
    return { ok: false, error: "INVALID_DATE_RANGE" };

  const newTask: Event = {
    ...event,
    id: crypto.randomUUID(),
    isDone: false,
    isSorted: false,
    isSortable: true,
  };

  insertEvent(newTask);
  return { ok: true, data: newTask };
};
