import { Temporal } from "@js-temporal/polyfill";
import type { Event, TasksSchedule, TimeSlot } from "../types/types";
import { scheduleTasksInSlot, } from "./scheduleTasksInSlot";

const resolveConflictsByWeight = (
  timeslot: TimeSlot,
  tasks: Event<Temporal.PlainDateTime>[],
  result: Event<Temporal.PlainDateTime>[] = [],
  queue: Event<null>[] = [],
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
  tasks: Event<null>[],
  busyEvents: Event<Temporal.PlainDateTime>[],
  date: Temporal.PlainDate
): TasksSchedule => {
  const assignedTasksA = scheduleTasksInSlot(
    tasks.filter((t) => t.slotId === timeslotA.id),
    busyEvents,
    timeslotA.start,
    timeslotA.end,
    date
  );
  const assignedTasksB = scheduleTasksInSlot(
    tasks.filter((t) => t.slotId === timeslotB.id),
    busyEvents,
    timeslotA.start,
    timeslotB.end,
    date
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
