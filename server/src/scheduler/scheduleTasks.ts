import { Temporal } from "@js-temporal/polyfill";
import type { Event, TasksSchedule, TimeSlot } from "../core/types";
import { resolveSlotTaskConflicts } from "./resolveSlotTaskConflicts";
import { scheduleTasksInSlot, } from "./scheduleTasksInSlot";

//per day palang ito
// Though while this is per day, it can also be considered as
// scheduling multiple slots within a day. So instead of 
// recalculating the whole day, we have the option to only
// calculate a later part of the day.
export const scheduleTasks = (
  queuedTasks: Event[],
  busyEvents: Event<Temporal.PlainDateTime>[],
  timeSlots: TimeSlot[],
  // Move to inner recursion.
  sortedTasks: TasksSchedule<Temporal.PlainTime>[] = [],
  // Hardcode Date or make it optional?
): TasksSchedule<Temporal.PlainTime>[] => {
  const [currentSlot, nextSlot, ...slots] = timeSlots;
  if (!currentSlot) return sortedTasks;
  // I should mvoe this outside the recursion and then maybe turn the Id's
  // into a set.
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
    // Error here because busyEvent's interval is Temporal.PlainDateTime
    // while sorted.sortedTasks still uses Temporal.PlainTime
    [...(nextSlot ? [nextSlot] : []), ...slots],
    [...sortedTasks, sorted],
  );
};
