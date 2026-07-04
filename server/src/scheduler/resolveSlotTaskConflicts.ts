import { Temporal } from "@js-temporal/polyfill";
import type { Result, Event, TimeSlot } from "../core/types";
import { scheduleTasksInSlot, type TasksSchedule } from "./scheduleTasksInSlot";

export const splitOverlappingSlots = (
  slotA: TimeSlot,
  slotB: TimeSlot,
): Result<
  { readonly overlap: TimeSlot; readonly remainder: TimeSlot[] },
  "SLOTS_NOT_INTERSECT"
> => {
  const isIntersect = Temporal.PlainTime.compare(slotB.start, slotA.end) === -1;
  const isInside = Temporal.PlainTime.compare(slotA.end, slotB.end) === 1;

  if (!isIntersect) return { ok: false, error: "SLOTS_NOT_INTERSECT" };

  const overlap: TimeSlot = {
    id: crypto.randomUUID(),
    name: `Overlap of ${slotA.id} and ${slotB.id}`,
    start: slotB.start,
    end:
      Temporal.PlainTime.compare(slotA.end, slotB.end) === 1
        ? slotB.end
        : slotA.end,
  };

  return {
    ok: true,
    data: {
      overlap: overlap,
      remainder: [
        {
          ...slotA,
          end: slotB.start,
        },
        {
          ...slotB,
          start: isInside ? slotB.end : slotA.end,
        },
      ],
    },
  };
};

const resolveConflictsByWeight = (
  timeslot: TimeSlot,
  tasks: Event[],
  result: Event[] = [],
  queue: Event[] = [],
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
  tasks: Event[],
): TasksSchedule => {
  const assignedTasksA = scheduleTasksInSlot(
    tasks.filter((t) => t.slotId === timeslotA.id),
    [],
    timeslotA.start,
    timeslotA.end,
  );
  const assignedTasksB = scheduleTasksInSlot(
    tasks.filter((t) => t.slotId === timeslotB.id),
    [],
    timeslotB.start,
    timeslotB.end,
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
