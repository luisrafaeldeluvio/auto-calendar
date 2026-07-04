import {
  eachDayOfInterval,
  getTime,
  interval,
  isBefore,
  isSameDay,
} from "date-fns";
import type { Task, TimeSlot } from "../core/types";
import { scheduleTasks } from "./scheduleTasks";
import type { TasksSchedule } from "./scheduleTasksInSlot";

export const agenda = (
  start: number,
  end: number,
  allTasks: Task[],
  timeSlots: TimeSlot[],
) => {
  const agendaInterval = interval(start, end);

  const dates: number[] = eachDayOfInterval(agendaInterval).map((d) =>
    getTime(d),
  );

  const scheduleAgenda = scheduleTasksInAgenda(dates, allTasks, timeSlots);

  return scheduleAgenda;
};

const scheduleTasksInAgenda = (
  dates: number[],
  allTasks: Task[],
  timeSlots: TimeSlot[],
  scheduled: Task[] = [],
): TasksSchedule => {
  const [date, ...rest] = dates;
  if (!date)
    return {
      sortedTasks: scheduled ?? [],
      queue: allTasks,
    };

  const tasksInDate = allTasks.filter((task) => {
    return (
      isBefore(task.startDate, date) ||
      (isSameDay(task.startDate, date) && isSameDay(task.dueDate, date))
    );
  });

  const scheduleTasksInDate = scheduleTasks(timeSlots, tasksInDate);

  const flatten = scheduleTasksInDate
    .reduce<Task[]>((acc, curr) => [...acc, ...curr.sortedTasks], [])
    .map((t) => {
      // i should probably turn this into a separate function
      return {
        ...t,
        start: date + t.start * 60000,
        end: date + t.end * 60000,
      };
    });

  //     flatten in a key-value pair (record)
  //     like date: flatten.

  const queue = allTasks.filter(
    (task) => !flatten.some((task2) => task.id === task2.id),
  );

  return scheduleTasksInAgenda(rest, queue, timeSlots, [
    ...scheduled,
    ...flatten,
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
