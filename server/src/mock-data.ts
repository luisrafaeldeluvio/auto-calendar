import type { Task, TimeSlot } from "./core/types";

export const slot_normal: TimeSlot = {
  id: "1",
  name: "slot1",
  start: 0,
  end: 180,
}; // 1AM - 3AM
export const slot_intersect_with_normal: TimeSlot = {
  id: "2",
  name: "slot2",
  start: 120,
  end: 240,
}; // 2AM - 4AM

export const all_tasks = [
  {
    id: "1",
    name: "Task1",
    duration: 60,
    weight: 1,
    slotId: "1",
  },
  {
    id: "2",
    name: "Task2",
    duration: 120,
    weight: 1,
    slotId: "1",
  },
  {
    id: "3",
    name: "Task3",
    duration: 60,
    weight: 1,
    slotId: "2",
  },
].map((t) => {
  return {
    ...t,
    notes: "",
    start: 0,
    end: 0,
    isBusy: true,
    isDone: false,
    isSortable: true,
    buffer: { before: 0, after: 0 },
    startDate: 0,
    dueDate: 0,
  } as Task;
});
