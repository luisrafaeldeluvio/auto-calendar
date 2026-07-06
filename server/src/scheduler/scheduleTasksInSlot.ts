import { Temporal } from "@js-temporal/polyfill";
import type { Event } from "../core/types";

export interface TasksSchedule {
  sortedTasks: Event[];
  queue: Event[];
}

export const scheduleTasksInSlot = (
  queuedTasks: readonly Event[],
  activeEvents: readonly Event[],
  slotStartTime: Temporal.PlainTime,
  slotEndTime: Temporal.PlainTime,
) => {
  const busyEvents = activeEvents.filter((e) => e.isBusy);
  const sortTasks = queuedTasks.toSorted((a, b) => b.weight - a.weight);

  const schedule = (
    tasksToProcess: readonly Event[],
    currentTime: Temporal.PlainTime,
    sortedTasks: Event[],
  ): TasksSchedule => {
    const [task, ...remainingTasks] = tasksToProcess;
    if (!task) return { sortedTasks: sortedTasks, queue: [] };

    const taskStartTime: Temporal.PlainTime = currentTime;
    const taskEndTime: Temporal.PlainTime = taskStartTime.add(
      task.duration ?? { minutes: 0 },
    );

    const overlappingEvent: Event | undefined = busyEvents.find(
      (e) =>
        e.start &&
        e.end &&
        Temporal.PlainTime.compare(e.end, taskStartTime) === 1 &&
        Temporal.PlainTime.compare(taskEndTime, e.start) === 1,
    );

    if (overlappingEvent && overlappingEvent.end)
      return schedule(tasksToProcess, overlappingEvent.end, [...sortedTasks]);

    const isSlotFull =
      Temporal.PlainTime.compare(taskEndTime, slotEndTime) === 1;

    if (isSlotFull) {
      return {
        sortedTasks: sortedTasks,
        queue: [...remainingTasks, task],
      };
    }

    const newTask: Event = {
      ...task,
      start: taskStartTime,
      end: taskEndTime,
      isBusy: true,
      isSorted: true,
    };

    return schedule(remainingTasks, taskEndTime, [...sortedTasks, newTask]);
  };

  return schedule(sortTasks, slotStartTime, []);
};

const taskFactory = (partial: Partial<Event> = {}): Event => {
  return {
    type: "task",
    id: crypto.randomUUID(),
    name: "",
    notes: "",
    start: null,
    end: null,
    isBusy: true,
    isDone: false,
    isSortable: true,
    isSorted: false,
    duration: null,
    weight: 1,
    slotId: "",
    buffer: { before: null, after: null },
    startDate: null,
    dueDate: null,
    ...partial,
  };
};

const busyEvents: Event[] = [
  taskFactory({
    id: "3",
    name: "Task3",
    start: Temporal.PlainTime.from({ hour: 1, minute: 0 }), // 60 mins
    end: Temporal.PlainTime.from({ hour: 2, minute: 0 }), // 120 mins
    isBusy: true,
    duration: Temporal.Duration.from({ minutes: 60 }),
    slotId: "1",
  }),
];
const queuedTasks: Event[] = [
  taskFactory({
    id: "1",
    duration: Temporal.Duration.from({ minutes: 60 }),
    slotId: "1",
  }),
  taskFactory({
    id: "2",
    duration: Temporal.Duration.from({ minutes: 60 }),
    slotId: "1",
  }),
];

const result = scheduleTasksInSlot(
  queuedTasks,
  busyEvents,
  Temporal.PlainTime.from({ hour: 0, minute: 0 }),
  Temporal.PlainTime.from({ hour: 3, minute: 0 }), // 180 mins
);

console.log(result);
