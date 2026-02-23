import { TOTAL_TIME } from "./constants";
import type { AutoTask, Result, Event } from "./types";
import { events, queuedTasks } from "./mock-data";

interface MutationData {
  tasks: AutoTask[];
  queue: AutoTask[];
}

const scheduleTasks = (
  queuedTasks: readonly AutoTask[],
  activeEvents: readonly Event[],
  toSchedule: AutoTask[] = [],
  usedTime = 0,
): Result<MutationData, ""> => {
  const busyEvents =
    toSchedule.length === 0
      ? activeEvents.filter((e) => e.isBusy)
      : activeEvents;
  const [task, ...tasks] = queuedTasks;

  if (!task) return { ok: true, data: { tasks: toSchedule, queue: [] } };

  const totalTime = usedTime + task.duration;
  const isOverlap = busyEvents.find(
    (e) => e.end > usedTime && totalTime > e.start,
  );

  if (isOverlap)
    return scheduleTasks(tasks, busyEvents, [...toSchedule], isOverlap.end);

  const isScheduleFull = totalTime > TOTAL_TIME;
  if (isScheduleFull) {
    return { ok: true, data: { tasks: toSchedule, queue: [task, ...tasks] } };
  }

  const newTask: AutoTask = {
    ...task,
    start: usedTime,
    end: totalTime,
  };

  return scheduleTasks(tasks, busyEvents, [...toSchedule, newTask], totalTime);
};

console.time("heavy-task");
const scheduled = scheduleTasks(
  queuedTasks.sort((a, b) => a.weight - b.weight),
  events,
);
console.timeEnd("heavy-task");

// if (scheduled.ok) console.log(scheduled.data);

// just plan out the data structure first
// since the auto schedule only occurs in 1 (or 2) week

// I should implement a days/calendar system. AutoTasks should have
//  a DUE date(default is today at 23:59) and STARTING date(default is today).
// If the task's starting date is more than 2 weeks from now, just set it aside.
// If the task can't be assigned a time, jsut set it aside for now aswell.
