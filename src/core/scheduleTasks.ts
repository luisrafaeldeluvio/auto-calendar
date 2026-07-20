import { Temporal } from "@js-temporal/polyfill";
import type { Event, TasksSchedule, TimeSlot } from "../types/types";
import { resolveSlotTaskConflicts } from "./resolveSlotTaskConflicts";
import { scheduleTasksInSlot } from "./scheduleTasksInSlot";
//per day palang ito
// Though while this is per day, it can also be considered as
// scheduling multiple slots within a day. So instead of
// recalculating the whole day, we have the option to only
// calculate a later part of the day.
export const scheduleTasks = (
  queuedTasks: Event<null>[],
  busyEvents: Event<Temporal.PlainDateTime>[],
  timeSlots: TimeSlot[],
  date: Temporal.PlainDate,
): TasksSchedule[] => {
  const scheduleTasksRecursion = (
    busyEvents: Event<Temporal.PlainDateTime>[],
    timeSlots: TimeSlot[],
    sortedTasks: TasksSchedule[] = [],
  ) => {
    const [currentSlot, nextSlot, ...slots] = timeSlots;
    if (!currentSlot) return sortedTasks;
    const tasks = queuedTasks.filter((t) => t.slotId === currentSlot.id);

    const areSlotsOverlapping =
      nextSlot !== undefined &&
      Temporal.PlainTime.compare(nextSlot.start, currentSlot.end) === -1;

    const sorted: TasksSchedule = areSlotsOverlapping
      ? resolveSlotTaskConflicts(currentSlot, nextSlot, queuedTasks, busyEvents,date)
      : scheduleTasksInSlot(
          tasks,
          busyEvents,
          currentSlot.start,
          currentSlot.end,
          date
        );

    return scheduleTasksRecursion(
      [...busyEvents, ...sorted.sortedTasks],
      [...(nextSlot ? [nextSlot] : []), ...slots],
      [...sortedTasks, { sortedTasks: sorted.sortedTasks, queue: sorted.queue }],
    );
  };

  return scheduleTasksRecursion(busyEvents, timeSlots, []);
};
