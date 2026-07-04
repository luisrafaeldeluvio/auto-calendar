import { Temporal } from "@js-temporal/polyfill";
import type { Event, Result, TimeSlot } from "../core/types";
import { scheduleTasks } from "./scheduleTasks";
import type { TasksSchedule } from "./scheduleTasksInSlot";

interface Interval {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
}
export const interval = (
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
): Result<Interval, "INVALID_DATE_RANGE"> => {
  if (Temporal.PlainDate.compare(start, end) > 0)
    return { ok: false, error: "INVALID_DATE_RANGE" };
  return {
    ok: true,
    data: { start, end },
  };
};

export const eachDayOfInterval = ({ start, end }: Interval) => {
  const totalDays = start.until(end, { largestUnit: "day" }).days;

  return Array.from({ length: totalDays + 1 }, (_, i) =>
    start.add({ days: i }),
  );
};

export const agenda = (
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
  allTasks: Event[],
  timeSlots: TimeSlot[],
): Result<TasksSchedule, "INVALID_DATE_RANGE"> => {
  const agendaInterval = interval(start, end);
  if (!agendaInterval.ok) return agendaInterval;

  const dates = eachDayOfInterval(agendaInterval.data).map((d) => d);
  console.log(dates);
  return { ok: true, data: scheduleTasksInAgenda(dates, allTasks, timeSlots) };
};

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

  const tasksInDate = allTasks.filter((task) => {
    return (
      Temporal.PlainDateTime.compare(task.startDate ?? {}, date) === -1 ||
      (task.startDate?.equals(date) && task.dueDate?.equals(date))
    );
  });

  const scheduleTasksInDate = scheduleTasks(timeSlots, tasksInDate);

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

  //     flatten in a key-value pair (record)
  //     like date: flatten.

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
// - [ ] use Temporal instead of date-fns
//      - [ ] change duration to use ms aswell
// - [ ] I was thinking of merging the Event and Task type and just adding a "type" item

// yehh maybe not, let's focus on getting results first before all of this
// - [ ] i should fix the components and hooks for the /client first and get it to work
// - [ ] the db should be handled my /server, use better-sqlite3 or bun's sql later on
