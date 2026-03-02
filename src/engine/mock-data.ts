import type { TimeSlot, Event, AutoTask, Task } from "./types";
import { addDays, subDays, startOfDay, getTime } from "date-fns";

export const slots: TimeSlot[] = [];

// all the events
export const events: Event[] = [
  {
    id: "e1",
    name: "Team Standup",
    start: 1740218400000, // Feb 22, 10:00 AM
    end: 1740220200000, // Feb 22, 10:30 AM
    isBusy: true,
  },
  {
    id: "e2",
    name: "Deep Work: Engine Logic",
    notes: "Focus on scheduler performance",
    start: 1740304800000, // Feb 23, 10:00 AM
    end: 1740315600000, // Feb 23, 1:00 PM
    isBusy: true,
  },
  {
    id: "e3",
    name: "Lunch Break",
    start: 1740398400000, // Feb 24, 12:00 PM
    end: 1740402000000, // Feb 24, 1:00 PM
    isBusy: false,
  },
  {
    id: "e4",
    name: "Client Call",
    start: 1740495600000, // Feb 25, 3:00 PM
    end: 1740499200000, // Feb 25, 4:00 PM
    isBusy: true,
  },
  {
    id: "e5",
    name: "Gym Session",
    start: 1740589200000, // Feb 26, 5:00 PM
    end: 1740594600000, // Feb 26, 6:30 PM
    isBusy: true,
  },
];

const today = startOfDay(new Date());

export const tasks: AutoTask[] = [
  {
    id: "at-before",
    name: "Completed Yesterday (No Overlap)",
    duration: 60,
    weight: 1,
    slotId: "slot-admin",
    buffer: { before: 0, after: 0 },
    startDate: getTime(subDays(today, 5)),
    dueDate: getTime(subDays(today, 2)), // Ends before test range starts
    start: 540,
    end: 600,
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-overlap-start",
    name: "Started Early, Due Mid-Week (Starts Before, Ends During)",
    duration: 120,
    weight: 3,
    slotId: "slot-work",
    buffer: { before: 15, after: 15 },
    startDate: getTime(subDays(today, 1)),
    dueDate: getTime(addDays(today, 1)), // Overlaps the beginning of the range
    start: 540,
    end: 660,
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-inside",
    name: "Specific Mid-Week Task (Fully Inside)",
    duration: 45,
    weight: 2,
    slotId: "slot-personal",
    buffer: { before: 10, after: 10 },
    startDate: getTime(addDays(today, 1)),
    dueDate: getTime(addDays(today, 2)), // Fully contained within a 3-day window
    start: 1020,
    end: 1065,
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-overlap-end",
    name: "Late Week Sprint (Starts During, Ends After)",
    duration: 180,
    weight: 4,
    slotId: "slot-work",
    buffer: { before: 20, after: 20 },
    startDate: getTime(addDays(today, 2)),
    dueDate: getTime(addDays(today, 5)), // Overlaps the end of the range
    start: 540,
    end: 720,
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-after",
    name: "Next Month Planning (No Overlap)",
    duration: 60,
    weight: 1,
    slotId: "slot-admin",
    buffer: { before: 0, after: 0 },
    startDate: getTime(addDays(today, 10)),
    dueDate: getTime(addDays(today, 12)), // Starts well after the test range
    start: 900,
    end: 960,
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-encompassing",
    name: "Long Term Project (Encompassing)",
    duration: 480,
    weight: 4,
    slotId: "slot-work",
    buffer: { before: 30, after: 30 },
    startDate: getTime(subDays(today, 10)),
    dueDate: getTime(addDays(today, 10)), // Starts before AND ends after the entire range
    start: 480,
    end: 960,
    isDone: false,
    isBusy: true,
  },
];

// the id of tasks to be scheduled
export const queuedTasks: string[] = [];

// the id of the tasks that have been scheduled
export const scheduledTasks: AutoTask[] = [];
