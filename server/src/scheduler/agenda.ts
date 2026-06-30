// import { scheduleTasks } from "./scheduleTasks"

import {
  eachDayOfInterval,
  interval,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";
import type { Task, TimeSlot } from "../core/types";
import { scheduleTasks } from "./scheduleTasks";
import type { TasksSchedule } from "./scheduleTasksInSlot";

// we have an array of tasks
// an agenda is like a selection of days (range).

// we then get the tasks that is within that range through their start date and due date(where in this casae startdate and duedate is the range).
//     basically the tasks range must overlap with the agenda rangesOverlap.
// then probably rank them all by priority?

// we then filter the tasks for each day and call scheduleTasks on them.

// ------

// wait do we assign their dates first and THEN run scheduleTasks? \

// so the tasks will be put in the array as the queue

// startDate >= agendaDate && dueDate <= agendaDate
//     getting the tasks that fits per date putting in in an arrayBuffer, then calling scheduleTasks on it.

//     then the left over tasks from scheduleTasks will be put back into the queue

// assuming that allTasks are the filtered tasks

export const agenda = (
  start: Date,
  end: Date,
  allTasks: Task[],
  timeSlots: TimeSlot[],
) => {
  const agendaInterval = interval(start, end);
  console.log(agendaInterval);

  const dates: Date[] = eachDayOfInterval(agendaInterval);
  console.log(dates);

  //   console.log(allTasks);
  const scheduleAgenda = scheduleTasksInAgenda(dates, allTasks, timeSlots);

  return scheduleAgenda;
};

const scheduleTasksInAgenda = (
  dates: Date[],
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

  //   console.log("scheduled tasks in date", flatten);

  const queue = allTasks.filter(
    (task) => !flatten.some((task2) => task.id === task2.id),
  );

  return scheduleTasksInAgenda(rest, queue, timeSlots, [
    ...scheduled,
    ...flatten,
  ]);
};

// what i whant to do is extract the queue tasks on each task schedule,
// so how would i do this?

// loop thorugh the array of task schedule, push the queue to an array and replace the queue with [];

// i think I need to make a new agenda thingy
// for basically managing which tasks go to which date and transferring queued tasks to another date
// in startDate and dueDate

// flow:
// the user create/update/delete a task/event
// the request is transferred to the server
// the server then sends the new tasks order

// okay so after this, i kind of want to build a tui instead of react web,
// i can use Ink TUI to make it, it uses react to display stuff on the terminal.

/* https://github.com/vadimdemedes/ink */
