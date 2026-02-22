import { TOTAL_TIME } from "./constants";
import type { AutoTask, Result, Event } from "./types";
import { events } from "./mock-data";

type MutationData = { tasks: AutoTask[]; queue: AutoTask[] };

// say this is the queuedTasks
const tasks: AutoTask[] = Array.from({ length: 5 }, (_, i) => {
  const rand = Math.floor(Math.random() * 4) + 1;

  return {
    id: crypto.randomUUID(),
    duration: Math.floor(Math.random() * 240),
    weight: rand as 1 | 2 | 3 | 4,
    isAutoScheduled: true,
    name: `Task ${i + 1}`,
    description: "",
    isBusy: true,
    isDone: true,
    buffer: { before: 0, after: 0 },
  };
});

const scheduleTasks = (
  queuedTasks: AutoTask[],
  activeEvents: Event[],
): Result<MutationData, ""> => {
  let queue: AutoTask[] = []; // leftover queue
  const newTasks = queuedTasks
    .map((e) => ({ ...e }))
    .sort((a, b) => a.weight - b.weight); // scheduled tasks

  // we should probably separate the event handling, lets create an array that
  // checks if the event isBusy, if it is, add its time to an array as an Object.
  // then on the loop check if the assigned time will overlap with the times on the array,
  // probably using the same thing as the overlap checker on timeSlots.js

  const busyEvents = activeEvents
    .filter((e) => e.isBusy)
    .map((e) => ({ start: e.start, end: e.end, duration: e.end - e.start }));

  let usedTime = 0;
  for (let i = 0; i < newTasks.length; i++) {
    const task = newTasks[i];
    if (!task) continue;

    const totalTime = usedTime + task.duration;
    const isOverlap = busyEvents.find(
      (e) => e.end > usedTime && totalTime > e.start,
    );

    if (isOverlap) {
      console.log(`overlap: ${i}; usedTime before: ${usedTime}`);
      usedTime = isOverlap.end; // this needs to be the e.end
      i--;
      console.log(`overlap: ${i}; usedTime after: ${usedTime}`);
      continue;
    }

    if (totalTime > TOTAL_TIME) {
      console.log("overflow");
      queue = newTasks.slice(i);
      newTasks.length = i;
    }

    // we need to check if it overlaps, if it does move the start time (usedTime) to
    // the end time (totalTime) and then increase the total time, and check if it overflows

    // ok this is actually wrong, I was thinking linearly.

    task.start = usedTime;
    task.end = totalTime;
    usedTime = totalTime;
  }

  return {
    ok: true,
    data: { tasks: newTasks, queue: newTasks },
  };
};

// console.log("tasks", tasks);
// console.log("assigned", scheduleTasks(tasks, events));
// console.log("after-tasks", tasks);

const scheduled = scheduleTasks(tasks, events);

if (scheduled.ok) console.log(scheduled.data.tasks);

console.time("heavy-task");
scheduleTasks(tasks, events);
console.timeEnd("heavy-task");

// just plan out the data structure first
// since the auto schedule only occurs in 1 (or 2) week
//

// create an event data that has a toggle (busy) that defaults to true.
//  - when busy, AutoTasks can't be placed there, so they have to find
//  - another area.

// I should implement a days/calendar system. AutoTasks should have
//  a DUE date(default is today at 23:59) and STARTING date(default is today).
// If the task's starting date is more than 2 weeks from now, just set it aside.
// If the task can't be assigned a time, jsut set it aside for now aswell.
