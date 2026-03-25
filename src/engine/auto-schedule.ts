import type { AutoTask, Result, Event, TimeSlot } from "./types";
import { queuedTasks, slots } from "./mock-data";
import { getSlot } from "./time-slots";

interface MutationData {
  tasks: AutoTask[];
  queue: AutoTask[];
}

export const scheduleTasks = (
  queuedTasks: readonly AutoTask[],
  activeEvents: readonly Event[],
  slots: readonly TimeSlot[],
): Result<MutationData, "SLOT_NOT_FOUND"> => {
  const tasksBySlots = Object.entries(
    queuedTasks.reduce(
      (tasks, task) => ({
        ...tasks,
        [task.slotId]: [...(tasks[task.slotId] ?? []), task],
      }),
      {} as Record<string, AutoTask[]>,
    ),
  );

  const tasks: MutationData | "SLOT_NOT_FOUND" = tasksBySlots.reduce(
    (acc, [slotId, taskList]) => {
      if (acc === "SLOT_NOT_FOUND") return "SLOT_NOT_FOUND";

      const slot = getSlot(slots, slotId);

      if (!slot) {
        return "SLOT_NOT_FOUND";
      } else {
        const sortedTask = sortTasks(
          taskList,
          activeEvents,
          slot.start,
          slot.end,
        );
        return {
          tasks: [...acc.tasks, ...sortedTask.tasks],
          queue: [...acc.queue, ...sortedTask.queue],
        };
      }
    },
    { tasks: [], queue: [] } as MutationData | "SLOT_NOT_FOUND",
  );

  if (tasks === "SLOT_NOT_FOUND") return { ok: false, error: "SLOT_NOT_FOUND" };

  return { ok: true, data: tasks };
};

const sortTasks = (
  queuedTasks: readonly AutoTask[],
  activeEvents: readonly Event[],
  startTime: number,
  maxTime: number,
  toSchedule: AutoTask[] = [],
) => {
  const [task, ...tasks] = queuedTasks;

  if (!task) return { tasks: toSchedule, queue: [] };

  const busyEvents = !toSchedule.length
    ? activeEvents.filter((e) => e.isBusy)
    : activeEvents;
  const currenTotalTime = startTime + task.duration;
  const isOverlap = busyEvents.find(
    (e) => e.end > startTime && currenTotalTime > e.start,
  );

  if (isOverlap)
    return sortTasks(tasks, busyEvents, isOverlap.end, maxTime, [
      ...toSchedule,
    ]);

  const isScheduleFull = currenTotalTime > maxTime;
  if (isScheduleFull) {
    return { tasks: toSchedule, queue: [...tasks, task] };
  }

  const newTask: AutoTask = {
    ...task,
    start: startTime,
    end: currenTotalTime,
  };

  return sortTasks(tasks, busyEvents, currenTotalTime, maxTime, [
    ...toSchedule,
    newTask,
  ]);
};

// TODO:
// - [/] Allow the timeslots to overlap with each other
// - [/] Implement timeslots to the algorithm
// - [ ] Implement the buffer to the algorithm

// just plan out the data structure first
// since the auto schedule only occurs in 1 (or 2) week

// I should implement a days/calendar system. AutoTasks should have
//  a DUE date(default is today at 23:59) and STARTING date(default is today).
// If the task's starting date is more than 2 weeks from now, just set it aside.
// If the task can't be assigned a time, jsut set it aside for now aswell.

// if (!inSlot) {
// maybe we can change the usedTime to slot.start?
// but what if we have another task that is in the same slot? that wont work.
// visualize this whole function in paper and try again.

// one way to think about this is each slots is its own total time. so slot.end can be TOTAL_TIME,
// that means that we just need to split this even  more to their own pieces.
// }
