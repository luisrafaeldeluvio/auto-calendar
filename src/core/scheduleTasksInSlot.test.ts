import { describe, expect, it } from "bun:test";
import { scheduleTasksInSlot } from "./scheduleTasksInSlot";
import type { Event } from "../types/types";
import { Temporal } from "@js-temporal/polyfill";

export const taskFactory = (
  partial: Partial<Event<Temporal.PlainDateTime | null>> = {},
) => {
  return {
    type: "task",
    id: crypto.randomUUID(),
    name: "",
    notes: "",
    start: null,
    end: null,
    isBusy: true,
    isDone: false,
    isSortable: true,
    isSorted: false,
    duration: null,
    weight: 1,
    slotId: "",
    buffer: { before: null, after: null },
    startDate: null,
    dueDate: null,
    ...partial,
  };
};

describe("Assign task time", () => {
  it("should assign tasks to available time slots without conflicts", () => {
    const queuedTasks: Event<null>[] = [
      taskFactory({
        id: "1",
        duration: Temporal.Duration.from({ minutes: 60 }),
        weight: 1,
        slotId: "1",
      }) as Event<null>,
      taskFactory({
        id: "2",
        duration: Temporal.Duration.from({ minutes: 60 }),
        weight: 1,
        slotId: "1",
      }) as Event<null>,
      taskFactory({
        id: "3",
        duration: Temporal.Duration.from({ hours: 2 }),
        weight: 1,
        slotId: "1",
      }) as Event<null>,
    ];
    const result = scheduleTasksInSlot(
      queuedTasks,
      [],
      Temporal.PlainTime.from({ hour: 0, minute: 0 }),
      Temporal.PlainTime.from({ hour: 4, minute: 0 }),
      Temporal.Now.plainDateISO(),
    );

    expect(result.sortedTasks).toHaveLength(3);
    expect(result.queue).toHaveLength(0);
    expect(result.sortedTasks[0]).toMatchObject({
      start: Temporal.PlainDateTime.from(Temporal.Now.plainDateISO().toPlainDateTime({hour: 2})),
      end: Temporal.PlainDateTime.from(Temporal.Now.plainDateISO().toPlainDateTime({hour: 2})),
    });
    expect(result.sortedTasks[1]).toMatchObject({
      start: Temporal.PlainDateTime.from(Temporal.Now.plainDateISO().toPlainDateTime({hour: 2})),
      end: Temporal.PlainDateTime.from(Temporal.Now.plainDateISO().toPlainDateTime({hour: 2})),
    });
    expect(result.sortedTasks[2]).toMatchObject({
      start: Temporal.PlainDateTime.from(Temporal.Now.plainDateISO().toPlainDateTime({hour: 2})),
      end: Temporal.PlainDateTime.from(Temporal.Now.plainDateISO().toPlainDateTime({hour: 2})),
    });
  });

  it("should skip busy events and assign tasks to another available time", () => {
    const busyEvents: Event<Temporal.PlainDateTime>[] = [
      taskFactory({
        id: "3",
        name: "Task3",
        start: Temporal.Now.plainDateTimeISO().add({ hours: 1, minutes: 0 }), // 60 mins
        end: Temporal.Now.plainDateTimeISO().add({ hours: 2, minutes: 0 }), // 120 mins
        isBusy: true,
        duration: Temporal.Duration.from({ minutes: 60 }),
        slotId: "1",
      }) as Event<Temporal.PlainDateTime>,
    ];
    const queuedTasks: Event<null>[] = [
      taskFactory({
        id: "1",
        duration: Temporal.Duration.from({ minutes: 60 }),
        slotId: "1",
      }) as Event<null>,
      taskFactory({
        id: "2",
        duration: Temporal.Duration.from({ minutes: 60 }),
        slotId: "1",
      }) as Event<null>,
    ];

    const result = scheduleTasksInSlot(
      queuedTasks,
      busyEvents,
      Temporal.PlainTime.from({ hour: 0, minute: 0 }),
      Temporal.PlainTime.from({ hour: 3, minute: 0 }), // 180 mins
      Temporal.Now.plainDateISO(),
    );

    expect(result.sortedTasks).toHaveLength(2);
    expect(result.sortedTasks[1]).toMatchObject({
      start: Temporal.PlainDateTime.from(Temporal.Now.plainDateISO().toPlainDateTime({hour: 2})), // 120 mins
      end: Temporal.PlainDateTime.from(Temporal.Now.plainDateISO().toPlainDateTime({hour: 3})), // 180 mins
    });
  });

  it("should return remaining tasks when slot is full", () => {
    const queuedTasks: Event<null>[] = [
      taskFactory({
        id: "1",
        duration: Temporal.Duration.from({ minutes: 60 }),
        slotId: "1",
      }) as Event<null>,
      taskFactory({
        id: "2",
        duration: Temporal.Duration.from({ minutes: 60 }),
        slotId: "1",
      }) as Event<null>,
      taskFactory({
        id: "3",
        duration: Temporal.Duration.from({ minutes: 60 }),
        slotId: "1",
      }) as Event<null>,
    ];

    const result = scheduleTasksInSlot(
      queuedTasks,
      [],
      Temporal.PlainTime.from({ hour: 0, minute: 0 }),
      Temporal.PlainTime.from({ hour: 2, minute: 0 }), // 120 mins
      Temporal.Now.plainDateISO(),
    );

    expect(result.sortedTasks).toHaveLength(2);
    expect(result.queue).toHaveLength(1);
    expect(result.queue[0]).toMatchObject({ id: "3" });
  });

  it("should handle empty task queue", () => {
    const result = scheduleTasksInSlot(
      [],
      [],
      Temporal.PlainTime.from({ hour: 0, minute: 0 }),
      Temporal.PlainTime.from({ hour: 1, minute: 40 }), // 100 mins
      Temporal.Now.plainDateISO(),
    );

    expect(result.sortedTasks).toHaveLength(0);
    expect(result.queue).toHaveLength(0);
  });
});
