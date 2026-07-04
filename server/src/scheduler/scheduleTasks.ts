import type { Event, TimeSlot } from "../core/types";
import {
  resolveSlotTaskConflicts,
  splitOverlappingSlots,
} from "./resolveSlotTaskConflicts";
import { scheduleTasksInSlot, type TasksSchedule } from "./scheduleTasksInSlot";

//per day palang ito
export const scheduleTasks = (
  timeSlots: TimeSlot[],
  allTasks: Event[],
  usedSlots: TimeSlot[] = [],
  sortedTasks: TasksSchedule[] = [],
): TasksSchedule[] => {
  const [slot, nextSlot, ...slots] = timeSlots;
  if (!slot) return sortedTasks;

  const tasks = allTasks.filter((t) => t.slotId === slot.id);
  const prevTask = sortedTasks[sortedTasks.length - 1];

  const isOverlapping = nextSlot
    ? splitOverlappingSlots(slot, nextSlot).ok
    : false;

  const sorted = isOverlapping
    ? resolveSlotTaskConflicts(slot, nextSlot!, allTasks)
    : scheduleTasksInSlot(
        tasks,
        prevTask?.sortedTasks ?? [], // why did i set this as events when its supposed to be tasks?
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
