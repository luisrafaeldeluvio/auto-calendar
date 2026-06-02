import { describe, it, expect } from "vitest";
import { calculateTimeslotOverlap } from "./testday";
import type { Task, TimeSlot } from "../core/types";

function createSlot(id: string, start: number, end: number): TimeSlot {
  return { id, name: `Slot ${id}`, start, end };
}

describe("calculateTimeslotOverlap", () => {
  // Precondition: slotA.start < slotB.start for all tests

  it("1. Partial overlap – intervals share a common subrange", () => {
    const slotA = createSlot("A", 0, 5);
    const slotB = createSlot("B", 3, 10);

    const result = calculateTimeslotOverlap(slotA, slotB);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { overlap, remainder } = result.data;
      expect(overlap).toMatchObject({
        name: "Overlap of A and B",
        start: 3,
        end: 5,
      });
      expect(remainder).toEqual([
        { ...slotA, end: 3 },
        { ...slotB, start: 5 },
      ]);
    }
  });

  it("2. Touch at a single point – A ends exactly where B starts", () => {
    const slotA = createSlot("A", 0, 5);
    const slotB = createSlot("B", 5, 10);

    const result = calculateTimeslotOverlap(slotA, slotB);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : "").toBe("SLOTS_NOT_INTERSECT");
  });

  it("3. No overlap (gap) – A ends before B starts", () => {
    const slotA = createSlot("A", 0, 4);
    const slotB = createSlot("B", 5, 10);

    const result = calculateTimeslotOverlap(slotA, slotB);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : "").toBe("SLOTS_NOT_INTERSECT");
  });

  it("4. A completely contains B", () => {
    const slotA = createSlot("A", 0, 10);
    const slotB = createSlot("B", 3, 7);

    const result = calculateTimeslotOverlap(slotA, slotB);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { overlap, remainder } = result.data;
      expect(overlap).toMatchObject({
        name: "Overlap of A and B",
        start: 3,
        end: 7,
      });
      expect(remainder).toEqual([
        { ...slotA, end: 3 },
        { ...slotB, start: 7 },
      ]);
    }
  });

  it("5. B completely contains A", () => {
    const slotA = createSlot("A", 3, 7);
    const slotB = createSlot("B", 5, 10);

    const result = calculateTimeslotOverlap(slotA, slotB);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { overlap, remainder } = result.data;
      // Overlap is from B.start to A.end because A ends earlier
      expect(overlap).toMatchObject({
        name: "Overlap of A and B",
        start: 5,
        end: 7,
      });
      expect(remainder).toEqual([
        { ...slotA, end: 5 }, // first part of A before overlap
        { ...slotB, start: 7 }, // second part of B after overlap
      ]);
    }
  });

  it("6. Same end point – A and B end at the same value", () => {
    const slotA = createSlot("A", 0, 5);
    const slotB = createSlot("B", 2, 5);

    const result = calculateTimeslotOverlap(slotA, slotB);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { overlap, remainder } = result.data;
      expect(overlap).toMatchObject({
        name: "Overlap of A and B",
        start: 2,
        end: 5,
      });
      expect(remainder).toEqual([
        { ...slotA, end: 2 },
        { ...slotB, start: 5 }, // slotB.start becomes 5, which equals slotB.end → zero-length slot
      ]);
    }
  });

  it("7. Degenerate (zero‑length) intervals – both are points with no overlap", () => {
    const slotA = createSlot("A", 1, 1);
    const slotB = createSlot("B", 2, 2);

    const result = calculateTimeslotOverlap(slotA, slotB);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : "").toBe("SLOTS_NOT_INTERSECT");
  });

  it("8. Degenerate interval touching B start – A is a point before B.start", () => {
    const slotA = createSlot("A", 1, 1);
    const slotB = createSlot("B", 2, 3);

    const result = calculateTimeslotOverlap(slotA, slotB);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : "").toBe("SLOTS_NOT_INTERSECT");
  });

  it("12. Edge: A.start < B.start but A.end equals B.start – no overlap", () => {
    const slotA = createSlot("A", 0, 5);
    const slotB = createSlot("B", 5, 10);

    const result = calculateTimeslotOverlap(slotA, slotB);
    expect(result.ok).toBe(false);
  });
});
