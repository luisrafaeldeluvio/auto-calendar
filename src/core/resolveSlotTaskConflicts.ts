import { Temporal } from "@js-temporal/polyfill";
import type { TasksSchedule } from "../types/common";
import type { CalendarItem, CalendarTask } from "../types/models/calendarItem";
import type { TimeSlot } from "../types/models/timeslot";
import { scheduleTasksInSlot } from "./scheduleTasksInSlot";

const resolveConflictsByWeight = (
  timeslot: TimeSlot,
  tasks: CalendarTask[],
  result: CalendarTask[] = [],
  queue: CalendarTask<null>[] = [],
): TasksSchedule => {
  const [curr, ...rest] = tasks;
  if (!curr)
    return {
      sortedTasks: result.filter((t) => t.slotId === timeslot.id),
      queue: queue.filter((t) => t.slotId === timeslot.id),
    };

  const overlappingTasks = rest.filter(
    (t) =>
      Temporal.PlainTime.compare(t.start ?? {}, curr.end ?? {}) <= 0 &&
      Temporal.PlainTime.compare(curr.start ?? {}, t.end ?? {}) <= 0,
  );
  const isCurrLowerWeight = overlappingTasks.some(
    (t) => t.weight > curr.weight,
  );

  if (isCurrLowerWeight)
    return resolveConflictsByWeight(timeslot, rest, result, [
      ...queue,
      ...[curr].map((v) => {
        return {
          ...v,
          start: null,
          end: null,
        };
      }),
    ]);

  return resolveConflictsByWeight(timeslot, rest, [...result, curr], queue);
};

export const resolveSlotTaskConflicts = (
  timeslotA: TimeSlot,
  timeslotB: TimeSlot,
  tasks: CalendarTask<null>[],
  busyEvents: CalendarItem[],
  date: Temporal.PlainDate,
): TasksSchedule => {
  const assignedTasksA = scheduleTasksInSlot(
    tasks.filter((t) => t.slotId === timeslotA.id),
    busyEvents,
    timeslotA.start,
    timeslotA.end,
    date,
  );
  const assignedTasksB = scheduleTasksInSlot(
    tasks.filter((t) => t.slotId === timeslotB.id),
    busyEvents,
    timeslotA.start,
    timeslotB.end,
    date,
  );

  const result = resolveConflictsByWeight(timeslotA, [
    ...assignedTasksA.sortedTasks,
    ...assignedTasksB.sortedTasks,
  ]);

  return {
    sortedTasks: result.sortedTasks,
    queue: [...result.queue, ...assignedTasksA.queue],
  };
};
