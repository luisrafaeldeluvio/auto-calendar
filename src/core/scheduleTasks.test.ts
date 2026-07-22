import { describe, it, expect } from "bun:test";
import { Temporal } from "@js-temporal/polyfill";
import type { Event, TimeSlot } from "../types/types";
import { scheduleTasks } from "./scheduleTasks";

const eventFactory = (
  event: Partial<Omit<Event<null>, "type">> & Pick<Event<null>, "type">,
): Event<null> => {
  return {
    id: "",
    name: "",
    notes: "",
    start: null,
    end: null,
    isBusy: false,
    isDone: false,
    isSortable: false,
    isSorted: false,
    duration: Temporal.Duration.from({ minutes: 0 }),
    weight: 1,
    slotId: "",
    bufferBefore: Temporal.Duration.from({ minutes: 0 }),
    bufferAfter: Temporal.Duration.from({ minutes: 0 }),
    startDate: null,
    dueDate: null,
    ...event,
  };
};
describe("splitOverlappingSlots", () => {
  it("1. Works", () => {
    const mockSlots: TimeSlot[] = [
      {
        id: "1",
        name: "",
        start: Temporal.PlainTime.from({ hour: 0 }),
        end: Temporal.PlainTime.from({ hour: 1 }),
      },
      {
        id: "2",
        name: "",
        start: Temporal.PlainTime.from({ hour: 1 }),
        end: Temporal.PlainTime.from({ hour: 2 }),
      },
    ];

    const mockTasks: Event<null>[] = [
      eventFactory({
        type: "task",
        id: "1",
        slotId: "1",
        weight: 1,
        duration: Temporal.Duration.from({ minutes: 60 }),
      }),
      eventFactory({
        type: "task",
        id: "2",
        slotId: "2",
        weight: 1,
        duration: Temporal.Duration.from({ minutes: 60 }),
      }),
    ];

    const result = scheduleTasks(
      mockTasks,
      [],
      mockSlots,
      Temporal.Now.plainDateISO(),
    );

    expect(result).toMatchObject([
      {
        sortedTasks: [
          {
            id: "1",
            start: Temporal.PlainTime.from("00:00:00"),
            end: Temporal.PlainTime.from("01:00:00"),
          },
        ],
        queue: [],
      },
      {
        sortedTasks: [
          {
            id: "2",
            start: Temporal.PlainTime.from("01:00:00"),
            end: Temporal.PlainTime.from("02:00:00"),
          },
        ],
        queue: [],
      },
    ]);
  });
  it("2. Overlap from next slot", () => {
    const mockSlots: TimeSlot[] = [
      {
        id: "1",
        name: "",
        start: Temporal.PlainTime.from({ hour: 0 }),
        end: Temporal.PlainTime.from({ hour: 1 }),
      },
      {
        id: "2",
        name: "",
        start: Temporal.PlainTime.from({ minute: 30 }),
        end: Temporal.PlainTime.from({ hour: 1, minute: 30 }),
      },
    ];

    const mockTasks: Event<null>[] = [
      eventFactory({
        type: "task",
        id: "1",
        slotId: "1",
        weight: 1,
        duration: Temporal.Duration.from({ minutes: 60 }),
      }),
      eventFactory({
        type: "task",
        id: "2",
        slotId: "2",
        weight: 1,
        duration: Temporal.Duration.from({ minutes: 60 }),
      }),
    ];

    const result = scheduleTasks(
      mockTasks,
      [],
      mockSlots,
      Temporal.Now.plainDateISO(),
    );

    expect(result).toMatchObject([
      {
        sortedTasks: [
          {
            id: "1",
            start: Temporal.PlainTime.from("00:00:00"),
            end: Temporal.PlainTime.from("01:00:00"),
          },
        ],
        queue: [],
      },
      {
        sortedTasks: [],
        queue: [
          {
            id: "2",
            start: null,
            end: null,
          },
        ],
      },
    ]);
  });
  it("3. Overlap from previous and next slot", () => {
    const mockSlots: TimeSlot[] = [
      {
        id: "1",
        name: "",
        start: Temporal.PlainTime.from({ hour: 0 }),
        end: Temporal.PlainTime.from({ hour: 2 }),
      },
      {
        id: "2",
        name: "",
        start: Temporal.PlainTime.from({ hour: 1 }),
        end: Temporal.PlainTime.from({ hour: 3 }),
      },
      {
        id: "3",
        name: "",
        start: Temporal.PlainTime.from({ hour: 2 }),
        end: Temporal.PlainTime.from({ hour: 4 }),
      },
    ];

    const mockTasks: Event<null>[] = [
      eventFactory({
        type: "task",
        id: "1",
        slotId: "1",
        weight: 2,
        duration: Temporal.Duration.from({ hours: 2 }),
      }),
      eventFactory({
        type: "task",
        id: "2",
        slotId: "2",
        weight: 1,
        duration: Temporal.Duration.from({ hours: 2 }),
      }),
      eventFactory({
        type: "task",
        id: "3",
        slotId: "3",
        weight: 1,
        duration: Temporal.Duration.from({ hours: 2 }),
      }),
    ];

    const result = scheduleTasks(
      mockTasks,
      [],
      mockSlots,
      Temporal.Now.plainDateISO(),
    );

    expect(result).toMatchObject([
      {
        sortedTasks: [
          {
            id: "1",
            start: Temporal.PlainTime.from("00:00:00"),
            end: Temporal.PlainTime.from("02:00:00"),
          },
        ],
        queue: [],
      },
      {
        sortedTasks: [],
        queue: [
          {
            id: "2",
            start: null,
            end: null,
          },
        ],
      },
      {
        sortedTasks: [
          {
            id: "3",
            start: Temporal.PlainTime.from("02:00:00"),
            end: Temporal.PlainTime.from("04:00:00"),
          },
        ],
        queue: [],
      },
    ]);
  });
});
