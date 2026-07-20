import { Temporal } from "@js-temporal/polyfill";
import type {
  Event,
  EventDbModel,
  TimeSlot,
  TimeSlotDbModel,
} from "../types/types";

export const toTimeSlotDbModel = (slot: TimeSlot): TimeSlotDbModel => ({
  ...slot,
  start: slot.start.toString(),
  end: slot.end.toString(),
});

export const fromTimeSlotDbModel = (slot: TimeSlotDbModel): TimeSlot => ({
  ...slot,
  start: Temporal.PlainTime.from(slot.start),
  end: Temporal.PlainTime.from(slot.end),
});

export const toEventDbModel = (
  event: Event<Temporal.PlainDateTime | null>,
): EventDbModel => ({
  ...event,
  start: event.start?.toString() ?? null,
  end: event.end?.toString() ?? null,
  duration: event.duration?.toString(),
  bufferBefore: event.bufferBefore?.toString(),
  bufferAfter: event.bufferAfter?.toString(),
  startDate: event.startDate?.toString() ?? null,
  dueDate: event.dueDate?.toString() ?? null,
});

export const fromEventDbModel = (
  event: EventDbModel,
): Event<Temporal.PlainDateTime | null> => ({
  ...event,
  start: event.start ? Temporal.PlainDateTime.from(event.start) : null,
  end: event.end ? Temporal.PlainDateTime.from(event.end) : null,
  duration: Temporal.Duration.from(event.duration),
  bufferBefore: Temporal.Duration.from(event.bufferBefore),
  bufferAfter: Temporal.Duration.from(event.bufferAfter),
  startDate: event.startDate
    ? Temporal.PlainDateTime.from(event.startDate)
    : null,
  dueDate: event.dueDate ? Temporal.PlainDateTime.from(event.dueDate) : null,
});
