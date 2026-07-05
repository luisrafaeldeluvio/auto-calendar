import { Temporal } from "@js-temporal/polyfill";
import type { Event, TimeSlot } from "../core/types";
import { resolveSlotTaskConflicts } from "./resolveSlotTaskConflicts";
import { scheduleTasksInSlot, type TasksSchedule } from "./scheduleTasksInSlot";

//per day palang ito
export const scheduleTasks = (
  queuedTasks: Event[],
  busyEvents: Event[],
  timeSlots: TimeSlot[],
  sortedTasks: TasksSchedule[] = [],
): TasksSchedule[] => {
  const [currentSlot, nextSlot, ...slots] = timeSlots;
  if (!currentSlot) return sortedTasks;

  const tasks = queuedTasks.filter((t) => t.slotId === currentSlot.id);

  const areSlotsOverlapping =
    nextSlot !== undefined &&
    Temporal.PlainTime.compare(nextSlot.start, currentSlot.end) === -1;

  const sorted = areSlotsOverlapping
    ? resolveSlotTaskConflicts(currentSlot, nextSlot, queuedTasks, busyEvents)
    : scheduleTasksInSlot(
        tasks,
        busyEvents,
        currentSlot.start,
        currentSlot.end,
      );

  return scheduleTasks(
    queuedTasks,
    [...busyEvents, ...sorted.sortedTasks],
    [...(nextSlot ? [nextSlot] : []), ...slots],
    [...sortedTasks, sorted],
  );
};
