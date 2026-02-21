import { TOTAL_TIME } from "./constants.ts";
import type { Result, TimeSlot, SlotError } from "./types.ts";

type MutationData = { slots: TimeSlot[]; slot: TimeSlot };

export const getSlot = (
  slots: TimeSlot[],
  id: string,
): TimeSlot | undefined => {
  return slots.find((s) => s.id === id);
};

export const addSlot = (
  slots: TimeSlot[],
  slot: Omit<TimeSlot, "id"> & Partial<Pick<TimeSlot, "id">>,
): Result<MutationData, SlotError> => {
  const error = validateSlot(slots, { ...slot });
  if (error) return { ok: false, error: error };

  const newSlot = { ...slot, id: crypto.randomUUID() };
  const newSlots = [...slots, newSlot];

  return { ok: true, data: { slots: newSlots, slot: newSlot } };
};

export const removeSlot = (
  slots: TimeSlot[],
  id: string,
): Result<MutationData, "NOT_FOUND"> => {
  const slot = slots.find((s) => id === s.id);
  if (!slot) return { ok: false, error: "NOT_FOUND" };

  const newSlots = slots.filter((s) => s.id !== id);

  return { ok: true, data: { slots: newSlots, slot: slot } };
};

export const updateSlot = (
  slots: TimeSlot[],
  id: string,
  updates: Partial<Omit<TimeSlot, "id">>,
): Result<MutationData, "NOT_FOUND" | SlotError> => {
  let existingSlot = slots.find((slot) => id === slot.id);
  if (!existingSlot) return { ok: false, error: "NOT_FOUND" };

  const start = updates.start ?? existingSlot.start;
  const end = updates.end ?? existingSlot.end;

  const error = validateSlot(
    slots,
    { start: start, end: end },
    existingSlot.id,
  );
  if (error) return { ok: false, error: error };

  const updatedSlot = { ...existingSlot, ...updates };
  const newSlots = slots.map((slot) => (slot.id === id ? updatedSlot : slot));

  return { ok: true, data: { slots: newSlots, slot: updatedSlot } };
};

const validateSlot = (
  slots: TimeSlot[],
  slot: Omit<TimeSlot, "id" | "name">,
  ignoreId?: string,
): SlotError | null => {
  const filteredSlots = slots.filter((s) => s.id !== ignoreId);
  const isOverlapping = filteredSlots.some(
    (s) => s.end > slot.start && slot.end > s.start,
  );
  const totalSlotTime = filteredSlots.reduce(
    (t, s) => t + (s.end - s.start),
    0,
  );

  if (slot.start >= slot.end) return "INVALID_RANGE";
  if (isOverlapping) return "OVERLAP";
  if (totalSlotTime + (slot.end - slot.start) > TOTAL_TIME)
    return "TIME_EXCEEDED";

  return null;
};

const slots: TimeSlot[] = [];

// addSlot("morning", 300, 540);
// addSlot("evening", 550, 1100);
// console.log("before:", timeSlot.slots);
// console.log(
//   "after:",
//   timeSlot.update(timeSlot.slots[0].id, {
//     name: "noon",
//     start: 540,
//     end: 551,
//   }),
// );

// console.log(addSlot("morning", 300, 540));
// console.log(timeSlot.remove(timeSlot.slots[0].id));
// console.log(timeSlot.slots);

// const val = addSlot("morning", 540, 144000);
// if (!val.ok) {
//   console.log(val.error);
// }

// console.log(addSlot(slots, "morning", 600, 540));
// console.log(addSlot(slots, "morning", 300, 500));
// console.log(addSlot(slots, "morning", 540, 144000));
// console.log(slots);

const newSlot = addSlot(slots, { name: "morning", start: 540, end: 600 });
const updatedSlots = newSlot.ok ? newSlot.data.slots : slots;
console.log("initial:", slots);
console.log("add:", newSlot);
console.log("new", updatedSlots);
