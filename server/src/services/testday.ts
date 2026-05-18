import type { Task, TimeSlot } from "../types";
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
];

// we need to get all the overlapping time slots and turn them into their own time slot,
// so that means that the og timeslot's that are overlapping will be temporarily reduced
// call a function for that.

const splitTimeSlotsOverlap = (slot1: TimeSlot, slot2: TimeSlot) => {
  if (slot2.start < slot1.end) {
    const overlap: TimeSlot = {
      id: crypto.randomUUID(),
      name: `Overlap of ${slot1.id} and ${slot2.id}`,
      start: slot2.start,
      end: slot1.end,
    };

    return {
      overlap: overlap,
      remainder: [
        {
          ...slot1,
          end: slot2.start,
        },
        {
          ...slot2,
          start: slot1.end,
        },
      ] as TimeSlot[],
    };
  } else {
    return { overlap: null, remainder: [slot1, slot2] };
  }
};

const sliceOverlappingTimeSlots = (
  timeslots: TimeSlot[],
  slicedTimeSlots: TimeSlot[] = [],
) => {
  const [current, next, ...rest] = timeslots;
  if (!current || !next) return slicedTimeSlots;

  const joinedTimeSlots = splitTimeSlotsOverlap(
    slicedTimeSlots[slicedTimeSlots.length - 1] ?? current,
    next,
  );

  const [slot1, slot2] = joinedTimeSlots.remainder;
  const overlapslot = joinedTimeSlots.overlap;
  if (!slot1 || !slot2 || !overlapslot) return [];

  const remainingSlots = slicedTimeSlots.toSpliced(-1, 1);

  return sliceOverlappingTimeSlots(
    [next, ...rest],
    [...remainingSlots, slot1, overlapslot, slot2],
  );
};

console.time();
const x = sliceOverlappingTimeSlots(all_slot);
console.timeEnd();

console.log(x);
// working na!
// console.log(x);
// after getting the overlapping timeslots, we will use the remainder timeslots
// for the initial sorting of slo1 and 2, and then the queue from those will be
// used for the joined time slot
// say we are now in slot3, we can just use the queue in slot 2 for the joined time slot.

// slot1: 1-4
// slot2: 2-7
// slot3: 6-9

// we extract the overlaps
// slot1: 1-2
// overlapslot1-2: 2-4
// slot2: 4-7
// overlapslot2-3: 6-7
// slot3: 8-9

// we sort items in slot1, we will get a sorted and queue object from that1, for overlapslot1-2,
// we will use the queue from slot1 and the items on slot2 as the item here.
// and then we will be using the queue from overlapslot1-2 as the items for slo2,etc.

// so the tasks will be prevSortedTasks.queue then
// so the overlapslots task will be prevSortedTasks.queue + nextTasks

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

  // console.log(prevTask);

  return scheduleTasks(
    slots,
    allTasks,
    [{ ...slot }, ...usedSlots],
    [...sortedTasks, { ...sorted }],
  );
};

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

// console.log(joinOverlappingTimeSlots(slot_normal, slot_intersect_with_normal));
