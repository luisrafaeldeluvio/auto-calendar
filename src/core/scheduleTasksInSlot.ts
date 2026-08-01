import { Temporal } from "@js-temporal/polyfill";
import type { TasksSchedule } from "../types/common";
import type { CalendarItem, CalendarTask, CalendarTaskUnscheduled } from "../types/models/calendarItem";

export const scheduleTasksInSlot = (
  queuedTasks: CalendarTaskUnscheduled[],
  activeEvents: CalendarItem[],
  slotStartTime: Temporal.PlainTime,
  slotEndTime: Temporal.PlainTime,
  date: Temporal.PlainDate,
) => {
  const busyEvents = activeEvents.filter((e) => e.isBusy);
  const sortTasks = queuedTasks.toSorted((a, b) => b.weight - a.weight);
  
  // - [ ] should add creationDate property on CalenderBase. So when sorting
  // those with older creationDate will have higher priority
  const schedule = (
    tasksToProcess: CalendarTaskUnscheduled[],
    currentTime: Temporal.PlainTime,
    sortedTasks: CalendarTask[],
  ): TasksSchedule => {
    const [task, ...remainingTasks] = tasksToProcess;
    if (!task) return { sortedTasks: sortedTasks, queue: [] };

    const taskStartTime: Temporal.PlainTime = currentTime;
    const taskEndTime: Temporal.PlainTime = taskStartTime.add(
      task.duration ?? { minutes: 0 },
    );

    const overlappingEvent: CalendarItem | undefined = busyEvents.find(
      (e) =>
        e.start &&
        e.end &&
        Temporal.PlainTime.compare(e.end, taskStartTime) === 1 &&
        Temporal.PlainTime.compare(taskEndTime, e.start) === 1,
    );

    if (overlappingEvent && overlappingEvent.end)
      return schedule(
        tasksToProcess,
        Temporal.PlainTime.from(overlappingEvent.end),
        [...sortedTasks],
      );

    const isSlotFull =
      Temporal.PlainTime.compare(taskEndTime, slotEndTime) === 1;

    if (isSlotFull) {
      return {
        sortedTasks: sortedTasks,
        queue: [...remainingTasks, {
          ...task,
          start: null,
          end: null,
          isSorted: false, 
          isBusy: false
        }],
      };
    }

    const newTask: CalendarTask = {
      ...task,
      start: date.toPlainDateTime(taskStartTime),
      end: date.toPlainDateTime(taskEndTime),
      isBusy: true,
      isSorted: true,
    };

    return schedule(remainingTasks, taskEndTime, [...sortedTasks, newTask]);
  };

  return schedule(sortTasks, slotStartTime, []);
};
