import type { Result, TimeSlot, SlotError } from "../core/types";
import { db, getSlot, insertSlot } from "../db/db";

// export const getSlot = (
//   slots: readonly TimeSlot[],
//   id: string,
// ): TimeSlot | undefined => {
//   return slots.find((s) => s.id === id);
// };

export const addSlot = (
  slot: Readonly<Omit<TimeSlot, "id">>,
): Result<string, SlotError> => {
  const checkSlot = validateSlot(slot);
  if (!checkSlot.ok) return { ok: false, error: checkSlot.error };

  const newSlot: TimeSlot = { ...slot, id: crypto.randomUUID() };
  return { ok: true, data: insertSlot(newSlot) };
};

// export const removeSlot = (
//   slots: readonly TimeSlot[],
//   id: string,
// ): Result<MutationData, "NOT_FOUND"> => {
//   const slot = slots.find((s) => id === s.id);
//   if (!slot) return { ok: false, error: "NOT_FOUND" };

//   const newSlots = slots.filter((s) => s.id !== id);

//   return { ok: true, data: { slots: newSlots, slot: slot } };
// };

// export const updateSlot = (
//   slots: readonly TimeSlot[],
//   id: string,
//   updates: Readonly<Partial<Omit<TimeSlot, "id">>>,
// ): Result<MutationData, "NOT_FOUND" | SlotError> => {
//   const existingSlot = slots.find((slot) => id === slot.id);
//   if (!existingSlot) return { ok: false, error: "NOT_FOUND" };

//   const start = updates.start ?? existingSlot.start;
//   const end = updates.end ?? existingSlot.end;

//   const error = validateSlot(
//     [...slots],
//     { start: start, end: end },
//     existingSlot.id,
//   );
//   if (error) return { ok: false, error: error };

//   const updatedSlot = { ...existingSlot, ...updates };
//   const newSlots = slots.map((slot) => (slot.id === id ? updatedSlot : slot));

//   return { ok: true, data: { slots: newSlots, slot: updatedSlot } };
// };

/**
 * Validates a slot against existing slots for range boundaries and duration
 *
 * @param slot - The start and end times of the slot being validated
 * @param ignoreId - (Optional) An ID to ignore during checks
 *
 * @returns An error type or null
 */
const validateSlot = (
  slot: Readonly<Omit<TimeSlot, "id" | "name">>,
  ignoreId?: string,
): Result<null, SlotError> => {
  const midnight = Temporal.PlainTime.from("00:00:00");
  const filteredSlots = getSlot({ filter: `id NOT ${ignoreId}` });
  const totalSlotTime = filteredSlots.reduce((t, s) => {
    const start = midnight.until(s.start).total({ unit: "minute" });
    const end = midnight.until(s.start).total({ unit: "minute" });
    return t + (end - start);
  }, 0);

  if (slot.start >= slot.end) return { ok: false, error: "INVALID_RANGE" };
  if (
    totalSlotTime +
      (midnight.until(slot.start).total({ unit: "minute" }) -
        midnight.until(slot.start).total({ unit: "minute" })) >
    1440
  )
    return { ok: false, error: "TIME_EXCEEDED" };

  return { ok: true, data: null };
};
