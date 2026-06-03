import type { Result, Task, TimeSlot } from "../core/types";
import { scheduleTasksInSlot, type TasksSchedule } from "./scheduleTasksInSlot";

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

  const sorted = isOverlapping
    ? resolveOverlappingTasksByWeight(slot, nextSlot!, allTasks)
    : scheduleTasksInSlot(
        tasks,
        prevTask?.sortedTasks ?? [],
        slot.start,
        slot.end,
      );

  return scheduleTasks(
    [...(nextSlot ? [nextSlot] : []), ...slots],
    allTasks,
    [{ ...slot }, ...usedSlots],
    [...sortedTasks, { ...sorted }],
  );
};
