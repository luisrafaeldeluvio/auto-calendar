import { Temporal } from "@js-temporal/polyfill";
import type { TimeSlot, Event, Result, SlotError } from "../types/types";
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
  ignoreId?: string,
): Promise<Result<null, SlotError>> => {
  const midnight = Temporal.PlainTime.from("00:00:00");

  const filteredSlots = ignoreId
    ? await db.timeslots.where("id").notEqual(ignoreId).toArray()
    : await db.timeslots.toArray();
  const totalSlotTime = filteredSlots.reduce((t, s) => {
    const start = midnight.until(s.start).total({ unit: "minute" });
    const end = midnight.until(s.end).total({ unit: "minute" });
    return t + (end - start);
  }, 0);

  if (Temporal.PlainTime.compare(start, end) >= 0)
    return { ok: false, error: "INVALID_RANGE" };
  if (
    totalSlotTime +
      (midnight.until(start).total({ unit: "minute" }) -
        midnight.until(start).total({ unit: "minute" })) >
    1440
  )
    return { ok: false, error: "TIME_EXCEEDED" };

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

// okay so i think i need to transform the Temporal stuff into numbers/string when adding them to db
// for faster, though it still does work.

// export const removeSlot = (
//   slots: readonly TimeSlot[],
//   id: string,
// ): Result<MutationData, "NOT_FOUND"> => {
//   const slot = slots.find((s) => id === s.id);
//   if (!slot) return { ok: false, error: "NOT_FOUND" };

//   const newSlots = slots.filter((s) => s.id !== id);

//   return { ok: true, data: { slots: newSlots, slot: slot } };

// export const addTimeSlots = (slots: TimeSlot[]) => db.timeslots.bulkAdd(slots);

// export const getTimeSlot = (id: string) => db.timeslots.get(id);
export const getAllTimeSlot = () => db.timeslots.toArray();

// export const updateTimeSlot = (id: string, changes: Partial<TimeSlot>) =>
//   db.timeslots.update(id, changes);

// export const deleteTimeSlot = (id: string) => db.timeslots.delete(id);

// Events

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

// export const addEvent = (event: Event) => db.events.add(event);
// export const addEvents = (events: Event[]) => db.events.bulkAdd(events);

// export const getEvent = (id: string) => db.events.get(id);
// export const getAllEvents = () => db.events.toArray();

// export const updateEvent = (id: string, changes: Partial<Event>) =>
//   db.events.update(id, changes);

// export const deleteEvent = (id: string) => db.events.delete(id);
