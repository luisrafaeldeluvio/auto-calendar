import { Temporal } from "@js-temporal/polyfill";
import type { TasksSchedule } from "../types/common";
import type {
  CalendarItem,
  CalendarTaskUnscheduled,
} from "../types/models/calendarItem";
import type { TimeSlot } from "../types/models/timeslot";
import { resolveSlotTaskConflicts } from "./resolveSlotTaskConflicts";
import { scheduleTasksInSlot } from "./scheduleTasksInSlot";
//per day palang ito
// Though while this is per day, it can also be considered as
// scheduling multiple slots within a day. So instead of
// recalculating the whole day, we have the option to only
// calculate a later part of the day.
export const scheduleTasks = (
  queuedTasks: CalendarTaskUnscheduled[],
  busyEvents: CalendarItem[],
  timeSlots: TimeSlot[],
  date: Temporal.PlainDate,
): TasksSchedule[] => {
  const scheduleTasksRecursion = (
    busyEvents: CalendarItem[],
    timeSlots: TimeSlot[],
    sortedTasks: TasksSchedule[] = [],
  ) => {
    const [currentSlot, nextSlot, ...slots] = timeSlots;
    if (!currentSlot) return sortedTasks;
    const tasks = queuedTasks.filter((t) => t.slotId === currentSlot.id);
    console.log("Scheduling in slot: ", currentSlot.id);

    const areSlotsOverlapping =
      nextSlot !== undefined &&
      Temporal.PlainTime.compare(nextSlot.start, currentSlot.end) === -1;

    areSlotsOverlapping &&
      console.log(
        "Slot: ",
        currentSlot.id,
        " and",
        nextSlot?.id,
        "are Overlapping",
      );
    console.log("Resolving slot conflict...");
    const sorted: TasksSchedule = areSlotsOverlapping
      ? resolveSlotTaskConflicts(
          currentSlot,
          nextSlot,
          queuedTasks,
          busyEvents,
          date,
        )
      : scheduleTasksInSlot(
          tasks,
          busyEvents,
          currentSlot.start,
          currentSlot.end,
          date,
        );

    console.log("Items in slot scheduled. Scheduling next slot.");
    return scheduleTasksRecursion(
      [...busyEvents, ...sorted.sortedTasks],
      [...(nextSlot ? [nextSlot] : []), ...slots],
      [
        ...sortedTasks,
        { sortedTasks: sorted.sortedTasks, queue: sorted.queue },
      ],
    );
  };

  console.log("Scheduling items in", date.toString(), "per slot");
  return scheduleTasksRecursion(busyEvents, timeSlots, []);
};
