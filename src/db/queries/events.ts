import { Temporal } from "@js-temporal/polyfill";
import type { Result } from "../../types/common";
import type { Event } from "../../types/models/calendarItem";
import { db } from "../db";
import { toEventDbModel } from "../modelMappers";

export const addEvent = async (
  event: Omit<Event<Temporal.PlainDateTime | null>, "id">,
): Promise<Result<string, "INVALID_DATE_RANGE" | string>> => {
  if (
    event.startDate &&
    event.dueDate &&
    Temporal.PlainDateTime.compare(event.startDate, event.dueDate) === 1
  )
    return { ok: false, error: "INVALID_DATE_RANGE" };

  const newTask: Event<Temporal.PlainDateTime | null> = {
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
