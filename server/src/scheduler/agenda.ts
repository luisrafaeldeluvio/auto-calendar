import { Temporal } from "@js-temporal/polyfill";
import type { Event, TimeSlot } from "../core/types";
import { scheduleTasks } from "./scheduleTasks";
import type { TasksSchedule } from "./scheduleTasksInSlot";

export const eachDayOfInterval = (
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
): Temporal.PlainDate[] => {
  const totalDays = start.until(end, { largestUnit: "day" }).days;

  if (totalDays < 0) return [];

  return Array.from({ length: totalDays + 1 }, (_, index) =>
    start.add({ days: index }),
  );
};

export const agenda = (
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
  allTasks: Event[],
  timeSlots: TimeSlot[],
): TasksSchedule =>
  scheduleTasksInAgenda(eachDayOfInterval(start, end), allTasks, timeSlots);

const scheduleTasksInAgenda = (
  dates: Temporal.PlainDate[],
  allTasks: Event[],
  timeSlots: TimeSlot[],
  scheduled: Event[] = [],
): TasksSchedule => {
  const [date, ...rest] = dates;
  if (!date)
    return {
      sortedTasks: scheduled ?? [],
      queue: allTasks,
    };

  // turn this into a map
  const tasksInDate = allTasks.filter((task) => {
    return (
      Temporal.PlainDateTime.compare(task.startDate ?? {}, date) === -1 ||
      (task.startDate?.equals(date) && task.dueDate?.equals(date))
    );
  });

  const scheduleTasksInDate = scheduleTasks([], tasksInDate, timeSlots);

  // SEPERATION OF CONCERN I SHOULD NOT FLATTEN IT!!!!
  const flatten = scheduleTasksInDate
    .reduce<Event[]>((acc, curr) => [...acc, ...curr.sortedTasks], [])
    .map((t) => {
      // i should probably turn this into a separate function
      return {
        ...t,
        start: date.toPlainDateTime(t.start ?? {}),
        end: date.toPlainDateTime(t.end ?? {}),
      };
    });

  //      in a key-value pair (record)
  //     like date: flatten. (map)

  const queue = allTasks.filter(
    (task) => !flatten.some((task2) => task.id === task2.id),
  );

  return scheduleTasksInAgenda(rest, queue, timeSlots, [
    ...scheduled,
    ...flatten, // because of the map
  ]);
};

// okay i think this is it! we just got to optimize it now!
// TODO:
// - [ ] Optimize code
// - [ ] improve namings
// - [ ] write proper test
// - [ ] write services funtion
// - [x] use Temporal instead of date-fns
// - [x] I was thinking of merging the Event and Task type and just adding a "type" item

// yehh maybe not, let's focus on getting results first before all of this
// - [ ] i should fix the components and hooks for the /client first and get it to work
// - [ ] the db should be handled my /server, use better-sqlite3 or bun's sql later on
