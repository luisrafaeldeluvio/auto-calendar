import { describe, it, expect } from "vitest";
import { splitOverlappingSlots } from "./resolveSlotTaskConflicts";
import { Temporal } from "@js-temporal/polyfill";
import type { TimeSlot } from "../core/types";

function createSlot(id: string, startHour: number, endHour: number): TimeSlot {
  return {
    id,
    name: `Slot ${id}`,
    start: Temporal.PlainTime.from({ hour: startHour }),
    end: Temporal.PlainTime.from({ hour: endHour }),
  };
}
function toPlain(slot: any) {
  return {
    id: slot.id,
    name: slot.name,
    start:
      typeof slot.start?.toString === "function"
        ? slot.start.toString()
        : slot.start,
    end:
      typeof slot.end?.toString === "function" ? slot.end.toString() : slot.end,
  };
}

describe("splitOverlappingSlots", () => {
  // Precondition: slotA.start < slotB.start for all tests

  it("1. Partial overlap – intervals share a common subrange", () => {
    const slotA = createSlot("A", 0, 5);
    const slotB = createSlot("B", 3, 10);

    const result = splitOverlappingSlots(slotA, slotB);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { overlap, remainder } = result.data;
      expect(toPlain(overlap)).toMatchObject({
        name: "Overlap of A and B",
        start: "03:00:00",
        end: "05:00:00",
      });
      expect(remainder.map(toPlain)).toEqual([
        { id: "A", name: "Slot A", start: "00:00:00", end: "03:00:00" },
        { id: "B", name: "Slot B", start: "05:00:00", end: "10:00:00" },
      ]);
    }
  });

  it("2. Touch at a single point – A ends exactly where B starts", () => {
    const slotA = createSlot("A", 0, 5);
    const slotB = createSlot("B", 5, 10);

    const result = splitOverlappingSlots(slotA, slotB);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : "").toBe("SLOTS_NOT_INTERSECT");
  });

  it("3. No overlap (gap) – A ends before B starts", () => {
    const slotA = createSlot("A", 0, 4);
    const slotB = createSlot("B", 5, 10);

    const result = splitOverlappingSlots(slotA, slotB);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : "").toBe("SLOTS_NOT_INTERSECT");
  });

  it("4. A completely contains B", () => {
    const slotA = createSlot("A", 0, 10);
    const slotB = createSlot("B", 3, 7);

    const result = splitOverlappingSlots(slotA, slotB);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { overlap, remainder } = result.data;
      expect(toPlain(overlap)).toMatchObject({
        name: "Overlap of A and B",
        start: "03:00:00",
        end: "07:00:00",
      });
      expect(remainder.map(toPlain)).toEqual([
        { id: "A", name: "Slot A", start: "00:00:00", end: "03:00:00" },
        { id: "B", name: "Slot B", start: "07:00:00", end: "07:00:00" },
      ]);
    }
  });

  it("5. B completely contains A", () => {
    const slotA = createSlot("A", 3, 7);
    const slotB = createSlot("B", 5, 10);

    const result = splitOverlappingSlots(slotA, slotB);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { overlap, remainder } = result.data;
      expect(toPlain(overlap)).toMatchObject({
        name: "Overlap of A and B",
        start: "05:00:00",
        end: "07:00:00",
      });
      expect(remainder.map(toPlain)).toEqual([
        { id: "A", name: "Slot A", start: "03:00:00", end: "05:00:00" },
        { id: "B", name: "Slot B", start: "07:00:00", end: "10:00:00" },
      ]);
    }
  });

  it("6. Same end point – A and B end at the same value", () => {
    const slotA = createSlot("A", 0, 5);
    const slotB = createSlot("B", 2, 5);

    const result = splitOverlappingSlots(slotA, slotB);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { overlap, remainder } = result.data;
      expect(toPlain(overlap)).toMatchObject({
        name: "Overlap of A and B",
        start: "02:00:00",
        end: "05:00:00",
      });
      expect(remainder.map(toPlain)).toEqual([
        { id: "A", name: "Slot A", start: "00:00:00", end: "02:00:00" },
        { id: "B", name: "Slot B", start: "05:00:00", end: "05:00:00" },
      ]);
    }
  });

  it("7. Degenerate (zero‑length) intervals – both are points with no overlap", () => {
    const slotA = createSlot("A", 1, 1);
    const slotB = createSlot("B", 2, 2);

    const result = splitOverlappingSlots(slotA, slotB);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : "").toBe("SLOTS_NOT_INTERSECT");
  });

  it("8. Degenerate interval touching B start – A is a point before B.start", () => {
    const slotA = createSlot("A", 1, 1);
    const slotB = createSlot("B", 2, 3);

    const result = splitOverlappingSlots(slotA, slotB);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : "").toBe("SLOTS_NOT_INTERSECT");
  });

  it("12. Edge: A.start < B.start but A.end equals B.start – no overlap", () => {
    const slotA = createSlot("A", 0, 5);
    const slotB = createSlot("B", 5, 10);

    const result = splitOverlappingSlots(slotA, slotB);
    expect(result.ok).toBe(false);
  });
});
