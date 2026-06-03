import type { Result, Task, TimeSlot, Event } from "../core/types";
import { scheduleTasksInSlot, type TasksSchedule } from "./scheduleTasksInSlot";
import {
  slot_normal,
  slot_intersect_with_normal,
  all_tasks,
} from "../mock-data";

const all_slot = [
  { ...slot_normal },
  { ...slot_intersect_with_normal },
  {
    id: "3",
    name: "slot3",
    start: 180,
    end: 360,
  },
  {
    id: "4",
    name: "slot4",
    start: 400,
    end: 460,
  },
];

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

//per day palang ito
const scheduleTasks = (
  timeSlots: TimeSlot[],
  allTasks: Task[],
  usedSlots: TimeSlot[] = [],
  sortedTasks: TasksSchedule[] = [],
) => {
  const [slot, nextSlot, ...slots] = timeSlots;
  if (!slot) return sortedTasks;

  const tasks = allTasks.filter((t) => t.slotId === slot.id);
  const prevTask = sortedTasks[sortedTasks.length - 1];

  const isOverlapping = nextSlot
    ? calculateTimeslotOverlap(slot, nextSlot).ok
    : false;

  // console.warn(isOverlapping);

  const sorted = isOverlapping
    ? handleOverlappingSlots(slot, nextSlot!, allTasks)
    : scheduleTasksInSlot(
        tasks,
        prevTask?.sortedTasks ?? [],
        slot.start,
        slot.end,
      );

  // console.warn(sorted);

  return scheduleTasks(
    [...(nextSlot ? [nextSlot] : []), ...slots],
    allTasks,
    [{ ...slot }, ...usedSlots],
    [...sortedTasks, { ...sorted }],
  );
};

// ----

function flattenTasks(tasks: Task[]) {
  return tasks.map((test) => ({
    name: test.name,
    start: test.start,
    end: test.end,
    duration: test.duration,
    weight: test.weight,
  }));
}

const result = scheduleTasks(all_slot, all_tasks);
result.forEach((r, i) => {
  console.log("tasks #", i);
  console.log("sorted");
  console.table(flattenTasks(r.sortedTasks));
  console.log("queue");
  console.table(r.queue.length > 0 ? flattenTasks(r.queue) : "");
});
