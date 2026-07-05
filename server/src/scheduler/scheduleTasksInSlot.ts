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
) => {
  const busyEvents = activeEvents.filter((e) => e.isBusy);
  const sortTasks = queuedTasks.toSorted((a, b) => b.weight - a.weight);

  const schedule = (
    tasksToProcess: readonly Event[],
    currentTime: Temporal.PlainTime,
    sortedTasks: Event[],
  ): TasksSchedule => {
    const [task, ...remainingTasks] = tasksToProcess;
    if (!task) return { sortedTasks: sortedTasks, queue: [] };

    const taskStartTime: Temporal.PlainTime = currentTime;
    const taskEndTime: Temporal.PlainTime = taskStartTime.add(
      task.duration ?? { minutes: 0 },
    );

    const overlappingEvent: Event | undefined = busyEvents.find(
      (e) =>
        e.start &&
        e.end &&
        Temporal.PlainTime.compare(e.end, taskStartTime) === 1 &&
        Temporal.PlainTime.compare(taskEndTime, e.start) === 1,
    );

    if (overlappingEvent && overlappingEvent.end)
      return schedule(tasksToProcess, overlappingEvent.end, [...sortedTasks]);

    const isSlotFull =
      Temporal.PlainTime.compare(taskEndTime, slotEndTime) === 1;

    if (isSlotFull) {
      return {
        sortedTasks: sortedTasks,
        queue: [...remainingTasks, task],
      };
    }

    const newTask: Event = {
      ...task,
      start: taskStartTime,
      end: taskEndTime,
      isBusy: true,
      isSorted: true,
    };

    return schedule(remainingTasks, taskEndTime, [...sortedTasks, newTask]);
  };

  return schedule(sortTasks, slotStartTime, []);
};
