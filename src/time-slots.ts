import { TOTAL_TIME } from "./constants";
import type { Result, TimeSlot, SlotError } from "./types";

interface MutationData {
  slots: TimeSlot[];
  slot: TimeSlot;
}

export const getSlot = (
  slots: readonly TimeSlot[],
  id: string,
): TimeSlot | undefined => {
  return slots.find((s) => s.id === id);
};

export const addSlot = (
  slots: readonly TimeSlot[],
  slot: Readonly<Omit<TimeSlot, "id">>,
): Result<MutationData, SlotError> => {
  const error = validateSlot([...slots], { ...slot });
  if (error) return { ok: false, error: error };

  const newSlot = { ...slot, id: crypto.randomUUID() };
  const newSlots = [...slots, newSlot];

  return { ok: true, data: { slots: newSlots, slot: newSlot } };
};

export const removeSlot = (
  slots: readonly TimeSlot[],
  id: string,
): Result<MutationData, "NOT_FOUND"> => {
  const slot = slots.find((s) => id === s.id);
  if (!slot) return { ok: false, error: "NOT_FOUND" };

  const newSlots = slots.filter((s) => s.id !== id);

  return { ok: true, data: { slots: newSlots, slot: slot } };
};

export const updateSlot = (
  slots: readonly TimeSlot[],
  id: string,
  updates: Readonly<Partial<Omit<TimeSlot, "id">>>,
): Result<MutationData, "NOT_FOUND" | SlotError> => {
  const existingSlot = slots.find((slot) => id === slot.id);
  if (!existingSlot) return { ok: false, error: "NOT_FOUND" };

  const start = updates.start ?? existingSlot.start;
  const end = updates.end ?? existingSlot.end;

  const error = validateSlot(
    [...slots],
    { start: start, end: end },
    existingSlot.id,
  );
  if (error) return { ok: false, error: error };

  const updatedSlot = { ...existingSlot, ...updates };
  const newSlots = slots.map((slot) => (slot.id === id ? updatedSlot : slot));

  return { ok: true, data: { slots: newSlots, slot: updatedSlot } };
};

/**
 * Validates a slot against existing slots for overlaps, range boundaries, and duration
 *
 * @param slots - The collection of slots to check against
 * @param slot - The start and end times of the slot being validated
 * @param ignoreId - (Optional) An ID to ignore during checks
 *
 * @returns An error type or null
 */
const validateSlot = (
  slots: readonly TimeSlot[],
  slot: Readonly<Omit<TimeSlot, "id" | "name">>,
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
