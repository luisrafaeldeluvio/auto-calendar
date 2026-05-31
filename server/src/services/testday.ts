import type { Result, Task, TimeSlot, Event } from "../types";
import { assignTaskTimesBySlot, type TasksSchedule } from "./auto-schedule";
import {
  slot_normal,
  slot_intersect_with_normal,
  all_tasks,
} from "./mock-data";

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
) => {
  const assignedTasksA = assignTaskTimesBySlot(
    tasks.filter((t) => t.slotId === timeslotA.id),
    [],
    timeslotA.start,
    timeslotA.end,
  );
  const assignedTasksB = assignTaskTimesBySlot(
    tasks.filter((t) => t.slotId === timeslotB.id),
    [],
    timeslotB.start,
    timeslotB.end,
  );

  const combined = [
    ...assignedTasksA.sortedTasks,
    ...assignedTasksB.sortedTasks,
  ];

  console.table(flattenTasks(combined));

  const recursionTest = (tasks: Task[], result: Task[] = []) => {
    const [curr, ...rest] = tasks;
    if (!curr)
      return {
        result: result,
      };

    const overlappingTasks = rest.filter(
      (t) => t.start <= curr.end && curr.start <= t.end,
    );

    const isCurrLowerWeight = overlappingTasks.some(
      (t) => t.weight > curr.weight,
    );

    if (isCurrLowerWeight) return recursionTest(rest, result);

    return recursionTest(rest, [...result, curr]);
  };

  console.table(
    flattenTasks(
      recursionTest(combined).result.filter((t) => t.slotId === timeslotA.id),
    ),
  );

  // heres an idea
  // what if we create a master time, we take the curr task in A and we take its interval and look at other
  // tasks where their interval overlaps with the curr task in A (Like a bubble sort). If we find some, let's compare curr task from A
  // to each of them, as soon as currTaskA < someTaskX we will move on else we place the curr task A. So here we will have a counter
  // for the current time.
};

const x = calculateTimeslotOverlap(slot_normal, slot_intersect_with_normal);

if (x.ok)
  handleOverlappingSlots(slot_normal, slot_intersect_with_normal, all_tasks);

//per day palang ito
const scheduleTasks = (
  timeSlots: TimeSlot[],
  allTasks: Task[],
  usedSlots: TimeSlot[] = [],
  sortedTasks: TasksSchedule[] = [],
) => {
  const [slot, ...slots] = timeSlots;
  if (!slot) return sortedTasks;

  const tasks = allTasks.filter((t) => t.slotId === slot.id);
  const prevTask = sortedTasks[sortedTasks.length - 1];
  // althought we can just pass all the sorted pask here
  // instead of just the previous task.
  const sorted = assignTaskTimesBySlot(
    tasks,
    prevTask?.sortedTasks ?? [],
    slot.start,
    slot.end,
  );

  // wait this don't make sense. is the overlaps being their own timeslots even actually a good idea?
  // here's an example:
  // say the slots are from 1-4 and 3-6
  // after the overlap calcuations the new slots will be 1-2 3-4 and 5-6
  // now, say we have a task from the initial 1-4 slot that is 2 hours long,
  // it would not fit in 1-2 and 3-4. yeah this was an oversight.

  // ------------------------------------
  // wait maybe what if we assign time to both overlapping slots at the same time.
  // we then compare the tasks from slotA and tasks from slotB that overlaps or within
  // the overlapping part. Here's an example:

  // SlotA: 1-5 SlotB: 3-7
  // | SlotA Task         | SlotB Task      |
  // | ------------------ | --------------- |
  // | 1: 1 hours; normal | 2 hours; normal |
  // | 2: 3 hours; normal | 2 hours; high   |

  // We sort them at the same time
  // | 1-2: SlotA-1 | 3-5: SlotB-2 |
  // | 2-5: SlotA-2 | 5-7: SlotB-1 |

  // SlotA-2 and SlotB-2 overlaps with the overlapping part
  // Since SlotB-2 has higher getPriority, we assign time again
  // to SlotA but 3-5 is now blocked.

  return scheduleTasks(
    slots,
    allTasks,
    [{ ...slot }, ...usedSlots],
    [...sortedTasks, { ...sorted }],
  );
};

// ----

const flattenTasks = (tasks: Task[]) =>
  tasks.map((test) => ({
    //  id: test.id,
    name: test.name,
    // notes: test.notes,

    start: test.start,
    end: test.end,

    // isBusy: test.isBusy,
    // isDone: test.isDone,
    // isSortable: test.isSortable,
    duration: test.duration,
    weight: test.weight,
    // slotId: test.slotId,
    // bufferBefore: test.buffer.before,
    // bufferAfter: test.buffer.after,
    // startDate: test.startDate,
    // dueDate: test.dueDate,
  }));

// const result = scheduleTasks(all_slot, all_tasks);
// result.forEach((r, i) => {
//   console.log("tasks #", i);
//   console.log("sorted");
//   console.table(flattenTasks(r.sortedTasks));
//   console.log("queue");
//   console.table(r.queue.length > 0 ? flattenTasks(r.queue) : "");
// });
