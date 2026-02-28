import type { TimeSlot, Event, AutoTask } from "./types";

export const slots: TimeSlot[] = [];
export const events: Event[] = [
  {
    id: "1",
    name: "Morning Deep Work",
    start: 300, // 5:00 AM
    end: 420, // 7:00 AM
    isBusy: true,
    buffer: { before: 0, after: 0 },
  },
  {
    id: "2",
    name: "Lunch Break",
    start: 600, // 10:00 AM
    end: 780, // 1:00 PM
    isBusy: false,
    buffer: { before: 0, after: 0 },
  },
  {
    id: "3",
    name: "Client Sync",
    start: 1020, // 5:00 PM
    end: 1260, // 9:00 PM
    isBusy: true,
    buffer: { before: 0, after: 0 },
  },
];

export const queuedTasks: AutoTask[] = [
  { duration: 165, weight: 1 },
  { duration: 127, weight: 1 },
  { duration: 227, weight: 1 },
  { duration: 102, weight: 1 },
  { duration: 215, weight: 1 },
  { duration: 18, weight: 1 },
  { duration: 190, weight: 1 },
  { duration: 196, weight: 1 },
  { duration: 175, weight: 1 },
  { duration: 21, weight: 1 },
  { duration: 119, weight: 1 },
  { duration: 104, weight: 1 },
  { duration: 28, weight: 1 },
  { duration: 188, weight: 1 },
  { duration: 181, weight: 1 },
  { duration: 92, weight: 1 },
  { duration: 58, weight: 1 },
  { duration: 134, weight: 1 },
  { duration: 192, weight: 1 },
  { duration: 5, weight: 1 },
  { duration: 4, weight: 1 },
  { duration: 172, weight: 1 },
  { duration: 227, weight: 1 },
  { duration: 178, weight: 1 },
  { duration: 39, weight: 1 },
  { duration: 131, weight: 1 },
  { duration: 74, weight: 1 },
  { duration: 120, weight: 1 },
  { duration: 195, weight: 2 },
  { duration: 102, weight: 2 },
  { duration: 239, weight: 2 },
  { duration: 177, weight: 2 },
  { duration: 107, weight: 2 },
  { duration: 84, weight: 2 },
  { duration: 70, weight: 2 },
  { duration: 33, weight: 2 },
  { duration: 7, weight: 2 },
  { duration: 42, weight: 2 },
  { duration: 221, weight: 2 },
  { duration: 66, weight: 2 },
  { duration: 46, weight: 2 },
  { duration: 206, weight: 2 },
  { duration: 88, weight: 2 },
  { duration: 223, weight: 2 },
  { duration: 153, weight: 2 },
  { duration: 202, weight: 2 },
  { duration: 192, weight: 2 },
  { duration: 211, weight: 2 },
  { duration: 105, weight: 2 },
  { duration: 165, weight: 2 },
  { duration: 218, weight: 2 },
  { duration: 28, weight: 2 },
  { duration: 99, weight: 2 },
  { duration: 136, weight: 3 },
  { duration: 75, weight: 3 },
  { duration: 179, weight: 3 },
  { duration: 233, weight: 3 },
  { duration: 128, weight: 3 },
  { duration: 20, weight: 3 },
  { duration: 115, weight: 3 },
  { duration: 159, weight: 3 },
  { duration: 174, weight: 3 },
  { duration: 123, weight: 3 },
  { duration: 5, weight: 3 },
  { duration: 222, weight: 3 },
  { duration: 73, weight: 3 },
  { duration: 198, weight: 3 },
  { duration: 109, weight: 3 },
  { duration: 155, weight: 3 },
  { duration: 192, weight: 3 },
  { duration: 16, weight: 3 },
  { duration: 118, weight: 3 },
  { duration: 109, weight: 3 },
  { duration: 190, weight: 3 },
  { duration: 49, weight: 3 },
  { duration: 157, weight: 3 },
  { duration: 47, weight: 3 },
  { duration: 120, weight: 3 },
  { duration: 85, weight: 3 },
  { duration: 232, weight: 3 },
  { duration: 187, weight: 3 },
  { duration: 140, weight: 3 },
  { duration: 22, weight: 3 },
  { duration: 148, weight: 4 },
  { duration: 91, weight: 4 },
  { duration: 24, weight: 4 },
  { duration: 140, weight: 4 },
  { duration: 39, weight: 4 },
  { duration: 73, weight: 4 },
  { duration: 35, weight: 4 },
  { duration: 132, weight: 4 },
  { duration: 11, weight: 4 },
  { duration: 160, weight: 4 },
  { duration: 66, weight: 4 },
  { duration: 136, weight: 4 },
  { duration: 18, weight: 4 },
  { duration: 181, weight: 4 },
  { duration: 42, weight: 4 },
  { duration: 171, weight: 4 },
  { duration: 146, weight: 4 },
];

// Array.from({ length: 100 }, (_, i) => {
//   const rand = Math.floor(Math.random() * 4) + 1;
//   return {
//     // id: crypto.randomUUID(),
//     duration: Math.floor(Math.random() * 240),
//     weight: rand as 1 | 2 | 3 | 4,
//     // isAutoScheduled: true,
//     // name: `Task ${i + 1}`,
//     // description: "",
//     // isBusy: true,
//     // isDone: true,
//     // buffer: { before: 0, after: 0 },
//   };
// });

export const scheduledTasks: AutoTask[] = [];

// we need another array for task queue (where newly created task will go and tasks than
//     can't be scheduled) and a scheduled task array for tasks that already has a schedule.

//     and another array for events that is in the selected period (2 weeks)
