import { Bench } from "tinybench";
import type { TimeSlot, Event, Task, Weight } from "./core/types";
import { agenda } from "./scheduler/agenda";
import { addDays, getTime } from "date-fns";

const slots: TimeSlot[] = [
  { id: "slot1", name: "wholeday", start: 360, end: 1290 },
  { id: "slot2", name: "morning", start: 360, end: 720 },
  { id: "slot3", name: "evening", start: 720, end: 1290 },
  { id: "slot4", name: "night", start: 1080, end: 1290 },
];

const today = getTime(new Date());

const rawTasks = [
  {
    name: "Emergency Hotfix Deployment",
    slotId: "slot1", // wholeday
    priority: 4, // Highest
    duration: 45, // 45 minutes
    startDate: today, // Jul 1, 2026
    dueDate: today, // Jul 1, 2026
  },
  {
    name: "Morning Standup & Task Delegation",
    slotId: "slot2", // morning
    priority: 2,
    duration: 30, // 30 minutes
    startDate: today, // Jul 1, 2026
    dueDate: today, // Jul 1, 2026
  },
  {
    name: "Refactor Authentication Middleware",
    slotId: "slot4", // night
    priority: 3,
    duration: 120, // 2 hours
    startDate: getTime(addDays(today, 1)), // Jul 2, 2026
    dueDate: getTime(addDays(today, 2)), // Jul 3, 2026
  },
  {
    name: "Update Third-Party Dependencies",
    slotId: "slot3", // evening
    priority: 1, // Lowest
    duration: 60, // 1 hour
    startDate: getTime(addDays(today, 2)), // Jul 3, 2026
    dueDate: getTime(addDays(today, 2)), // Jul 3, 2026
  },
  {
    name: "Database Index Optimization",
    slotId: "slot4", // night
    priority: 3,
    duration: 90, // 1.5 hours
    startDate: getTime(addDays(today, 3)), // Jul 4, 2026
    dueDate: getTime(addDays(today, 3)), // Jul 4, 2026
  } /*
  {
    name: "Draft Q3 Product Roadmap",
    slotId: "slot1", // wholeday
    priority: 2,
    duration: 150, // 2.5 hours
    startDate: getTime(addDays(today, 4)), // Jul 5, 2026
    dueDate: getTime(addDays(today, 5)), // Jul 6, 2026
  },
  {
    name: "Critical Infrastructure Patching",
    slotId: "slot4", // night
    priority: 4, // Highest
    duration: 105, // 1 hour 45 minutes
    startDate: getTime(addDays(today, 4)), // Jul 5, 2026
    dueDate: getTime(addDays(today, 4)), // Jul 5, 2026
  },
  {
    name: "UX/UI Design Peer Review",
    slotId: "slot2", // morning
    priority: 2,
    duration: 75, // 1 hour 15 minutes
    startDate: getTime(addDays(today, 5)), // Jul 6, 2026
    dueDate: getTime(addDays(today, 5)), // Jul 6, 2026
  },
  {
    name: "Resolve Memory Leak in Worker Thread",
    slotId: "slot1", // wholeday
    priority: 4, // Highest
    duration: 135, // 2 hours 15 minutes
    startDate: getTime(addDays(today, 6)), // Jul 7, 2026
    dueDate: getTime(addDays(today, 6)), // Jul 7, 2026
  },
  {
    name: "Archive Legacy Log Files",
    slotId: "slot3", // evening
    priority: 1, // Lowest
    duration: 40, // 40 minutes
    startDate: getTime(addDays(today, 6)), // Jul 7, 2026
    dueDate: getTime(addDays(today, 6)), // Jul 7, 2026
  },
  {
    name: "Onboard New Engineering Hire",
    slotId: "slot1", // wholeday
    priority: 3,
    duration: 120, // 2 hours
    startDate: today, // Jul 1, 2026
    dueDate: today, // Jul 1, 2026
  },
  {
    name: "Review Analytics Dashboard Metrics",
    slotId: "slot3", // evening
    priority: 1, // Lowest
    duration: 45, // 45 minutes
    startDate: today, // Jul 1, 2026
    dueDate: getTime(addDays(today, 1)), // Jul 2, 2026
  },
  {
    name: "Sprint Planning Session",
    slotId: "slot2", // morning
    priority: 4, // Highest
    duration: 90, // 1.5 hours
    startDate: getTime(addDays(today, 1)), // Jul 2, 2026
    dueDate: getTime(addDays(today, 1)), // Jul 2, 2026
  },
  {
    name: "Draft Security Compliance Report",
    slotId: "slot1", // wholeday
    priority: 2,
    duration: 150, // 2.5 hours
    startDate: getTime(addDays(today, 2)), // Jul 3, 2026
    dueDate: getTime(addDays(today, 3)), // Jul 4, 2026
  },
  {
    name: "Investigate API Latency Spikes",
    slotId: "slot2", // morning
    priority: 4, // Highest
    duration: 110, // 1 hour 50 minutes
    startDate: getTime(addDays(today, 3)), // Jul 4, 2026
    dueDate: getTime(addDays(today, 3)), // Jul 4, 2026
  },
  {
    name: "Write Unit Tests for Payment Gateway",
    slotId: "slot4", // night
    priority: 3,
    duration: 130, // 2 hours 10 minutes
    startDate: getTime(addDays(today, 3)), // Jul 4, 2026
    dueDate: getTime(addDays(today, 4)), // Jul 5, 2026
  },
  {
    name: "Sanitize Production Database Dumps",
    slotId: "slot4", // night
    priority: 2,
    duration: 60, // 1 hour
    startDate: getTime(addDays(today, 4)), // Jul 5, 2026
    dueDate: getTime(addDays(today, 4)), // Jul 5, 2026
  },
  {
    name: "Optimize CSS and Asset Bundles",
    slotId: "slot3", // evening
    priority: 2,
    duration: 70, // 1 hour 10 minutes
    startDate: getTime(addDays(today, 5)), // Jul 6, 2026
    dueDate: getTime(addDays(today, 5)), // Jul 6, 2026
  },
  {
    name: "Conduct Post-Mortem on Recent Outage",
    slotId: "slot2", // morning
    priority: 4, // Highest
    duration: 100, // 1 hour 40 minutes
    startDate: getTime(addDays(today, 6)), // Jul 7, 2026
    dueDate: getTime(addDays(today, 6)), // Jul 7, 2026
  },
  {
    name: "Update API Public Documentation",
    slotId: "slot1", // wholeday
    priority: 1, // Lowest
    duration: 35, // 35 minutes
    startDate: getTime(addDays(today, 6)), // Jul 7, 2026
    dueDate: getTime(addDays(today, 6)), // Jul 7, 2026
  }, */,
];

export const tasks: Task[] = rawTasks.map((r, i) => {
  return {
    id: `tsk-${i + 1}`,
    name: r.name,
    start: 0,
    end: 0,
    isBusy: true,
    isDone: false,
    isSortable: true,
    duration: r.duration,
    weight: r.priority as Weight,
    slotId: r.slotId,
    buffer: { before: 0, after: 0 },
    startDate: r.startDate,
    dueDate: r.dueDate,
  };
});

const startDate = new Date();
const endDate = addDays(startDate, 7);

const start = getTime(startDate); // ms
const end = getTime(endDate); // ms

console.log(`start: ${startDate}, end: ${endDate}`);
console.log(`start: ${start}, end: ${end}`);

const { sortedTasks, queue } = agenda(start, end, tasks, slots);

// console.log(sortedTasks);
