import { Temporal } from "@js-temporal/polyfill";
import type { TimeSlot, TimeSlotDbModel } from "../types/types";

export const toTimeSlotDbModel = (slot: TimeSlot): TimeSlotDbModel => ({
  ...slot,
  start: slot.start.toString(),
  end: slot.end.toString(),
});

export const fromTimeSlotDbModel = (slot: TimeSlotDbModel): TimeSlot => ({
  ...slot,
  start: Temporal.PlainTime.from(slot.start) ,
  end: Temporal.PlainTime.from(slot.end)
});