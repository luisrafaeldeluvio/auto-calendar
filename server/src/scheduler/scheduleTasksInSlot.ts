import type { Task, Event } from "../core/types";

export interface TasksSchedule {
  sortedTasks: Task[];
  queue: Task[];
}

export const scheduleTasksInSlot = (
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
    return scheduleTasksInSlot(
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

  return scheduleTasksInSlot(
    remainingTasks,
    busyEvents,
    currentTaskEndTime,
    slotEndTime,
    [...sortedTasks, newTask],
  );
};
