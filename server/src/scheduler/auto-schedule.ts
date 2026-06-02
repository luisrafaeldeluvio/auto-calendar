import type { Task, Result, Event, TimeSlot } from "../core/types";
// import { getSlot } from "./time-slots";

// interface MutationData {
//   tasks: Task[];
//   queue: Task[];
// }

// export const scheduleTasks = (
//   queuedTasks: readonly Task[],
//   activeEvents: readonly Event[],
//   slots: readonly TimeSlot[],
// ): Result<MutationData, "SLOT_NOT_FOUND"> => {
//   const tasksBySlots = Object.entries(
//     queuedTasks.reduce(
//       (tasks, task) => ({
//         ...tasks,
//         [task.slotId]: [...(tasks[task.slotId] ?? []), task],
//       }),
//       {} as Record<string, Task[]>,
//     ),
//   );

//   const tasks: MutationData | "SLOT_NOT_FOUND" = tasksBySlots.reduce(
//     (acc, [slotId, taskList]) => {
//       if (acc === "SLOT_NOT_FOUND") return "SLOT_NOT_FOUND";

//       const slot = getSlot(slots, slotId);

//       if (!slot) {
//         return "SLOT_NOT_FOUND";
//       } else {
//         const sortedTask = assignTaskTimesBySlot(
//           taskList,
//           activeEvents,
//           slot.start,
//           slot.end,
//         );
//         return {
//           tasks: [...acc.tasks, ...sortedTask.sortedTasks],
//           queue: [...acc.queue, ...sortedTask.queue],
//         };
//       }
//     },
//     { tasks: [], queue: [] } as MutationData | "SLOT_NOT_FOUND",
//   );

//   if (tasks === "SLOT_NOT_FOUND") return { ok: false, error: "SLOT_NOT_FOUND" };

//   return { ok: true, data: tasks };
// };

export interface TasksSchedule {
  sortedTasks: Task[];
  queue: Task[];
}

export const assignTaskTimesBySlot = (
  queuedTasks: readonly Task[],
  activeEvents: readonly (Event | Task)[],
  slotStartTime: number,
  slotEndTime: number,
  sortedTasks: Task[] = [],
): TasksSchedule => {
  const [currentTask, ...remainingTasks] = queuedTasks;
  if (!currentTask) return { sortedTasks: sortedTasks, queue: [] };

  const currentTaskStartTime: number = slotStartTime;
  const currentTaskEndTime: number =
    currentTaskStartTime + currentTask.duration;
  const busyEvents: readonly (Event | Task)[] = !sortedTasks.length
    ? activeEvents.filter((e) => e.isBusy)
    : activeEvents;
  const overlappingEvent: Event | Task | undefined = busyEvents.find(
    (e) => e.end > currentTaskStartTime && currentTaskEndTime > e.start,
  );

  if (overlappingEvent)
    return assignTaskTimesBySlot(
      queuedTasks,
      busyEvents,
      overlappingEvent.end,
      slotEndTime,
      [...sortedTasks],
    );

  const isSlotFull = currentTaskEndTime > slotEndTime;
  if (isSlotFull) {
    return {
      sortedTasks: sortedTasks,
      queue: [...remainingTasks, currentTask],
    };
  }

  const newTask: Task = {
    ...currentTask,
    start: currentTaskStartTime,
    end: currentTaskEndTime,
  };

  return assignTaskTimesBySlot(
    remainingTasks,
    busyEvents,
    currentTaskEndTime,
    slotEndTime,
    [...sortedTasks, newTask],
  );
};

// MY THOUGHTS
// i think we can just sort the tasks directly by slots instead of the whole agenda thing
// like we will get all the tasks per slot and then rank them. I think that's better.
// yep this is better.

// currently, it is not taking into consideration other slots it overlaps with and the tasks in them.
// maybe we get the slots that overlaps with the main slot
// and get the tasks of those slots that is within the main slot?

// let's scrap the agenda and think of a better way of doing things.

// const queuedTasks: Task[] = [
//   {
//     id: "1",
//     name: "Task1",
//     notes: "",
//     start: 0,
//     end: 0,
//     isBusy: true,
//     isDone: false,
//     isSortable: true,
//     duration: 60,
//     weight: 1,
//     slotId: "1",
//     buffer: { before: 0, after: 0 },
//     startDate: 0,
//     dueDate: 0,
//   },
//   {
//     id: "2",
//     name: "Task2",
//     notes: "",
//     start: 0,
//     end: 0,
//     isBusy: true,
//     isDone: false,
//     isSortable: true,
//     duration: 60,
//     weight: 1,
//     slotId: "1",
//     buffer: { before: 0, after: 0 },
//     startDate: 0,
//     dueDate: 0,
//   },
// ];
// const activeEvents: Event[] = [];
// const slotStartTime: number = 0;
// const slotEndTime: number = 180;

// // const test2 = assignTaskTimesBySlot(
// //   queuedTasks.sort((a, b) => b.weight - a.weight),
// //   activeEvents,
// //   120,
// //   240,
// // );

// const test = assignTaskTimesBySlot(
//   queuedTasks.sort((a, b) => b.weight - a.weight),
//   [
//     {
//       id: "3",
//       name: "Task3",
//       notes: "",
//       start: 60,
//       end: 120,
//       isBusy: true,
//       isDone: false,
//       isSortable: true,
//       duration: 60,
//       weight: 1,
//       slotId: "1",
//       buffer: { before: 0, after: 0 },
//       startDate: 0,
//       dueDate: 0,
//     },
//   ],
//   slotStartTime,
//   slotEndTime,
// );

// const flattenTasks = (tasks: Task[]) =>
//   tasks.map((test) => ({
//     //  id: test.id,
//     name: test.name,
//     // notes: test.notes,

//     start: test.start,
//     end: test.end,

//     // isBusy: test.isBusy,
//     // isDone: test.isDone,
//     // isSortable: test.isSortable,
//     duration: test.duration,
//     weight: test.weight,
//     // slotId: test.slotId,
//     // bufferBefore: test.buffer.before,
//     // bufferAfter: test.buffer.after,
//     // startDate: test.startDate,
//     // dueDate: test.dueDate,
//   }));

// console.log(`Slot 1\nStart:${slotStartTime} - End:${slotEndTime}`);
// console.log("sorted");
// console.table(flattenTasks(test.sortedTasks));
// console.log("queue");
// console.table(flattenTasks(test.queue));
