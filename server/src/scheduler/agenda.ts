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

  const flatten = scheduleTasksInDate.reduce<Task[]>(
    (acc, curr) => [...acc, ...curr.sortedTasks],
    [],
  );

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
