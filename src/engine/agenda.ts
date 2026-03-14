import {
  areIntervalsOverlapping,
  eachDayOfInterval,
  getDay,
  startOfWeek,
} from "date-fns/fp";
import type { AutoTask } from "./types";
import { tasks } from "./mock-data";
import { getTime } from "date-fns";
import { scheduleTasks } from "./auto-schedule";

interface Range {
  start: number;
  end: number;
}

type Agenda = Record<
  string,
  {
    tasks: AutoTask[];
    queue: AutoTask[];
  }
>;

interface Timespan {
  id: string;
  range: Range;
  agenda: Agenda;
}

const newTimespan = (tasks: readonly AutoTask[], currentDate: number) => {
  const weekStart = getTime(startOfWeek(currentDate));
  const range = { start: weekStart, end: weekStart + 547200000 };

  const timespan: Timespan = {
    id: crypto.randomUUID(),
    range: range,
    agenda: generateAgenda(tasks, range),
  };

  return timespan;
};

// for the agenda, since tasks have start and due date

// say the selected day is monday, so it has value of 1.
// the tasks priority is normal, which is 1
// then the due date is also on monday, we reduce it ? 1-1 = 0

// another task: priority is normal
// due date is isTuesday, 2 = 1-2 = -1

// so this means that that it will prioritize the first task 0 > -1

// another tasks priority is high, which is 2
// then the due date is also on monday, we reduce it ? 2-1 = 1

// another test: say the chosen date is tuesday which is 2
// task is normal and due date is also thursday which is 4
// 1 - 4 = -3

// what if due date is tuesday - 2
// 1 - 2 = -1

// wait so is the chosen due date just reduce by 1? so that means that
// if the chosen day is tuesday, anything over 0 is past their due date.

// so the getActiveTasks is correct

// then we need to sort them out, thats where the priority thing will go.

// how will we decide how much task should be put in the day? since value of '0'
// means its due today, we should be putting tasks on the day where their value is
// more than or equal to 0.

const getActiveTasks = (tasks: readonly AutoTask[], range: Readonly<Range>) =>
  tasks.filter((t) =>
    areIntervalsOverlapping(range)({ start: t.startDate, end: t.dueDate }),
  );

const getRange = (currentDate: number) => {
  const weekStart = getTime(startOfWeek(currentDate));
  return { start: weekStart, end: weekStart + 547200000 };
};

const generateAgenda = (tasks: readonly AutoTask[], range: Readonly<Range>) => {
  const rangeArr = eachDayOfInterval(range);

  const agenda = rangeArr.reduce(
    (acc, r) => {
      const ranked = tasks.filter((t) => {
        const rank = t.weight - getDay(t.dueDate);
        const targetDay = getDay(r) - 1;

        if (rank >= targetDay) return true;
      });

      return {
        ...acc,
        [getTime(r)]: {
          tasks: [],
          queue: ranked,
        },
      };
    },
    {} as Record<
      number,
      {
        tasks: AutoTask[];
        queue: AutoTask[];
      }
    >,
  );

  return agenda;
};

// ----------------------------

const activeTasks = getActiveTasks(tasks, getRange(getTime(new Date())));

export const timespan = newTimespan(activeTasks, Date.now());

const getTask = (id: string) => tasks.filter((t) => t.id === id);

const scheduleTimespan = (timespan: Readonly<Timespan>) => {
  const newAgenda: Agenda = Object.entries(timespan.agenda).reduce(
    (acc, [day, { tasks, queue }]) => {
      const scheduled = scheduleTasks(
        queue,
        [],
        [
          {
            id: "1",
            name: "ALL DAY",
            start: 0,
            end: 1440,
          },
        ],
      );

      if (scheduled.ok) {
        return {
          ...acc,
          [day]: {
            tasks: scheduled.data.tasks,
            queue: scheduled.data.queue,
          },
        };
      } else {
        return {
          ...acc,
          [day]: {
            tasks: tasks,
            queue: queue,
          },
        };
      }
    },
    {} as Agenda,
  );

  return { ...timespan, agenda: newAgenda } as Timespan;
};

export const scheduledTimespan = scheduleTimespan(timespan);

// console.log(JSON.stringify(scheduleTimespan(timespan), null, 2));

// scheduleTasks(
//   activeTasks,
//   [],
//   [
//     {
//       id: "1",
//       name: "ALL DAY",
//       start: 0,
//       end: 1440,
//     },
//   ],
// );

// const y = newTimespan(getTime(new Date()));

// console.time("heavy-task");
// const x = getActiveTasks(tasks, y.range);
// console.timeEnd("heavy-task");

// ----------------------------------------

// now i need to make a function for sorting the tasks with autoSchedule()
// they will still be in the timespan object, just sorted. That means that
// I will need to create a new timespan object when doing that (fp).

// But then how will it be displayed, since the start and time of tasks in ms since 00:00
// when rendering the task in the Calendar, i just need to add the value of their key dates
// to their start and time.

// So essentially, the time changes will only be displayed on the front end.

// -----------------

// TODO:
// - [ ] try to create a function that displays them on the calendar
// - [ ]  we need to create a function for organiing them first
