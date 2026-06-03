import type { Result, Task, TimeSlot } from "../core/types";
import { scheduleTasksInSlot, type TasksSchedule } from "./scheduleTasksInSlot";

export const calculateTimeslotOverlap = (
  slotA: TimeSlot,
  slotB: TimeSlot,
): Result<
  { readonly overlap: TimeSlot; readonly remainder: TimeSlot[] },
  "SLOTS_NOT_INTERSECT"
> => {
  const isIntersect = slotB.start < slotA.end;
  const isInside = slotA.end > slotB.end;

  if (!isIntersect) return { ok: false, error: "SLOTS_NOT_INTERSECT" };

  const overlap: TimeSlot = {
    id: crypto.randomUUID(),
    name: `Overlap of ${slotA.id} and ${slotB.id}`,
    start: slotB.start,
    end: slotA.end > slotB.end ? slotB.end : slotA.end,
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

const handleOverlappingSlots = (
  timeslotA: TimeSlot,
  timeslotB: TimeSlot,
  tasks: Task[],
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

  const combined = [
    ...assignedTasksA.sortedTasks,
    ...assignedTasksB.sortedTasks,
  ];

  const recursionTest = (
    tasks: Task[],
    result: Task[] = [],
    queue: Task[] = [],
  ): TasksSchedule => {
    const [curr, ...rest] = tasks;
    if (!curr)
      return {
        sortedTasks: result.filter((t) => t.slotId === timeslotA.id),
        queue: queue.filter((t) => t.slotId === timeslotA.id),
      };

    const overlappingTasks = rest.filter(
      (t) => t.start <= curr.end && curr.start <= t.end,
    );

    const isCurrLowerWeight = overlappingTasks.some(
      (t) => t.weight > curr.weight,
    );

    if (isCurrLowerWeight)
      return recursionTest(rest, result, [
        ...queue,
        ...[curr].map((v) => {
          return {
            ...v,
            start: 0,
            end: 0,
          };
        }),
      ]);

    return recursionTest(rest, [...result, curr], queue);
  };

  console.warn("THIS WAS RUNNNNNNNNNNNNNNNNN");
  console.warn(recursionTest(combined));
  return recursionTest(combined);
};
