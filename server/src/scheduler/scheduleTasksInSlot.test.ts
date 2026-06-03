import { describe, expect, it } from "vitest";
import { scheduleTasksInSlot } from "./scheduleTasksInSlot";
import type { Task, Event } from "../core/types";

export const taskFactory = (partial: Partial<Task> = {}): Task => {
  return {
    id: crypto.randomUUID(),
    name: "",
    notes: "",
    start: 0,
    end: 0,
    isBusy: true,
    isDone: false,
    isSortable: true,
    duration: 0,
    weight: 1,
    slotId: "",
    buffer: { before: 0, after: 0 },
    startDate: 0,
    dueDate: 0,
    ...partial,
  };
};

describe("Assign task time", () => {
  it("should assign tasks to available time slots without conflicts", () => {
    const queuedTasks: Task[] = [
      taskFactory({ id: "1", duration: 60, weight: 1, slotId: "1" }),
      taskFactory({ id: "2", duration: 60, weight: 1, slotId: "1" }),
      taskFactory({ id: "3", duration: 120, weight: 1, slotId: "1" }),
    ];
    const result = scheduleTasksInSlot(queuedTasks, [], 0, 240);

    expect(result.sortedTasks).toHaveLength(3);
    expect(result.queue).toHaveLength(0);
    expect(result.sortedTasks[0]).toMatchObject({ start: 0, end: 60 });
    expect(result.sortedTasks[1]).toMatchObject({ start: 60, end: 120 });
    expect(result.sortedTasks[2]).toMatchObject({ start: 120, end: 240 });
  });

  it("should skip busy events and assign tasks to another availabe time", () => {
    const busyEvents: (Task | Event)[] = [
      {
        id: "3",
        name: "Task3",
        notes: "",
        start: 60,
        end: 120,
        isBusy: true,
        isDone: false,
        isSortable: true,
        duration: 60,
        weight: 1,
        slotId: "1",
        buffer: { before: 0, after: 0 },
        startDate: 0,
        dueDate: 0,
      },
    ];
    const queuedTasks: Task[] = [
      taskFactory({ id: "1", duration: 60, weight: 1, slotId: "1" }),
      taskFactory({ id: "2", duration: 60, weight: 1, slotId: "1" }),
    ];
    const result = scheduleTasksInSlot(queuedTasks, busyEvents, 0, 180);

    expect(result.sortedTasks).toHaveLength(2);
    expect(result.sortedTasks[1]).toMatchObject({ start: 120, end: 180 });
  });

  it("should return remaining tasks when slot is full", () => {
    const queuedTasks: Task[] = [
      taskFactory({ id: "1", duration: 60, weight: 1, slotId: "1" }),
      taskFactory({ id: "2", duration: 60, weight: 1, slotId: "1" }),
      taskFactory({ id: "3", duration: 60, weight: 1, slotId: "1" }),
    ];
    const result = scheduleTasksInSlot(queuedTasks, [], 0, 120);

    expect(result.sortedTasks).toHaveLength(2);
    expect(result.queue).toHaveLength(1);
    expect(result.queue[0]).toMatchObject({ id: "3" });
  });

  it("should handle empty task queue", () => {
    const result = scheduleTasksInSlot([], [], 0, 100);

    expect(result.sortedTasks).toHaveLength(0);
    expect(result.queue).toHaveLength(0);
  });
});
