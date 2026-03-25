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

export const slots: TimeSlot[] = [
  {
    id: "1",
    name: "whole day",
    start: 0,
    end: 1440,
  },
  {
    id: "2",
    name: "day",
    start: 360,
    end: 720,
  },
  {
    id: "3",
    name: "night",
    start: 960,
    end: 1440,
  },
];

const today = startOfDay(new Date());
const startOfCurrentWeek = startOfWeek(today);

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
    id: "task1",
    name: "Task 1",
    duration: 60,
    weight: 1,
    slotId: "3",
    buffer: { before: 0, after: 0 },
    startDate: getTime(subDays(startOfCurrentWeek, 1)), // Saturday
    dueDate: getTime(addDays(startOfCurrentWeek, 1)), // Monday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task2",
    name: "Task 2",
    duration: 120,
    weight: 3,
    slotId: "3",
    buffer: { before: 15, after: 15 },
    startDate: getTime(addDays(startOfCurrentWeek, 0)), // Sunday
    dueDate: getTime(addDays(startOfCurrentWeek, 3)), // Wednesday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task3",
    name: "Task 3",
    duration: 45,
    weight: 2,
    slotId: "3",
    buffer: { before: 10, after: 10 },
    startDate: getTime(addDays(startOfCurrentWeek, 2)), // Tuesday
    dueDate: getTime(addDays(startOfCurrentWeek, 4)), // Thursday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task4",
    name: "Task 4",
    duration: 180,
    weight: 4,
    slotId: "3",
    buffer: { before: 20, after: 20 },
    startDate: getTime(addDays(startOfCurrentWeek, 4)), // Thursday
    dueDate: getTime(addDays(startOfCurrentWeek, 6)), // Saturday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task5",
    name: "Task 5",
    duration: 60,
    weight: 1,
    slotId: "3",
    buffer: { before: 0, after: 0 },
    startDate: getTime(addDays(startOfCurrentWeek, 3)), // Wednesday
    dueDate: getTime(addDays(startOfCurrentWeek, 5)), // Friday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task6",
    name: "Task 6",
    duration: 480,
    weight: 4,
    slotId: "3",
    buffer: { before: 30, after: 30 },
    startDate: getTime(addDays(startOfCurrentWeek, 0)), // Sunday
    dueDate: getTime(addDays(startOfCurrentWeek, 6)), // Saturday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task7",
    name: "Task 7",
    duration: 60,
    weight: 1,
    slotId: "3",
    buffer: { before: 0, after: 0 },
    startDate: getTime(subDays(startOfCurrentWeek, 1)), // Saturday
    dueDate: getTime(addDays(startOfCurrentWeek, 1)), // Monday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task8",
    name: "Task 8",
    duration: 120,
    weight: 3,
    slotId: "3",
    buffer: { before: 15, after: 15 },
    startDate: getTime(addDays(startOfCurrentWeek, 0)), // Sunday
    dueDate: getTime(addDays(startOfCurrentWeek, 3)), // Wednesday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task9",
    name: "Task 9",
    duration: 45,
    weight: 2,
    slotId: "3",
    buffer: { before: 10, after: 10 },
    startDate: getTime(addDays(startOfCurrentWeek, 2)), // Tuesday
    dueDate: getTime(addDays(startOfCurrentWeek, 4)), // Thursday
    isDone: false,
    isBusy: true,
  },
  // Additional tasks
  {
    id: "task10",
    name: "Task 10 (Full Week Coverage)",
    duration: 300,
    weight: 4,
    slotId: "3",
    buffer: { before: 30, after: 30 },
    startDate: getTime(subDays(startOfCurrentWeek, 1)), // Saturday (before week starts)
    dueDate: getTime(addDays(startOfCurrentWeek, 6)), // Saturday (end of week)
    isDone: false,
    isBusy: true,
  },
  {
    id: "task11",
    name: "Task 11 (Mid-Week Sprint)",
    duration: 180,
    weight: 3,
    slotId: "3",
    buffer: { before: 20, after: 20 },
    startDate: getTime(addDays(startOfCurrentWeek, 1)), // Monday
    dueDate: getTime(addDays(startOfCurrentWeek, 5)), // Friday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task12",
    name: "Task 12 (Late Week Push)",
    duration: 90,
    weight: 2,
    slotId: "3",
    buffer: { before: 5, after: 5 },
    startDate: getTime(addDays(startOfCurrentWeek, 3)), // Wednesday
    dueDate: getTime(addDays(startOfCurrentWeek, 6)), // Saturday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task13",
    name: "Task 13 (Early Week Quickie)",
    duration: 30,
    weight: 1,
    slotId: "3",
    buffer: { before: 0, after: 0 },
    startDate: getTime(subDays(startOfCurrentWeek, 1)), // Saturday
    dueDate: getTime(addDays(startOfCurrentWeek, 2)), // Tuesday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task14",
    name: "Task 14 (Weekend Wrap-up)",
    duration: 60,
    weight: 1,
    slotId: "3",
    buffer: { before: 10, after: 10 },
    startDate: getTime(addDays(startOfCurrentWeek, 5)), // Friday
    dueDate: getTime(addDays(startOfCurrentWeek, 6)), // Saturday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task15",
    name: "Task 15 (Sunday-Monday Blitz)",
    duration: 75,
    weight: 2,
    slotId: "3",
    buffer: { before: 5, after: 5 },
    startDate: getTime(addDays(startOfCurrentWeek, 0)), // Sunday
    dueDate: getTime(addDays(startOfCurrentWeek, 1)), // Monday
    isDone: false,
    isBusy: true,
  },
  {
    id: "task16",
    name: "Task 16 (Tiny Tuesday Task)",
    duration: 15,
    weight: 1,
    slotId: "3",
    buffer: { before: 0, after: 0 },
    startDate: getTime(addDays(startOfCurrentWeek, 2)), // Tuesday
    dueDate: getTime(addDays(startOfCurrentWeek, 3)), // Wednesday
    isDone: false,
    isBusy: true,
  },
];

// the id of tasks to be scheduled
export const queuedTasks: string[] = [];

// the id of the tasks that have been scheduled
export const scheduledTasks: AutoTask[] = [];
