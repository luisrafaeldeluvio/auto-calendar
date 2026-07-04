import { Temporal } from "@js-temporal/polyfill";
import type { Event } from "../core/types";

export interface TasksSchedule {
  sortedTasks: Event[];
  queue: Event[];
}

export const scheduleTasksInSlot = (
  queuedTasks: readonly Event[],
  activeEvents: readonly Event[],
  slotStartTime: Temporal.PlainTime,
  slotEndTime: Temporal.PlainTime,
  sortedTasks: Event[] = [],
): TasksSchedule => {
  const [currentTask, ...remainingTasks] = !sortedTasks.length
    ? queuedTasks.toSorted((a, b) => b.weight - a.weight)
    : queuedTasks;
  if (!currentTask) return { sortedTasks: sortedTasks, queue: [] };

  const currentTaskStartTime: Temporal.PlainTime = slotStartTime;
  const currentTaskEndTime: Temporal.PlainTime = currentTaskStartTime.add(
    currentTask.duration ?? { minutes: 0 },
  );

  const busyEvents: readonly Event[] = !sortedTasks.length
    ? activeEvents.filter((e) => e.isBusy)
    : activeEvents;

  const overlappingEvent: Event | undefined = busyEvents.find(
    (e) =>
      Temporal.PlainTime.compare(e.end ?? {}, currentTaskStartTime) === 1 &&
      Temporal.PlainTime.compare(currentTaskEndTime, e.start ?? {}) === 1,
  );

  if (overlappingEvent)
    return scheduleTasksInSlot(
      queuedTasks,
      busyEvents,
      overlappingEvent.end ?? Temporal.PlainTime.from({ minute: 0 }),
      slotEndTime,
      [...sortedTasks],
    );

  const isSlotFull =
    Temporal.PlainTime.compare(currentTaskEndTime, slotEndTime) === 1;

  if (isSlotFull) {
    return {
      sortedTasks: sortedTasks,
      queue: [...remainingTasks, currentTask],
    };
  }

  const newTask: Event = {
    ...currentTask,
    start: currentTaskStartTime,
    end: currentTaskEndTime,
  };

  return scheduleTasksInSlot(
    remainingTasks,
    busyEvents,
    currentTaskEndTime,
    slotEndTime,
    [...sortedTasks, newTask],
  );
};
