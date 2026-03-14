import type { TimeSlot, Event, AutoTask } from "./types";
import {
  addDays,
  subDays,
  startOfDay,
  setHours,
  setMinutes,
  getTime,
  startOfWeek,
} from "date-fns";

export const slots: TimeSlot[] = [];

const today = startOfDay(new Date());
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });

export const mockEvents: Event[] = [
  {
    id: "ev-1",
    name: "Monday Morning Sync",
    start: getTime(setHours(setMinutes(startOfCurrentWeek, 0), 9)),
    end: getTime(setHours(setMinutes(startOfCurrentWeek, 0), 10)),
    isBusy: true,
  },
  {
    id: "ev-2", // Overlaps 'at-encompassing'
    name: "Deep Work: Project Alpha",
    start: getTime(setHours(addDays(startOfCurrentWeek, 1), 10)),
    end: getTime(setHours(addDays(startOfCurrentWeek, 1), 14)),
    isBusy: true,
  },
  {
    id: "ev-3",
    name: "Quick Coffee Catch-up",
    start: getTime(setHours(addDays(startOfCurrentWeek, 1), 13)),
    end: getTime(setHours(addDays(startOfCurrentWeek, 1), 16)), // Overlaps ev-2
    isBusy: false,
  },
  {
    id: "ev-4", // Overlaps 'at-overlap-start'
    name: "Client Review Meeting",
    start: getTime(setHours(addDays(startOfCurrentWeek, 4), 14)),
    end: getTime(setHours(addDays(startOfCurrentWeek, 4), 16)),
    isBusy: true,
  },
  {
    id: "ev-5",
    name: "Lunch Break",
    start: getTime(setHours(addDays(startOfCurrentWeek, 4), 12)),
    end: getTime(setHours(addDays(startOfCurrentWeek, 4), 13)),
    isBusy: false,
  },
  {
    id: "ev-6", // Overlaps 'at-inside'
    name: "Emergency Server Maintenance",
    start: getTime(setHours(addDays(today, 1), 16)),
    end: getTime(setHours(addDays(today, 1), 18)),
    isBusy: true,
  },
  {
    id: "ev-7",
    name: "Team Brainstorming",
    start: getTime(setHours(addDays(today, 1), 17)),
    end: getTime(setHours(addDays(today, 1), 19)), // Overlaps ev-6
    isBusy: true,
  },
  {
    id: "ev-8",
    name: "Gym Session",
    start: getTime(setHours(addDays(startOfCurrentWeek, 2), 18)),
    end: getTime(setHours(addDays(startOfCurrentWeek, 2), 19)),
    isBusy: false,
  },
  {
    id: "ev-9", // Near 'at-overlap-end'
    name: "Final Sprint Planning",
    start: getTime(setHours(addDays(today, 2), 9)),
    end: getTime(setHours(addDays(today, 2), 11)),
    isBusy: true,
  },
  {
    id: "ev-10",
    name: "Weekly Wrap-up",
    start: getTime(setHours(today, 16)),
    end: getTime(setHours(today, 17)),
    isBusy: true,
  },
];

export const tasks: AutoTask[] = [
  {
    id: "at-before",
    name: "Completed Yesterday (No Overlap)",
    duration: 60,
    weight: 1,
    slotId: "1",
    buffer: { before: 0, after: 0 },
    startDate: getTime(subDays(today, 5)),
    dueDate: getTime(subDays(today, 2)), // Ends before test range starts
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-overlap-start",
    name: "Started Early, Due Mid-Week (Starts Before, Ends During)",
    duration: 120,
    weight: 3,
    slotId: "1",
    buffer: { before: 15, after: 15 },
    startDate: getTime(subDays(today, 1)),
    dueDate: getTime(addDays(today, 1)), // Overlaps the beginning of the range
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-inside",
    name: "Specific Mid-Week Task (Fully Inside)",
    duration: 45,
    weight: 2,
    slotId: "1",
    buffer: { before: 10, after: 10 },
    startDate: getTime(addDays(today, 1)),
    dueDate: getTime(addDays(today, 2)), // Fully contained within a 3-day window
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-overlap-end",
    name: "Late Week Sprint (Starts During, Ends After)",
    duration: 180,
    weight: 4,
    slotId: "1",
    buffer: { before: 20, after: 20 },
    startDate: getTime(addDays(today, 2)),
    dueDate: getTime(addDays(today, 5)), // Overlaps the end of the range
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-after",
    name: "Next Month Planning (No Overlap)",
    duration: 60,
    weight: 1,
    slotId: "1",
    buffer: { before: 0, after: 0 },
    startDate: getTime(addDays(today, 10)),
    dueDate: getTime(addDays(today, 12)), // Starts well after the test range
    isDone: false,
    isBusy: true,
  },
  {
    id: "at-encompassing",
    name: "Long Term Project (Encompassing)",
    duration: 480,
    weight: 4,
    slotId: "1",
    buffer: { before: 30, after: 30 },
    startDate: getTime(subDays(today, 10)),
    dueDate: getTime(addDays(today, 10)), // Starts before AND ends after the entire range
    isDone: false,
    isBusy: true,
  },
];

// the id of tasks to be scheduled
export const queuedTasks: string[] = [];

// the id of the tasks that have been scheduled
export const scheduledTasks: AutoTask[] = [];
