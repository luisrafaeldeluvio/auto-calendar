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

export const queuedTasks: AutoTask[] = [];
export const scheduledTasks: AutoTask[] = [];

// we need another array for task queue (where newly created task will go and tasks than
//     can't be scheduled) and a scheduled task array for tasks that already has a schedule.

//     and another array for events that is in the selected period (2 weeks)
