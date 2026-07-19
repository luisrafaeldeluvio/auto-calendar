import { Temporal } from "@js-temporal/polyfill";
import type {
  TimeSlot,
  Event,
  Result,
  SlotError,
  TimeSlotDbModel,
} from "../types/types";
import { db } from "./db";
import { toTimeSlotDbModel } from "./serializeDataObject";

// Timeslots
/**
 * Validates a slot against existing slots for range boundaries and duration
 *
 * @param slot - The start and end times of the slot being validated
 * @param ignoreId - (Optional) An ID to ignore during checks
 *
 * @returns An error type or null
 */
const validateSlot = async (
  start: Temporal.PlainTime,
  end: Temporal.PlainTime,
): Promise<Result<null, SlotError>> => {
  if (Temporal.PlainTime.compare(start, end) >= 0)
    return { ok: false, error: "INVALID_RANGE" };

  return { ok: true, data: null };
};

export const addTimeSlot = async (
  slot: Omit<TimeSlot, "id">,
): Promise<Result<string, SlotError | string>> => {
  const checkSlot = await validateSlot(slot.start, slot.end);
  if (!checkSlot.ok) return { ok: false, error: checkSlot.error };
  const newSlot: TimeSlot = { ...slot, id: crypto.randomUUID() };

  try {
    await db.timeslots.add(toTimeSlotDbModel(newSlot));
    return { ok: true, data: newSlot.id };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
};

export const getAllTimeSlots = async (): Promise<
  Result<TimeSlotDbModel[], string>
> => {
  try {
    const timeslots = await db.timeslots.toArray();
    return { ok: true, data: timeslots };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
};

export const addTask = async (
  event: Omit<Event, "id" | "isDone" | "isSorted" | "isSortable">,
): Promise<Result<Event, "INVALID_DATE_RANGE" | string>> => {
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

  try {
    await db.events.add(newTask);
    return { ok: true, data: newTask };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
};
